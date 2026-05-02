// ============================================
// ARCHIVO: backend/src/controllers/user.controller.ts
// ============================================

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

export class UserController {
  // Obtener todos los usuarios con filtros
  static async getUsers(req: AuthRequest, res: Response) {
    try {
      // Verificar que sea admin
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const role = req.query.role as string;
      const isActiveParam = req.query.isActive as string;
      const validRole: 'tutor' | 'student' | undefined = 
        (role === 'tutor' || role === 'student') ? role : undefined;

      const filters = {
        role: validRole,
        isActive: isActiveParam === 'true' ? true : isActiveParam === 'false' ? false : undefined,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      };

      const result = await UserService.getUsers(filters);
      res.json(result);
    } catch (error: any) {
      console.error('Error en getUsers:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // ✅ AÑADE ESTE MÉTODO QUE FALTA
  static async getUserById(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const userId = req.params.id;
      const user = await UserService.getUserById(userId);
      res.json(user);
    } catch (error: any) {
      console.error('Error en getUserById:', error);
      res.status(404).json({ error: error.message });
    }
  }

  // Crear usuario (tutor o alumno)
  static async createUser(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const user = await UserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error en createUser:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Actualizar usuario
  static async updateUser(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const userId = req.params.id;
      const user = await UserService.updateUser(userId, req.body);
      res.json(user);
    } catch (error: any) {
      console.error('Error en updateUser:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Eliminar usuario (soft delete)
  static async deleteUser(req: AuthRequest, res: Response) {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado' });
    }

    const userId = req.params.id;
    const hardDelete = req.query.hardDelete === 'true'; // ✅ Leer del query param
    
    await UserService.deleteUser(userId, hardDelete);
    res.status(204).send();
  } catch (error: any) {
    console.error('Error en deleteUser:', error);
    res.status(400).json({ error: error.message });
  }
}

  // Activar/Desactivar usuario
  static async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const userId = req.params.id;
      const { isActive } = req.body;
      
      const user = await UserService.toggleUserStatus(userId, isActive);
      res.json(user);
    } catch (error: any) {
      console.error('Error en toggleUserStatus:', error);
      res.status(400).json({ error: error.message });
    }
  }

  // Obtener estadísticas de usuarios
  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado' });
      }

      const stats = await UserService.getUserStats();
      res.json(stats);
    } catch (error: any) {
      console.error('Error en getUserStats:', error);
      res.status(400).json({ error: error.message });
    }
  }
}