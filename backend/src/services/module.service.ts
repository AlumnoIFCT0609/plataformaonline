
// ============================================
// MODULE & LESSON SERVICE
// ============================================

export class ModuleService {
  // Create module
  static async createModule(data: {
    courseId: string;
    tutorId: string;
    title: string;
    description?: string;
    orderIndex: number;
  }) {
    // Verify course ownership
    const course = await pool.query('SELECT tutor_id FROM courses WHERE id = $1', [
      data.courseId,
    ]);

    if (course.rows.length === 0 || course.rows[0].tutor_id !== data.tutorId) {
      throw new Error('Unauthorized');
    }

    const result = await pool.query(
      `INSERT INTO course_modules (course_id, title, description, order_index)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.courseId, data.title, data.description || '', data.orderIndex]
    );

    return result.rows[0];
  }

  // Get course modules
  static async getCourseModules(courseId: string) {
    const result = await pool.query(
      `SELECT 
        cm.*,
        COUNT(l.id) as lessons_count
       FROM course_modules cm
       LEFT JOIN lessons l ON l.module_id = cm.id
       WHERE cm.course_id = $1
       GROUP BY cm.id
       ORDER BY cm.order_index`,
      [courseId]
    );

    return result.rows;
  }
}

export class LessonService {
  // Create lesson
  static async createLesson(data: {
    moduleId: string;
    title: string;
    content?: string;
    orderIndex: number;
    durationMinutes?: number;
    isFree?: boolean;
  }) {
    const result = await pool.query(
      `INSERT INTO lessons (module_id, title, content, order_index, duration_minutes, is_free)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.moduleId,
        data.title,
        data.content || '',
        data.orderIndex,
        data.durationMinutes || 0,
        data.isFree || false,
      ]
    );

    return result.rows[0];
  }

  // Add video to lesson
  static async addVideo(lessonId: string, videoData: {
    title?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    durationSeconds?: number;
    sizeBytes?: number;
  }) {
    const result = await pool.query(
      `INSERT INTO lesson_videos (lesson_id, title, video_url, thumbnail_url, duration_seconds, size_bytes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        lessonId,
        videoData.title || '',
        videoData.videoUrl,
        videoData.thumbnailUrl || null,
        videoData.durationSeconds || 0,
        videoData.sizeBytes || 0,
      ]
    );

    return result.rows[0];
  }

  // Get lesson with content
  static async getLessonById(lessonId: string) {
    const lesson = await pool.query('SELECT * FROM lessons WHERE id = $1', [lessonId]);

    if (lesson.rows.length === 0) {
      throw new Error('Lesson not found');
    }

    const videos = await pool.query('SELECT * FROM lesson_videos WHERE lesson_id = $1', [
      lessonId,
    ]);

    const documents = await pool.query(
      'SELECT * FROM lesson_documents WHERE lesson_id = $1',
      [lessonId]
    );

    return {
      ...lesson.rows[0],
      videos: videos.rows,
      documents: documents.rows,
    };
  }
}
