// ============================================
// ARCHIVO: backend/src/routes/exam.routes.ts
// ============================================

import express from 'express';
import { ExamController } from '../controllers/exam.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Crear examen
router.post(
  '/courses/:courseId/exams',
  authenticate,
  authorize('tutor', 'admin'),
  ExamController.createExam
);

// Obtener exámenes del curso
router.get(
  '/courses/:courseId/exams',
  authenticate,
  ExamController.getCourseExams
);

// Obtener examen por ID
router.get('/:id', authenticate, ExamController.getExamById);

// Agregar pregunta
router.post(
  '/:examId/questions',
  authenticate,
  authorize('tutor', 'admin'),
  ExamController.addQuestion
);

// Publicar examen
router.post(
  '/:id/publish',
  authenticate,
  authorize('tutor', 'admin'),
  ExamController.publishExam
);

// Enviar respuestas
router.post('/:id/submit', authenticate, ExamController.submitExam);

// Calificar envío
router.post(
  '/submissions/:submissionId/grade',
  authenticate,
  authorize('tutor', 'admin'),
  ExamController.gradeSubmission
);

// Obtener envíos del estudiante
router.get(
  '/students/submissions',
  authenticate,
  ExamController.getStudentSubmissions
);

// Obtener envíos pendientes (tutor)
router.get(
  '/tutors/pending-grading',
  authenticate,
  authorize('tutor', 'admin'),
  ExamController.getPendingGrading
);

export default router;