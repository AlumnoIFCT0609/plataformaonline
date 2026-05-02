// ============================================
// ARCHIVO: backend/src/controllers/enrollment.controller.ts
// ============================================

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import pool from '../config/database';

export class EnrollmentController {
  /**
   * Solicitar inscripción a un curso
   * POST /api/v1/enrollments
   */
  static async requestEnrollment(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.userId;
      const { courseId } = req.body;

      if (!studentId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      if (!courseId) {
        return res.status(400).json({ error: 'courseId es requerido' });
      }

      // Verificar si el curso existe
      const course = await pool.query(
        'SELECT id, enrollment_auto_approve FROM courses WHERE id = $1',
        [courseId]
      );

      if (course.rows.length === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      // Verificar si ya está inscrito
      const existing = await pool.query(
        'SELECT id, status FROM enrollments WHERE student_id = $1 AND course_id = $2',
        [studentId, courseId]
      );

      if (existing.rows.length > 0) {
        return res.status(400).json({ 
          error: 'Ya estás inscrito en este curso',
          status: existing.rows[0].status
        });
      }

      // Determinar el estado inicial
      const autoApprove = course.rows[0].enrollment_auto_approve;
      const status = autoApprove ? 'approved' : 'pending';

      // Crear inscripción
      const result = await pool.query(
        `INSERT INTO enrollments (student_id, course_id, status)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [studentId, courseId, status]
      );

      res.status(201).json({
        message: autoApprove 
          ? 'Inscripción aprobada automáticamente' 
          : 'Solicitud de inscripción enviada',
        enrollment: result.rows[0]
      });
    } catch (error: any) {
      console.error('Error en requestEnrollment:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener inscripciones del usuario
   * GET /api/v1/enrollments
   */
  static async getMyEnrollments(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const status = req.query.status as string;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      let query = `
        SELECT 
          e.*,
          c.title as course_title,
          c.thumbnail_url,
          c.description,
          u.first_name || ' ' || u.last_name as tutor_name
        FROM enrollments e
        JOIN courses c ON c.id = e.course_id
        JOIN users u ON u.id = c.tutor_id
        WHERE e.student_id = $1
      `;

      const params: any[] = [userId];

      if (status) {
        query += ' AND e.status = $2';
        params.push(status);
      }

      query += ' ORDER BY e.enrolled_at DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error en getMyEnrollments:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener solicitudes de inscripción pendientes (Tutor)
   * GET /api/v1/courses/:courseId/enrollments
   */
  static async getCourseEnrollments(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.courseId;
      const tutorId = req.user?.userId;
      const status = req.query.status as string;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Verificar que el tutor sea dueño del curso
      const course = await pool.query(
        'SELECT tutor_id FROM courses WHERE id = $1',
        [courseId]
      );

      if (course.rows.length === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      if (course.rows[0].tutor_id !== tutorId) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      let query = `
        SELECT 
          e.*,
          u.first_name || ' ' || u.last_name as student_name,
          u.email as student_email,
          u.avatar_url as student_avatar
        FROM enrollments e
        JOIN users u ON u.id = e.student_id
        WHERE e.course_id = $1
      `;

      const params: any[] = [courseId];

      if (status) {
        query += ' AND e.status = $2';
        params.push(status);
      }

      query += ' ORDER BY e.enrolled_at DESC';

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error: any) {
      console.error('Error en getCourseEnrollments:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Aprobar inscripción
   * POST /api/v1/enrollments/:id/approve
   */
  static async approveEnrollment(req: AuthRequest, res: Response) {
    try {
      const enrollmentId = req.params.id;
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Verificar que el tutor sea dueño del curso
      const enrollment = await pool.query(
        `SELECT e.*, c.tutor_id
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         WHERE e.id = $1`,
        [enrollmentId]
      );

      if (enrollment.rows.length === 0) {
        return res.status(404).json({ error: 'Inscripción no encontrada' });
      }

      if (enrollment.rows[0].tutor_id !== tutorId) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      // Aprobar inscripción
      await pool.query(
        `UPDATE enrollments
         SET status = 'approved', approved_at = CURRENT_TIMESTAMP, approved_by = $1
         WHERE id = $2`,
        [tutorId, enrollmentId]
      );

      res.json({ message: 'Inscripción aprobada exitosamente' });
    } catch (error: any) {
      console.error('Error en approveEnrollment:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Rechazar inscripción
   * POST /api/v1/enrollments/:id/reject
   */
  static async rejectEnrollment(req: AuthRequest, res: Response) {
    try {
      const enrollmentId = req.params.id;
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Verificar que el tutor sea dueño del curso
      const enrollment = await pool.query(
        `SELECT e.*, c.tutor_id
         FROM enrollments e
         JOIN courses c ON c.id = e.course_id
         WHERE e.id = $1`,
        [enrollmentId]
      );

      if (enrollment.rows.length === 0) {
        return res.status(404).json({ error: 'Inscripción no encontrada' });
      }

      if (enrollment.rows[0].tutor_id !== tutorId) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      // Rechazar inscripción
      await pool.query(
        `UPDATE enrollments
         SET status = 'rejected'
         WHERE id = $1`,
        [enrollmentId]
      );

      res.json({ message: 'Inscripción rechazada' });
    } catch (error: any) {
      console.error('Error en rejectEnrollment:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Obtener progreso de inscripción
   * GET /api/v1/enrollments/:id/progress
   */
  static async getEnrollmentProgress(req: AuthRequest, res: Response) {
    try {
      const enrollmentId = req.params.id;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Obtener progreso detallado
      const progress = await pool.query(
        `SELECT 
          lp.*,
          l.title as lesson_title,
          cm.title as module_title
         FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         JOIN course_modules cm ON cm.id = l.module_id
         WHERE lp.enrollment_id = $1
         ORDER BY cm.order_index, l.order_index`,
        [enrollmentId]
      );

      res.json(progress.rows);
    } catch (error: any) {
      console.error('Error en getEnrollmentProgress:', error);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Marcar lección como completada
   * POST /api/v1/enrollments/:enrollmentId/lessons/:lessonId/complete
   */
  static async markLessonComplete(req: AuthRequest, res: Response) {
    try {
      const { enrollmentId, lessonId } = req.params;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // Verificar que la inscripción pertenece al usuario
      const enrollment = await pool.query(
        'SELECT student_id FROM enrollments WHERE id = $1',
        [enrollmentId]
      );

      if (enrollment.rows.length === 0) {
        return res.status(404).json({ error: 'Inscripción no encontrada' });
      }

      if (enrollment.rows[0].student_id !== userId) {
        return res.status(403).json({ error: 'No autorizado' });
      }

      // Actualizar o crear progreso
      await pool.query(
        `INSERT INTO lesson_progress (enrollment_id, lesson_id, is_completed, completed_at)
         VALUES ($1, $2, true, CURRENT_TIMESTAMP)
         ON CONFLICT (enrollment_id, lesson_id)
         DO UPDATE SET is_completed = true, completed_at = CURRENT_TIMESTAMP`,
        [enrollmentId, lessonId]
      );

      // Recalcular progreso total
      const progressCalc = await pool.query(
        `SELECT 
          COUNT(*) as total_lessons,
          COUNT(*) FILTER (WHERE lp.is_completed = true) as completed_lessons
         FROM lessons l
         JOIN course_modules cm ON cm.id = l.module_id
         JOIN enrollments e ON e.course_id = cm.course_id
         LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id AND lp.enrollment_id = e.id
         WHERE e.id = $1`,
        [enrollmentId]
      );

      const { total_lessons, completed_lessons } = progressCalc.rows[0];
      const progressPercentage = (completed_lessons / total_lessons) * 100;

      await pool.query(
        'UPDATE enrollments SET progress_percentage = $1 WHERE id = $2',
        [progressPercentage, enrollmentId]
      );

      res.json({ 
        message: 'Lección marcada como completada',
        progressPercentage
      });
    } catch (error: any) {
      console.error('Error en markLessonComplete:', error);
      res.status(400).json({ error: error.message });
    }
  }
}