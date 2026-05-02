// ============================================
// AUTH SERVICE - Backend
// ============================================

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Pool } from 'pg';
import crypto from 'crypto';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRES = '15m';
const REFRESH_TOKEN_EXPIRES = '7d';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'tutor' | 'student';
  firstName: string;
  lastName: string;
}

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  // Register new user
  static async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'student' | 'tutor';
  }): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    const { email, password, firstName, lastName, role } = data;

    // Check if user exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, first_name, last_name, role`,
      [email, passwordHash, firstName, lastName, role]
    );

    const user = result.rows[0];

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken,
      refreshToken,
    };
  }

  // Login user
  static async login(
    email: string,
    password: string
  ): Promise<{ user: User; accessToken: string; refreshToken: string }> {
    // Find user
    const result = await pool.query(
      `SELECT id, email, password_hash, first_name, last_name, role, is_active
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result.rows[0];

    if (!user.is_active) {
      throw new Error('Account is inactive');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [
      user.id,
    ]);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
      },
      accessToken,
      refreshToken,
    };
  }

  // Generate tokens
  private static async generateTokens(user: any): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES,
    });

    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    return { accessToken, refreshToken };
  }

  // Refresh access token
  static async refreshAccessToken(refreshToken: string): Promise<string> {
    const result = await pool.query(
      `SELECT rt.user_id, u.email, u.role 
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token = $1 AND rt.expires_at > CURRENT_TIMESTAMP`,
      [refreshToken]
    );

    if (result.rows.length === 0) {
      throw new Error('Invalid or expired refresh token');
    }

    const { user_id, email, role } = result.rows[0];

    const payload: TokenPayload = {
      userId: user_id,
      email,
      role,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES });
  }

  // Verify access token
  static verifyToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Logout
  static async logout(refreshToken: string): Promise<void> {
    await pool.query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }
  /**
 * Obtener usuario por ID
 */
  static async getUserById(userId: string) {
  const result = await pool.query(
    `SELECT id, email, role, first_name, last_name, avatar_url, bio, created_at
     FROM users WHERE id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  return {
    id: result.rows[0].id,
    email: result.rows[0].email,
    role: result.rows[0].role,
    firstName: result.rows[0].first_name,
    lastName: result.rows[0].last_name,
    avatarUrl: result.rows[0].avatar_url,
    bio: result.rows[0].bio,
    createdAt: result.rows[0].created_at,
  };
}

/**
 * Cambiar contraseña
 */
static async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  // Obtener usuario
  const result = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error('Usuario no encontrado');
  }

  // Verificar contraseña actual
  const isValidPassword = await bcrypt.compare(
    currentPassword,
    result.rows[0].password_hash
  );

  if (!isValidPassword) {
    throw new Error('Contraseña actual incorrecta');
  }

  // Hash de nueva contraseña
  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  // Actualizar contraseña
  await pool.query(
    'UPDATE users SET password_hash = $1 WHERE id = $2',
    [newPasswordHash, userId]
  );
}





}