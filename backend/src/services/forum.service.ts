// ============================================
// FORUM SERVICE
// ============================================

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface CreateThreadDTO {
  courseId?: string;
  categoryId?: string;
  title: string;
  content: string;
}

interface CreateReplyDTO {
  content: string;
}

export class ForumService {
  // Create thread
  static async createThread(authorId: string, data: CreateThreadDTO) {
    // If course-specific, verify enrollment
    if (data.courseId) {
      const enrollment = await pool.query(
        `SELECT id FROM enrollments 
         WHERE student_id = $1 AND course_id = $2 AND status = 'approved'`,
        [authorId, data.courseId]
      );

      if (enrollment.rows.length === 0) {
        // Check if user is tutor of the course
        const course = await pool.query(
          'SELECT tutor_id FROM courses WHERE id = $1',
          [data.courseId]
        );

        if (course.rows.length === 0 || course.rows[0].tutor_id !== authorId) {
          throw new Error('Not enrolled in this course');
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO forum_threads (course_id, category_id, author_id, title, content)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.courseId || null, data.categoryId || null, authorId, data.title, data.content]
    );

    return result.rows[0];
  }

  // Get threads
  static async getThreads(filters: {
    courseId?: string;
    categoryId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions: string[] = [];
    let params: any[] = [];
    let paramIndex = 1;

    if (filters.courseId) {
      whereConditions.push(`ft.course_id = $${paramIndex}`);
      params.push(filters.courseId);
      paramIndex++;
    }

    if (filters.categoryId) {
      whereConditions.push(`ft.category_id = $${paramIndex}`);
      params.push(filters.categoryId);
      paramIndex++;
    }

    if (filters.search) {
      whereConditions.push(
        `(ft.title ILIKE $${paramIndex} OR ft.content ILIKE $${paramIndex})`
      );
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get threads with author info and reply count
    const query = `
      SELECT 
        ft.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.avatar_url as author_avatar,
        u.role as author_role,
        COUNT(fr.id) as replies_count,
        MAX(fr.created_at) as last_reply_at
      FROM forum_threads ft
      JOIN users u ON u.id = ft.author_id
      LEFT JOIN forum_replies fr ON fr.thread_id = ft.id
      ${whereClause}
      GROUP BY ft.id, u.first_name, u.last_name, u.avatar_url, u.role
      ORDER BY ft.is_pinned DESC, COALESCE(MAX(fr.created_at), ft.created_at) DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    params.push(limit, offset);
    const result = await pool.query(query, params);

    return result.rows;
  }

  // Get thread by ID
  static async getThreadById(threadId: string, userId?: string) {
    // Increment view count
    await pool.query(
      'UPDATE forum_threads SET views_count = views_count + 1 WHERE id = $1',
      [threadId]
    );

    const threadQuery = `
      SELECT 
        ft.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.avatar_url as author_avatar,
        u.role as author_role,
        ${userId ? `EXISTS(SELECT 1 FROM forum_likes WHERE user_id = $2 AND thread_id = ft.id) as is_liked_by_user` : 'false as is_liked_by_user'}
      FROM forum_threads ft
      JOIN users u ON u.id = ft.author_id
      WHERE ft.id = $1
    `;

    const result = await pool.query(
      threadQuery,
      userId ? [threadId, userId] : [threadId]
    );

    if (result.rows.length === 0) {
      throw new Error('Thread not found');
    }

    return result.rows[0];
  }

  // Create reply
  static async createReply(
    threadId: string,
    authorId: string,
    data: CreateReplyDTO
  ) {
    // Check if thread exists and not locked
    const thread = await pool.query(
      'SELECT is_locked, course_id FROM forum_threads WHERE id = $1',
      [threadId]
    );

    if (thread.rows.length === 0) {
      throw new Error('Thread not found');
    }

    if (thread.rows[0].is_locked) {
      throw new Error('Thread is locked');
    }

    // If course-specific, verify enrollment
    if (thread.rows[0].course_id) {
      const enrollment = await pool.query(
        `SELECT id FROM enrollments 
         WHERE student_id = $1 AND course_id = $2 AND status = 'approved'`,
        [authorId, thread.rows[0].course_id]
      );

      if (enrollment.rows.length === 0) {
        const course = await pool.query(
          'SELECT tutor_id FROM courses WHERE id = $1',
          [thread.rows[0].course_id]
        );

        if (course.rows.length === 0 || course.rows[0].tutor_id !== authorId) {
          throw new Error('Not enrolled in this course');
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO forum_replies (thread_id, author_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [threadId, authorId, data.content]
    );

    // Update thread updated_at
    await pool.query(
      'UPDATE forum_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [threadId]
    );

    return result.rows[0];
  }

  // Get thread replies
  static async getReplies(
    threadId: string,
    userId?: string,
    page: number = 1,
    limit: number = 20
  ) {
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        fr.*,
        u.first_name || ' ' || u.last_name as author_name,
        u.avatar_url as author_avatar,
        u.role as author_role,
        COUNT(fl.id) as likes_count,
        ${userId ? `EXISTS(SELECT 1 FROM forum_likes WHERE user_id = $3 AND reply_id = fr.id) as is_liked_by_user` : 'false as is_liked_by_user'}
      FROM forum_replies fr
      JOIN users u ON u.id = fr.author_id
      LEFT JOIN forum_likes fl ON fl.reply_id = fr.id
      WHERE fr.thread_id = $1
      GROUP BY fr.id, u.first_name, u.last_name, u.avatar_url, u.role
      ORDER BY fr.is_solution DESC, fr.created_at ASC
      LIMIT $2 OFFSET ${offset}
    `;

    const params = userId ? [threadId, limit, userId] : [threadId, limit];
    const result = await pool.query(query, params);

    return result.rows;
  }

  // Like thread
  static async likeThread(threadId: string, userId: string) {
    try {
      await pool.query(
        'INSERT INTO forum_likes (user_id, thread_id) VALUES ($1, $2)',
        [userId, threadId]
      );
      return { liked: true };
    } catch (error) {
      // Already liked, unlike
      await pool.query(
        'DELETE FROM forum_likes WHERE user_id = $1 AND thread_id = $2',
        [userId, threadId]
      );
      return { liked: false };
    }
  }

  // Like reply
  static async likeReply(replyId: string, userId: string) {
    try {
      await pool.query(
        'INSERT INTO forum_likes (user_id, reply_id) VALUES ($1, $2)',
        [userId, replyId]
      );
      return { liked: true };
    } catch (error) {
      await pool.query(
        'DELETE FROM forum_likes WHERE user_id = $1 AND reply_id = $2',
        [userId, replyId]
      );
      return { liked: false };
    }
  }

  // Mark reply as solution (Tutor only)
  static async markAsSolution(replyId: string, tutorId: string) {
    // Verify tutor owns the course
    const reply = await pool.query(
      `SELECT fr.thread_id, ft.course_id, c.tutor_id
       FROM forum_replies fr
       JOIN forum_threads ft ON ft.id = fr.thread_id
       JOIN courses c ON c.id = ft.course_id
       WHERE fr.id = $1`,
      [replyId]
    );

    if (reply.rows.length === 0) {
      throw new Error('Reply not found');
    }

    if (reply.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    // Unmark other solutions in the same thread
    await pool.query(
      'UPDATE forum_replies SET is_solution = false WHERE thread_id = $1',
      [reply.rows[0].thread_id]
    );

    // Mark this as solution
    await pool.query('UPDATE forum_replies SET is_solution = true WHERE id = $1', [
      replyId,
    ]);
  }

  // Pin/Unpin thread (Tutor only)
  static async togglePin(threadId: string, tutorId: string) {
    const thread = await pool.query(
      `SELECT ft.is_pinned, ft.course_id, c.tutor_id
       FROM forum_threads ft
       LEFT JOIN courses c ON c.id = ft.course_id
       WHERE ft.id = $1`,
      [threadId]
    );

    if (thread.rows.length === 0) {
      throw new Error('Thread not found');
    }

    // Check if user is tutor or admin
    if (thread.rows[0].course_id && thread.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    const newPinState = !thread.rows[0].is_pinned;
    await pool.query('UPDATE forum_threads SET is_pinned = $1 WHERE id = $2', [
      newPinState,
      threadId,
    ]);

    return { isPinned: newPinState };
  }

  // Lock/Unlock thread (Tutor only)
  static async toggleLock(threadId: string, tutorId: string) {
    const thread = await pool.query(
      `SELECT ft.is_locked, ft.course_id, c.tutor_id
       FROM forum_threads ft
       LEFT JOIN courses c ON c.id = ft.course_id
       WHERE ft.id = $1`,
      [threadId]
    );

    if (thread.rows.length === 0) {
      throw new Error('Thread not found');
    }

    if (thread.rows[0].course_id && thread.rows[0].tutor_id !== tutorId) {
      throw new Error('Unauthorized');
    }

    const newLockState = !thread.rows[0].is_locked;
    await pool.query('UPDATE forum_threads SET is_locked = $1 WHERE id = $2', [
      newLockState,
      threadId,
    ]);

    return { isLocked: newLockState };
  }

  // Delete thread (Author or Tutor)
  static async deleteThread(threadId: string, userId: string, userRole: string) {
    const thread = await pool.query(
      `SELECT ft.author_id, ft.course_id, c.tutor_id
       FROM forum_threads ft
       LEFT JOIN courses c ON c.id = ft.course_id
       WHERE ft.id = $1`,
      [threadId]
    );

    if (thread.rows.length === 0) {
      throw new Error('Thread not found');
    }

    const isAuthor = thread.rows[0].author_id === userId;
    const isTutor = thread.rows[0].tutor_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isAuthor && !isTutor && !isAdmin) {
      throw new Error('Unauthorized');
    }

    await pool.query('DELETE FROM forum_threads WHERE id = $1', [threadId]);
  }

  // Get forum categories
  static async getCategories() {
    const result = await pool.query(
      'SELECT * FROM forum_categories ORDER BY order_index'
    );
    return result.rows;
  }
}