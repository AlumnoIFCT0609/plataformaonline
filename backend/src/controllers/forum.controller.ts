// ============================================
// ARCHIVO: backend/src/controllers/forum.controller.ts
// ============================================

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { ForumService } from '../services/forum.service';

export class ForumController {
  static async getCategories(req: AuthRequest, res: Response) {
    try {
      const categories = await ForumService.getCategories();
      res.json(categories);
    } catch (error: any) {
      console.error('Error en getCategories:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getThreads(req: AuthRequest, res: Response) {
    try {
      const threads = await ForumService.getThreads({
        courseId: req.query.courseId as string,
        categoryId: req.query.categoryId as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });
      res.json(threads);
    } catch (error: any) {
      console.error('Error en getThreads:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async createThread(req: AuthRequest, res: Response) {
    try {
      const authorId = req.user?.userId;
      if (!authorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const thread = await ForumService.createThread(authorId, req.body);
      res.status(201).json(thread);
    } catch (error: any) {
      console.error('Error en createThread:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getThreadById(req: AuthRequest, res: Response) {
    try {
      const thread = await ForumService.getThreadById(req.params.id, req.user?.userId);
      res.json(thread);
    } catch (error: any) {
      console.error('Error en getThreadById:', error);
      res.status(404).json({ error: error.message });
    }
  }

  static async getReplies(req: AuthRequest, res: Response) {
    try {
      const replies = await ForumService.getReplies(
        req.params.id,
        req.user?.userId,
        req.query.page ? parseInt(req.query.page as string) : undefined
      );
      res.json(replies);
    } catch (error: any) {
      console.error('Error en getReplies:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async createReply(req: AuthRequest, res: Response) {
    try {
      const authorId = req.user?.userId;
      if (!authorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const reply = await ForumService.createReply(req.params.id, authorId, req.body);
      res.status(201).json(reply);
    } catch (error: any) {
      console.error('Error en createReply:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async likeThread(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const result = await ForumService.likeThread(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error en likeThread:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async likeReply(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const result = await ForumService.likeReply(req.params.id, userId);
      res.json(result);
    } catch (error: any) {
      console.error('Error en likeReply:', error);
      res.status(400).json({ error: error.message });
    }
  }
}