// ============================================
// ARCHIVO: backend/src/services/course.service.ts
// ============================================

import { Pool } from 'pg';
import slugify from 'slugify';
import pool from '../config/database';

interface CreateCourseDTO {
  tutorId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  contentType: 'video' | 'document' | 'mixed';
  level?: string;
  durationHours?: number;
  maxStudents?: number;
  enrollmentAutoApprove?: boolean;
}

interface Course {
  id: string;
  tutorId: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  contentType: string;
  status: string;
  createdAt: Date;
}

export class CourseService {

  private static mapCourseFromDB(row: any) {
    return {
      id: row.id,
      tutorId: row.tutor_id,
      title: row.title,
      slug: row.slug,
      description: row.description,
      thumbnailUrl: row.thumbnail_url,
      contentType: row.content_type,
      status: row.status,
      durationHours: parseInt(row.duration_hours) || 0,
      level: row.level,
      language: row.language,
      maxStudents: row.max_students,
      enrollmentAutoApprove: row.enrollment_auto_approve,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at,
      tutorName: row.tutor_name,
      tutorAvatar: row.tutor_avatar,
      enrolledStudents: row.enrolled_students,
    };
  }

  static async createCourse(data: CreateCourseDTO): Promise<Course> {
    const slug = slugify(data.title, { lower: true, strict: true });

    const existing = await pool.query('SELECT id FROM courses WHERE slug = $1', [slug]);

    if (existing.rows.length > 0) {
      throw new Error('Course with this title already exists');
    }

    const result = await pool.query(
      `INSERT INTO courses (
        tutor_id, title, slug, description, thumbnail_url, 
        content_type, level, duration_hours, max_students, enrollment_auto_approve
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        data.tutorId,
        data.title,
        slug,
        data.description || '',
        data.thumbnailUrl || null,
        data.contentType,
        data.level || 'beginner',
        data.durationHours || 0,
        data.maxStudents || null,
        data.enrollmentAutoApprove || false,
      ]
    );

    return this.mapCourseFromDB(result.rows[0]);
  }

  static async getCourseById(courseId: string, userId?: string): Promise<any> {
    const query = `
      SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as tutor_name,
        u.avatar_url as tutor_avatar,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'approved') as enrolled_students,
        COUNT(DISTINCT cm.id) as modules_count,
        ${userId ? `EXISTS(SELECT 1 FROM enrollments WHERE student_id = $2 AND course_id = c.id) as is_enrolled` : 'false as is_enrolled'}
      FROM courses c
      JOIN users u ON u.id = c.tutor_id
      LEFT JOIN enrollments e ON e.course_id = c.id
      LEFT JOIN course_modules cm ON cm.course_id = c.id
      WHERE c.id = $1
      GROUP BY c.id, u.first_name, u.last_name, u.avatar_url
    `;

    const result = await pool.query(query, userId ? [courseId, userId] : [courseId]);

    if (result.rows.length === 0) {
      throw new Error('Course not found');
    }

    return this.mapCourseFromDB(result.rows[0]);
  }

  static async getCourses(filters: {
    status?: string;
    tutorId?: string;
    contentType?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ courses: Course[]; total: number; page: number; totalPages: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.status && filters.status !== 'undefined') {
      whereConditions.push(`c.status = $${paramIndex}`);
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.tutorId && filters.tutorId !== 'undefined') {
      whereConditions.push(`c.tutor_id = $${paramIndex}`);
      params.push(filters.tutorId);
      paramIndex++;
    }

    if (filters.contentType && filters.contentType !== 'undefined') {
      whereConditions.push(`c.content_type = $${paramIndex}`);
      params.push(filters.contentType);
      paramIndex++;
    }

    if (filters.search && filters.search !== 'undefined') {
      whereConditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const countQuery = `
      SELECT COUNT(*) as total
      FROM courses c
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);

    const query = `
      SELECT 
        c.*,
        u.first_name || ' ' || u.last_name as tutor_name,
        u.avatar_url as tutor_avatar,
        COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'approved') as enrolled_students
      FROM courses c
      JOIN users u ON u.id = c.tutor_id
      LEFT JOIN enrollments e ON e.course_id = c.id
      ${whereClause}
      GROUP BY c.id, u.first_name, u.last_name, u.avatar_url
      ORDER BY c.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);

    // ✅ MAPEAR - Estaba devolviendo result.rows sin mapear
    const mappedCourses = result.rows.map(row => this.mapCourseFromDB(row));

    return {
      courses: mappedCourses, // ← FIX: Devolver mapeado
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ✅ AÑADIR PARÁMETRO isAdmin
  static async updateCourse(
    courseId: string,
    userId: string,
    updates: Partial<CreateCourseDTO>,
    isAdmin: boolean = false
  ): Promise<Course> {
    const course = await pool.query('SELECT tutor_id FROM courses WHERE id = $1', [courseId]);

    if (course.rows.length === 0) {
      throw new Error('Course not found');
    }

    // ✅ Admin puede editar cualquier curso
    if (!isAdmin && course.rows[0].tutor_id !== userId) {
      throw new Error('Unauthorized');
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(updates.title);
      paramIndex++;

      const newSlug = slugify(updates.title, { lower: true, strict: true });
      updateFields.push(`slug = $${paramIndex}`);
      values.push(newSlug);
      paramIndex++;
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }

    if (updates.thumbnailUrl !== undefined) {
      updateFields.push(`thumbnail_url = $${paramIndex}`);
      values.push(updates.thumbnailUrl);
      paramIndex++;
    }

    if (updates.contentType) {
      updateFields.push(`content_type = $${paramIndex}`);
      values.push(updates.contentType);
      paramIndex++;
    }

    if (updates.level) {
      updateFields.push(`level = $${paramIndex}`);
      values.push(updates.level);
      paramIndex++;
    }

    if (updates.durationHours !== undefined) {
      updateFields.push(`duration_hours = $${paramIndex}`);
      values.push(updates.durationHours);
      paramIndex++;
    }

    if (updates.maxStudents !== undefined) {
      updateFields.push(`max_students = $${paramIndex}`);
      values.push(updates.maxStudents);
      paramIndex++;
    }

    // ✅ AÑADIR tutorId al update (admin puede cambiar tutor)
    if (updates.tutorId && isAdmin) {
      updateFields.push(`tutor_id = $${paramIndex}`);
      values.push(updates.tutorId);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(courseId);

    const query = `
      UPDATE courses
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return this.mapCourseFromDB(result.rows[0]);
  }
  static async updateCourseStatus(
  courseId: string,
  userId: string,
  status: 'draft' | 'published' | 'archived',
  isAdmin: boolean = false
): Promise<void> {
  const course = await pool.query('SELECT tutor_id FROM courses WHERE id = $1', [courseId]);

  if (course.rows.length === 0) {
    throw new Error('Course not found');
  }

  if (!isAdmin && course.rows[0].tutor_id !== userId) {
    throw new Error('Unauthorized');
  }

  await pool.query(
    'UPDATE courses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    [status, courseId]
  );
}
// Cambiar estado del curso (toggle)
static async toggleCourseStatus(
  courseId: string,
  userId: string,
  newStatus: 'draft' | 'archived',
  isAdmin: boolean = false
): Promise<Course> {
  const course = await pool.query('SELECT tutor_id FROM courses WHERE id = $1', [courseId]);

  if (course.rows.length === 0) {
    throw new Error('Course not found');
  }

  if (!isAdmin && course.rows[0].tutor_id !== userId) {
    throw new Error('Unauthorized');
  }

  const result = await pool.query(
    'UPDATE courses SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
    [newStatus, courseId]
  );

  return this.mapCourseFromDB(result.rows[0]);
}






  // ✅ AÑADIR PARÁMETRO isAdmin
  static async publishCourse(courseId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const course = await pool.query('SELECT tutor_id, status FROM courses WHERE id = $1', [courseId]);

    if (course.rows.length === 0) {
      throw new Error('Course not found');
    }

    if (!isAdmin && course.rows[0].tutor_id !== userId) {
      throw new Error('Unauthorized');
    }

    const modules = await pool.query(
      'SELECT COUNT(*) as count FROM course_modules WHERE course_id = $1',
      [courseId]
    );

    if (parseInt(modules.rows[0].count) === 0) {
      throw new Error('Cannot publish course without modules');
    }

    await pool.query(
      `UPDATE courses 
       SET status = 'published', published_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [courseId]
    );
  }

  // ✅ ARREGLAR deleteCourse
  static async deleteCourse(courseId: string, userId: string, isAdmin: boolean = false): Promise<void> {
    const course = await pool.query('SELECT tutor_id FROM courses WHERE id = $1', [courseId]); // ← FIX: era user_id

    if (course.rows.length === 0) {
      throw new Error('Course not found');
    }

    if (!isAdmin && course.rows[0].tutor_id !== userId) {
      throw new Error('Unauthorized');
    }

    // await pool.query('DELETE FROM courses WHERE id = $1', [courseId]);

    // ✅ Soft delete: cambiar a 'archived' en vez de DELETE
  await pool.query(
    `UPDATE courses 
     SET status = 'archived', updated_at = CURRENT_TIMESTAMP 
     WHERE id = $1`,
    [courseId]
  );
  }
}



// ============================================
// MODULE SERVICE
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

  // Update module
  static async updateModule(moduleId: string, tutorId: string, updates: {
    title?: string;
    description?: string;
    orderIndex?: number;
    isPublished?: boolean;
  }) {
    // Verify ownership
    const module = await pool.query(
      `SELECT cm.id, c.tutor_id
       FROM course_modules cm
       JOIN courses c ON c.id = cm.course_id
       WHERE cm.id = $1`,
      [moduleId]
    );

    if (module.rows.length === 0) {
      throw new Error('Module not found');
    }

    if (module.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(updates.title);
      paramIndex++;
    }

    if (updates.description !== undefined) {
      updateFields.push(`description = $${paramIndex}`);
      values.push(updates.description);
      paramIndex++;
    }

    if (updates.orderIndex !== undefined) {
      updateFields.push(`order_index = $${paramIndex}`);
      values.push(updates.orderIndex);
      paramIndex++;
    }

    if (updates.isPublished !== undefined) {
      updateFields.push(`is_published = $${paramIndex}`);
      values.push(updates.isPublished);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(moduleId);

    const query = `
      UPDATE course_modules
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete module
  static async deleteModule(moduleId: string, tutorId: string) {
    const module = await pool.query(
      `SELECT cm.id, c.tutor_id
       FROM course_modules cm
       JOIN courses c ON c.id = cm.course_id
       WHERE cm.id = $1`,
      [moduleId]
    );

    if (module.rows.length === 0) {
      throw new Error('Module not found');
    }

    if (module.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    await pool.query('DELETE FROM course_modules WHERE id = $1', [moduleId]);
  }
}

// ============================================
// LESSON SERVICE
// ============================================

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

  // Add document to lesson
  static async addDocument(lessonId: string, documentData: {
    title: string;
    fileUrl: string;
    fileType?: string;
    sizeBytes?: number;
  }) {
    const result = await pool.query(
      `INSERT INTO lesson_documents (lesson_id, title, file_url, file_type, size_bytes)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        lessonId,
        documentData.title,
        documentData.fileUrl,
        documentData.fileType || null,
        documentData.sizeBytes || 0,
      ]
    );

    return result.rows[0];
  }

  // Get lesson by ID with content
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

  // Update lesson
  static async updateLesson(lessonId: string, updates: {
    title?: string;
    content?: string;
    orderIndex?: number;
    durationMinutes?: number;
    isFree?: boolean;
  }) {
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.title) {
      updateFields.push(`title = $${paramIndex}`);
      values.push(updates.title);
      paramIndex++;
    }

    if (updates.content !== undefined) {
      updateFields.push(`content = $${paramIndex}`);
      values.push(updates.content);
      paramIndex++;
    }

    if (updates.orderIndex !== undefined) {
      updateFields.push(`order_index = $${paramIndex}`);
      values.push(updates.orderIndex);
      paramIndex++;
    }

    if (updates.durationMinutes !== undefined) {
      updateFields.push(`duration_minutes = $${paramIndex}`);
      values.push(updates.durationMinutes);
      paramIndex++;
    }

    if (updates.isFree !== undefined) {
      updateFields.push(`is_free = $${paramIndex}`);
      values.push(updates.isFree);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(lessonId);

    const query = `
      UPDATE lessons
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Delete lesson
  static async deleteLesson(lessonId: string) {
    await pool.query('DELETE FROM lessons WHERE id = $1', [lessonId]);
  }
}