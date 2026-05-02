// ============================================
// NUEVO ARCHIVO: backend/src/services/enrollment.service.ts
// ============================================

import pool from '../config/database';

export class EnrollmentService {
  /**
   * Calcular progreso del curso
   */
  static async calculateProgress(enrollmentId: string): Promise<number> {
    const result = await pool.query(
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

    const { total_lessons, completed_lessons } = result.rows[0];
    
    if (total_lessons === 0) return 0;
    
    return (completed_lessons / total_lessons) * 100;
  }

  /**
   * Verificar si el estudiante está inscrito en un curso
   */
  static async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT id FROM enrollments 
       WHERE student_id = $1 AND course_id = $2 AND status = 'approved'`,
      [studentId, courseId]
    );

    return result.rows.length > 0;
  }

  /**
   * Obtener estadísticas de inscripción
   */
  static async getEnrollmentStats(courseId: string) {
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
       FROM enrollments
       WHERE course_id = $1`,
      [courseId]
    );

    return result.rows[0];
  }
}