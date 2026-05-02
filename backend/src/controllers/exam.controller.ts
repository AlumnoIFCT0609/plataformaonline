// ============================================
// ARCHIVO: backend/src/controllers/exam.controller.ts
// ============================================

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ExamService } from '../services/exam.service';

export class ExamController {
  static async createExam(req: AuthRequest, res: Response) {
    try {
      const tutorId = req.user?.userId;
      const courseId = req.params.courseId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const exam = await ExamService.createExam(tutorId, {
        courseId,
        ...req.body,
      });

      res.status(201).json(exam);
    } catch (error: any) {
      console.error('Error en createExam:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getCourseExams(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.courseId;
      const exams = await ExamService.getCourseExams(courseId);
      res.json(exams);
    } catch (error: any) {
      console.error('Error en getCourseExams:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getExamById(req: AuthRequest, res: Response) {
    try {
      const examId = req.params.id;
      const userRole = req.user?.role;
      
      const includeAnswers = userRole === 'tutor' || userRole === 'admin';

      const exam = await ExamService.getExamById(examId, includeAnswers);
      res.json(exam);
    } catch (error: any) {
      console.error('Error en getExamById:', error);
      res.status(404).json({ error: error.message });
    }
  }

  static async addQuestion(req: AuthRequest, res: Response) {
    try {
      const examId = req.params.examId;
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const question = await ExamService.addQuestion(examId, tutorId, req.body);
      res.status(201).json(question);
    } catch (error: any) {
      console.error('Error en addQuestion:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async publishExam(req: AuthRequest, res: Response) {
    try {
      const examId = req.params.id;
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await ExamService.publishExam(examId, tutorId);
      res.json({ message: 'Examen publicado exitosamente' });
    } catch (error: any) {
      console.error('Error en publishExam:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async submitExam(req: AuthRequest, res: Response) {
    try {
      const examId = req.params.id;
      const studentId = req.user?.userId;

      if (!studentId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ error: 'Respuestas inválidas' });
      }

      const result = await ExamService.submitExam(examId, studentId, answers);
      res.json(result);
    } catch (error: any) {
      console.error('Error en submitExam:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async gradeSubmission(req: AuthRequest, res: Response) {
    try {
      const submissionId = req.params.submissionId;
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const result = await ExamService.gradeSubmission(submissionId, tutorId, req.body);
      res.json(result);
    } catch (error: any) {
      console.error('Error en gradeSubmission:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getStudentSubmissions(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.userId;
      const courseId = req.query.courseId as string;

      if (!studentId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const submissions = await ExamService.getStudentSubmissions(studentId, courseId);
      res.json(submissions);
    } catch (error: any) {
      console.error('Error en getStudentSubmissions:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getPendingGrading(req: AuthRequest, res: Response) {
    try {
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const submissions = await ExamService.getPendingGrading(tutorId);
      res.json(submissions);
    } catch (error: any) {
      console.error('Error en getPendingGrading:', error);
      res.status(400).json({ error: error.message });
    }
  }
}