// ============================================
// ARCHIVO: backend/src/controllers/auth.controller.ts
// ============================================

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

export class AuthController {
  /**
   * Registrar nuevo usuario
   * POST /api/v1/auth/register
   */
  static async register(req: AuthRequest, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      // Validaciones básicas
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ 
          error: 'Todos los campos son requeridos',
          required: ['email', 'password', 'firstName', 'lastName', 'role']
        });
      }

      if (password.length < 8) {
        return res.status(400).json({ 
          error: 'La contraseña debe tener al menos 8 caracteres' 
        });
      }

      if (!['student', 'tutor'].includes(role)) {
        return res.status(400).json({ 
          error: 'Rol inválido. Debe ser "student" o "tutor"' 
        });
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          error: 'Formato de email inválido' 
        });
      }

      const result = await AuthService.register({
        email,
        password,
        firstName,
        lastName,
        role,
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        ...result
      });
    } catch (error: any) {
      console.error('Error en register:', error);
      res.status(400).json({ 
        error: error.message || 'Error al registrar usuario' 
      });
    }
  }

  /**
   * Iniciar sesión
   * POST /api/v1/auth/login
   */
  static async login(req: AuthRequest, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email y contraseña son requeridos' 
        });
      }

      const result = await AuthService.login(email, password);

      res.json({
        message: 'Inicio de sesión exitoso',
        ...result
      });
    } catch (error: any) {
      console.error('Error en login:', error);
      res.status(401).json({ 
        error: error.message || 'Credenciales inválidas' 
      });
    }
  }

  /**
   * Refrescar token de acceso
   * POST /api/v1/auth/refresh
   */
  static async refreshToken(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ 
          error: 'Refresh token es requerido' 
        });
      }

      const accessToken = await AuthService.refreshAccessToken(refreshToken);

      res.json({ 
        accessToken,
        message: 'Token refrescado exitosamente'
      });
    } catch (error: any) {
      console.error('Error en refresh:', error);
      res.status(401).json({ 
        error: error.message || 'Token inválido o expirado' 
      });
    }
  }

  /**
   * Cerrar sesión
   * POST /api/v1/auth/logout
   */
  static async logout(req: AuthRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }

      res.json({ 
        message: 'Sesión cerrada exitosamente' 
      });
    } catch (error: any) {
      console.error('Error en logout:', error);
      res.status(400).json({ 
        error: error.message || 'Error al cerrar sesión' 
      });
    }
  }

  /**
   * Obtener información del usuario actual
   * GET /api/v1/auth/me
   */
  static async getCurrentUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ 
          error: 'No autenticado' 
        });
      }

      const user = await AuthService.getUserById(userId);

      res.json(user);
    } catch (error: any) {
      console.error('Error en getCurrentUser:', error);
      res.status(404).json({ 
        error: error.message || 'Usuario no encontrado' 
      });
    }
  }

  /**
   * Cambiar contraseña
   * POST /api/v1/auth/change-password
   */
  static async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          error: 'Contraseña actual y nueva son requeridas' 
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ 
          error: 'La nueva contraseña debe tener al menos 8 caracteres' 
        });
      }

      await AuthService.changePassword(userId, currentPassword, newPassword);

      res.json({ 
        message: 'Contraseña cambiada exitosamente' 
      });
    } catch (error: any) {
      console.error('Error en changePassword:', error);
      res.status(400).json({ 
        error: error.message || 'Error al cambiar contraseña' 
      });
    }
  }
}