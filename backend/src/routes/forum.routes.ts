// ============================================
// ARCHIVO: backend/src/routes/forum.routes.ts
// ============================================

import express from 'express';
import { ForumService } from '../services/forum.service';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = express.Router();

// Obtener categorías
router.get('/categories', async (req, res) => {
  try {
    const categories = await ForumService.getCategories();
    res.json(categories);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener threads
router.get('/threads', async (req, res) => {
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
    res.status(400).json({ error: error.message });
  }
});

// Crear thread
router.post('/threads', authenticate, async (req: AuthRequest, res) => {
  try {
    const thread = await ForumService.createThread(req.user!.userId, req.body);
    res.status(201).json(thread);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Obtener thread por ID
router.get('/threads/:id', async (req: AuthRequest, res) => {
  try {
    const thread = await ForumService.getThreadById(req.params.id, req.user?.userId);
    res.json(thread);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// Obtener respuestas del thread
router.get('/threads/:id/replies', async (req: AuthRequest, res) => {
  try {
    const replies = await ForumService.getReplies(
      req.params.id,
      req.user?.userId,
      req.query.page ? parseInt(req.query.page as string) : undefined
    );
    res.json(replies);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Responder a thread
router.post('/threads/:id/replies', authenticate, async (req: AuthRequest, res) => {
  try {
    const reply = await ForumService.createReply(req.params.id, req.user!.userId, req.body);
    res.status(201).json(reply);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Like thread
router.post('/threads/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await ForumService.likeThread(req.params.id, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Like reply
router.post('/replies/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const result = await ForumService.likeReply(req.params.id, req.user!.userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;