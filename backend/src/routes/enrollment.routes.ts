// ============================================
// ARCHIVO: backend/src/routes/enrollment.routes.ts
// ============================================

import express from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Rutas de estudiantes
router.post('/', authenticate, EnrollmentController.requestEnrollment);
router.get('/', authenticate, EnrollmentController.getMyEnrollments);

// Rutas de tutores
router.get(
  '/courses/:courseId/enrollments',
  authenticate,
  authorize('tutor', 'admin'),
  EnrollmentController.getCourseEnrollments
);

router.post(
  '/:id/approve',
  authenticate,
  authorize('tutor', 'admin'),
  EnrollmentController.approveEnrollment
);

router.post(
  '/:id/reject',
  authenticate,
  authorize('tutor', 'admin'),
  EnrollmentController.rejectEnrollment
);

// Progreso
router.get('/:id/progress', authenticate, EnrollmentController.getEnrollmentProgress);

router.post(
  '/:enrollmentId/lessons/:lessonId/complete',
  authenticate,
  EnrollmentController.markLessonComplete
);

export default router;