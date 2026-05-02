// ============================================
// ARCHIVO: backend/src/routes/course.routes.ts
// ============================================

import express from 'express';
import { CourseController, ModuleController, LessonController } from '../controllers/course.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// ===== RUTAS DE CURSOS =====
router.get('/', CourseController.getCourses);
router.post('/', authenticate, authorize('tutor', 'admin'), CourseController.createCourse);

// ✅ Rutas específicas PRIMERO (antes de /:id)
router.post('/:id/publish', authenticate, authorize('tutor', 'admin'), CourseController.publishCourse);
router.patch('/:id/toggle-status', authenticate, authorize('admin'), CourseController.toggleCourseStatus);

// ✅ Rutas genéricas DESPUÉS
router.get('/:id', CourseController.getCourseById);
router.put('/:id', authenticate, authorize('tutor', 'admin'), CourseController.updateCourse);
router.delete('/:id', authenticate, authorize('tutor', 'admin'), CourseController.deleteCourse);

// ===== RUTAS DE MÓDULOS =====
router.get('/:courseId/modules', ModuleController.getCourseModules);
router.post('/:courseId/modules', authenticate, authorize('tutor', 'admin'), ModuleController.createModule);

// ===== RUTAS DE LECCIONES =====
router.post('/modules/:moduleId/lessons', authenticate, authorize('tutor', 'admin'), LessonController.createLesson);
router.get('/lessons/:id', authenticate, LessonController.getLessonById);
router.post('/lessons/:id/videos', authenticate, authorize('tutor', 'admin'), LessonController.addVideo);
router.post('/lessons/:id/documents', authenticate, authorize('tutor', 'admin'), LessonController.addDocument);

export default router;
