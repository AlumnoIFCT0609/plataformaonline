// ============================================
// ARCHIVO: backend/src/services/user.service.ts
// ============================================

import pool from '../config/database';
import bcrypt from 'bcrypt';

interface CreateUserDTO {
  email: string;
  password: string;
  role: 'tutor' | 'student';
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
}

interface UpdateUserDTO {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatarUrl?: string;
}

interface UserFilters {
  role?: 'tutor' | 'student';
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  // Obtener usuarios con filtros y paginación
  static async getUsers(filters: UserFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        id, email, role, first_name, last_name, 
        avatar_url, bio, is_active, email_verified,
        last_login, created_at, updated_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    // Filtro por rol
    if (filters.role) {
      query += ` AND role = $${paramIndex}`;
      params.push(filters.role);
      paramIndex++;
    }

    // Filtro por estado activo
    if (filters.isActive !== undefined) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(filters.isActive);
      paramIndex++;
    }

    // Búsqueda por nombre o email
    if (filters.search) {
      query += ` AND (
        LOWER(first_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(last_name) LIKE LOWER($${paramIndex}) OR 
        LOWER(email) LIKE LOWER($${paramIndex})
      )`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Contar total
    const countQuery = query.replace(
      'SELECT id, email, role, first_name, last_name, avatar_url, bio, is_active, email_verified, last_login, created_at, updated_at',
      'SELECT COUNT(*)'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Obtener usuarios paginados
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      users: result.rows.map(row => this.mapUserFromDB(row)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Obtener usuario por ID
  static async getUserById(userId: string) {
    const result = await pool.query(
      `SELECT 
        id, email, role, first_name, last_name, 
        avatar_url, bio, is_active, email_verified,
        last_login, created_at, updated_at
      FROM users 
      WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return this.mapUserFromDB(result.rows[0]);
  }

  // Crear usuario
  static async createUser(data: CreateUserDTO) {
    // Verificar si el email ya existe
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('El email ya está registrado');
    }

    // Validar rol
    if (data.role !== 'tutor' && data.role !== 'student') {
      throw new Error('Rol inválido. Debe ser "tutor" o "student"');
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(data.password, 10);

    const result = await pool.query(
      `INSERT INTO users (
        email, password_hash, role, first_name, last_name, bio, avatar_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, role, first_name, last_name, avatar_url, bio, is_active, created_at`,
      [
        data.email,
        passwordHash,
        data.role,
        data.firstName,
        data.lastName,
        data.bio || null,
        data.avatarUrl || null,
      ]
    );

    return this.mapUserFromDB(result.rows[0]);
  }

  // Actualizar usuario
  static async updateUser(userId: string, data: UpdateUserDTO) {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.email) {
      // Verificar que el email no esté en uso por otro usuario
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [data.email, userId]
      );
      if (existingUser.rows.length > 0) {
        throw new Error('El email ya está en uso');
      }
      updates.push(`email = $${paramIndex}`);
      values.push(data.email);
      paramIndex++;
    }

    if (data.password) {
      const passwordHash = await bcrypt.hash(data.password, 10);
      updates.push(`password_hash = $${paramIndex}`);
      values.push(passwordHash);
      paramIndex++;
    }

    if (data.firstName) {
      updates.push(`first_name = $${paramIndex}`);
      values.push(data.firstName);
      paramIndex++;
    }

    if (data.lastName) {
      updates.push(`last_name = $${paramIndex}`);
      values.push(data.lastName);
      paramIndex++;
    }

    if (data.bio !== undefined) {
      updates.push(`bio = $${paramIndex}`);
      values.push(data.bio);
      paramIndex++;
    }

    if (data.avatarUrl !== undefined) {
      updates.push(`avatar_url = $${paramIndex}`);
      values.push(data.avatarUrl);
      paramIndex++;
    }

    if (updates.length === 0) {
      throw new Error('No hay datos para actualizar');
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, role, first_name, last_name, avatar_url, bio, is_active, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return this.mapUserFromDB(result.rows[0]);
  }

  // Eliminar usuario (soft delete)
  static async deleteUser(userId: string, hardDelete: boolean = false) {
  if (hardDelete) {
    // ✅ Borrado físico
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
  } else {
    // ✅ Soft delete (desactivar)
    const result = await pool.query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }
  }
}

  // Activar/Desactivar usuario
  static async toggleUserStatus(userId: string, isActive: boolean) {
    const result = await pool.query(
      `UPDATE users 
       SET is_active = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2
       RETURNING id, email, role, first_name, last_name, is_active, updated_at`,
      [isActive, userId]
    );

    if (result.rows.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    return this.mapUserFromDB(result.rows[0]);
  }

  // Obtener estadísticas
  static async getUserStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE role = 'tutor') as total_tutors,
        COUNT(*) FILTER (WHERE role = 'student') as total_students,
        COUNT(*) FILTER (WHERE role = 'tutor' AND is_active = true) as active_tutors,
        COUNT(*) FILTER (WHERE role = 'student' AND is_active = true) as active_students,
        COUNT(*) FILTER (WHERE email_verified = true) as verified_users
      FROM users
      WHERE role IN ('tutor', 'student')
    `);

    return {
      totalTutors: parseInt(result.rows[0].total_tutors),
      totalStudents: parseInt(result.rows[0].total_students),
      activeTutors: parseInt(result.rows[0].active_tutors),
      activeStudents: parseInt(result.rows[0].active_students),
      verifiedUsers: parseInt(result.rows[0].verified_users),
    };
  }

  // Mapear usuario de la base de datos
  private static mapUserFromDB(row: any) {
    return {
      id: row.id,
      email: row.email,
      role: row.role,
      firstName: row.first_name,
      lastName: row.last_name,
      avatarUrl: row.avatar_url,
      bio: row.bio,
      isActive: row.is_active,
      emailVerified: row.email_verified,
      lastLogin: row.last_login,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}