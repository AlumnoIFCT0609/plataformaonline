// ============================================
// ARCHIVO: backend/src/routes/user.routes.ts
// ============================================

import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación y rol de admin
router.use(authenticate);

// Obtener estadísticas de usuarios
router.get('/stats', UserController.getUserStats);

// CRUD de usuarios
router.get('/', UserController.getUsers);
router.get('/:id', UserController.getUserById);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

// Activar/Desactivar usuario
router.patch('/:id/toggle-status', UserController.toggleUserStatus);

export default router;