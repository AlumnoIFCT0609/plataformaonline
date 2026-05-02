// ============================================
// ARCHIVO: backend/src/routes/index.ts
// ============================================

import express from 'express';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import examRoutes from './exam.routes';
import forumRoutes from './forum.routes';
import userRoutes from './user.routes';
import enrollmentRoutes from './enrollment.routes';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/exams', examRoutes);
router.use('/forum', forumRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/users', userRoutes);

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    path: req.originalUrl,
  });
});

export default router;