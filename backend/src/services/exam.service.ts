// ============================================
// EXAM SERVICE
// ============================================

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface CreateExamDTO {
  courseId: string;
  moduleId?: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  availableFrom?: Date;
  availableUntil?: Date;
}

interface Question {
  id: string;
  questionText: string;
  questionType: 'multiple_choice' | 'short_answer' | 'essay';
  points: number;
  orderIndex: number;
  options?: QuestionOption[];
}

interface QuestionOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export class ExamService {
  // Create exam
  static async createExam(tutorId: string, data: CreateExamDTO) {
    // Verify course ownership
    const course = await pool.query('SELECT tutor_id FROM courses WHERE id = $1', [
      data.courseId,
    ]);

    if (course.rows.length === 0 || course.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    const result = await pool.query(
      `INSERT INTO exams (
        course_id, module_id, title, description, 
        duration_minutes, passing_score, max_attempts,
        available_from, available_until
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        data.courseId,
        data.moduleId || null,
        data.title,
        data.description || '',
        data.durationMinutes || 60,
        data.passingScore || 70,
        data.maxAttempts || 1,
        data.availableFrom || null,
        data.availableUntil || null,
      ]
    );

    return result.rows[0];
  }

  // Add question to exam
  static async addQuestion(
    examId: string,
    tutorId: string,
    questionData: {
      questionText: string;
      questionType: 'multiple_choice' | 'short_answer' | 'essay';
      points: number;
      orderIndex: number;
      options?: Array<{ optionText: string; isCorrect: boolean }>;
    }
  ) {
    // Verify exam ownership
    const exam = await pool.query(
      `SELECT c.tutor_id 
       FROM exams e
       JOIN courses c ON c.id = e.course_id
       WHERE e.id = $1`,
      [examId]
    );

    if (exam.rows.length === 0 || exam.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    // Insert question
    const questionResult = await pool.query(
      `INSERT INTO questions (exam_id, question_text, question_type, points, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        examId,
        questionData.questionText,
        questionData.questionType,
        questionData.points,
        questionData.orderIndex,
      ]
    );

    const question = questionResult.rows[0];

    // Insert options if multiple choice
    if (questionData.questionType === 'multiple_choice' && questionData.options) {
      for (let i = 0; i < questionData.options.length; i++) {
        const option = questionData.options[i];
        await pool.query(
          `INSERT INTO question_options (question_id, option_text, is_correct, order_index)
           VALUES ($1, $2, $3, $4)`,
          [question.id, option.optionText, option.isCorrect, i]
        );
      }
    }

    return question;
  }

  // Get exam with questions
  static async getExamById(examId: string, includeAnswers: boolean = false) {
    const examResult = await pool.query('SELECT * FROM exams WHERE id = $1', [examId]);

    if (examResult.rows.length === 0) {
      throw new Error('Exam not found');
    }

    const exam = examResult.rows[0];

    // Get questions
    const questionsQuery = `
      SELECT * FROM questions
      WHERE exam_id = $1
      ORDER BY order_index
    `;
    const questionsResult = await pool.query(questionsQuery, [examId]);

    // Get options for each question
    const questions: Question[] = [];
    for (const question of questionsResult.rows) {
      const optionsQuery = includeAnswers
        ? 'SELECT * FROM question_options WHERE question_id = $1 ORDER BY order_index'
        : 'SELECT id, option_text, order_index FROM question_options WHERE question_id = $1 ORDER BY order_index';

      const optionsResult = await pool.query(optionsQuery, [question.id]);

      questions.push({
        ...question,
        options: optionsResult.rows,
      });
    }

    return {
      ...exam,
      questions,
    };
  }

  // Submit exam
  static async submitExam(
    examId: string,
    studentId: string,
    answers: Array<{
      questionId: string;
      selectedOptionId?: string;
      answerText?: string;
    }>
  ) {
    // Check if student is enrolled
    const enrollment = await pool.query(
      `SELECT e.id 
       FROM enrollments e
       JOIN exams ex ON ex.course_id = e.course_id
       WHERE ex.id = $1 AND e.student_id = $2 AND e.status = 'approved'`,
      [examId, studentId]
    );

    if (enrollment.rows.length === 0) {
      throw new Error('Not enrolled in this course');
    }

    // Check attempt count
    const exam = await pool.query('SELECT max_attempts FROM exams WHERE id = $1', [examId]);
    const attempts = await pool.query(
      'SELECT COUNT(*) as count FROM exam_submissions WHERE exam_id = $1 AND student_id = $2',
      [examId, studentId]
    );

    const attemptCount = parseInt(attempts.rows[0].count);
    if (attemptCount >= exam.rows[0].max_attempts) {
      throw new Error('Maximum attempts reached');
    }

    // Create submission
    const submissionResult = await pool.query(
      `INSERT INTO exam_submissions (exam_id, student_id, attempt_number, started_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
      [examId, studentId, attemptCount + 1]
    );

    const submission = submissionResult.rows[0];

    // Process answers and calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const answer of answers) {
      const question = await pool.query(
        'SELECT question_type, points FROM questions WHERE id = $1',
        [answer.questionId]
      );

      if (question.rows.length === 0) continue;

      const { question_type, points } = question.rows[0];
      totalPoints += points;

      let pointsEarned = 0;

      // Auto-grade multiple choice
      if (question_type === 'multiple_choice' && answer.selectedOptionId) {
        const option = await pool.query(
          'SELECT is_correct FROM question_options WHERE id = $1',
          [answer.selectedOptionId]
        );

        if (option.rows.length > 0 && option.rows[0].is_correct) {
          pointsEarned = points;
          earnedPoints += points;
        }
      }

      // Save answer
      await pool.query(
        `INSERT INTO submission_answers (
          submission_id, question_id, selected_option_id, answer_text, points_earned
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          submission.id,
          answer.questionId,
          answer.selectedOptionId || null,
          answer.answerText || null,
          question_type === 'multiple_choice' ? pointsEarned : null,
        ]
      );
    }

    // Calculate final score
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Check if needs manual grading
    const hasOpenQuestions = await pool.query(
      `SELECT COUNT(*) as count
       FROM questions q
       JOIN submission_answers sa ON sa.question_id = q.id
       WHERE sa.submission_id = $1 AND q.question_type IN ('short_answer', 'essay')`,
      [submission.id]
    );

    const status =
      parseInt(hasOpenQuestions.rows[0].count) > 0 ? 'pending' : 'graded';

    // Update submission
    await pool.query(
      `UPDATE exam_submissions
       SET submitted_at = CURRENT_TIMESTAMP, 
           score = $1, 
           status = $2,
           graded_at = CASE WHEN $2 = 'graded' THEN CURRENT_TIMESTAMP ELSE NULL END
       WHERE id = $3`,
      [status === 'graded' ? score : null, status, submission.id]
    );

    return {
      submissionId: submission.id,
      score: status === 'graded' ? score : null,
      status,
      needsManualGrading: status === 'pending',
    };
  }

  // Grade submission (for open-ended questions)
  static async gradeSubmission(
    submissionId: string,
    tutorId: string,
    grading: {
      answers: Array<{
        answerId: string;
        pointsEarned: number;
        feedback?: string;
      }>;
      overallFeedback?: string;
    }
  ) {
    // Verify ownership
    const submission = await pool.query(
      `SELECT es.*, c.tutor_id
       FROM exam_submissions es
       JOIN exams e ON e.id = es.exam_id
       JOIN courses c ON c.id = e.course_id
       WHERE es.id = $1`,
      [submissionId]
    );

    if (submission.rows.length === 0 || submission.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    // Grade each answer
    for (const answer of grading.answers) {
      await pool.query(
        `UPDATE submission_answers
         SET points_earned = $1, feedback = $2
         WHERE id = $3`,
        [answer.pointsEarned, answer.feedback || null, answer.answerId]
      );
    }

    // Calculate total score
    const scoreResult = await pool.query(
      `SELECT 
        SUM(q.points) as total_points,
        SUM(sa.points_earned) as earned_points
       FROM submission_answers sa
       JOIN questions q ON q.id = sa.question_id
       WHERE sa.submission_id = $1`,
      [submissionId]
    );

    const { total_points, earned_points } = scoreResult.rows[0];
    const score = total_points > 0 ? (earned_points / total_points) * 100 : 0;

    // Update submission
    await pool.query(
      `UPDATE exam_submissions
       SET score = $1, 
           status = 'graded',
           graded_at = CURRENT_TIMESTAMP,
           graded_by = $2,
           feedback = $3
       WHERE id = $4`,
      [score, tutorId, grading.overallFeedback || null, submissionId]
    );

    return { score };
  }

  // Get student submissions
  static async getStudentSubmissions(studentId: string, courseId?: string) {
    let query = `
      SELECT 
        es.*,
        e.title as exam_title,
        e.passing_score,
        c.title as course_title
      FROM exam_submissions es
      JOIN exams e ON e.id = es.exam_id
      JOIN courses c ON c.id = e.course_id
      WHERE es.student_id = $1
    `;

    const params: any[] = [studentId];

    if (courseId) {
      query += ' AND c.id = $2';
      params.push(courseId);
    }

    query += ' ORDER BY es.submitted_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Get pending grading for tutor
  static async getPendingGrading(tutorId: string) {
    const result = await pool.query(
      `SELECT 
        es.*,
        e.title as exam_title,
        c.title as course_title,
        u.first_name || ' ' || u.last_name as student_name
       FROM exam_submissions es
       JOIN exams e ON e.id = es.exam_id
       JOIN courses c ON c.id = e.course_id
       JOIN users u ON u.id = es.student_id
       WHERE c.tutor_id = $1 AND es.status = 'pending'
       ORDER BY es.submitted_at ASC`,
      [tutorId]
    );

    return result.rows;
  }

  // Publish exam
  static async publishExam(examId: string, tutorId: string) {
    const exam = await pool.query(
      `SELECT c.tutor_id 
       FROM exams e
       JOIN courses c ON c.id = e.course_id
       WHERE e.id = $1`,
      [examId]
    );

    if (exam.rows.length === 0 || exam.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    // Check if exam has questions
    const questions = await pool.query(
      'SELECT COUNT(*) as count FROM questions WHERE exam_id = $1',
      [examId]
    );

    if (parseInt(questions.rows[0].count) === 0) {
      throw new Error('Cannot publish exam without questions');
    }

    await pool.query(`UPDATE exams SET status = 'published' WHERE id = $1`, [examId]);
  }
  /**
 * Obtener exámenes del curso
 */
static async getCourseExams(courseId: string) {
  const result = await pool.query(
    `SELECT 
      e.*,
      COUNT(q.id) as questions_count
     FROM exams e
     LEFT JOIN questions q ON q.exam_id = e.id
     WHERE e.course_id = $1
     GROUP BY e.id
     ORDER BY e.created_at DESC`,
    [courseId]
  );

  return result.rows;
}


}