// ============================================
// ARCHIVO: backend/src/controllers/course.controller.ts
// ============================================

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CourseService, ModuleService, LessonService } from '../services/course.service';

export class CourseController {
  static async createCourse(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }
      // ✅ Si es admin, puede asignar cualquier tutor. Si es tutor, usa su propio ID
      const tutorId = userRole === 'admin' ? req.body.tutorId : userId;

      if (!tutorId) {
        return res.status(400).json({ error: 'Debe especificar un tutor' });
      }

      const course = await CourseService.createCourse({
        tutorId,
        ...req.body,
      });

      res.status(201).json(course);
    } catch (error: any) {
      console.error('Error en createCourse:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getCourses(req: AuthRequest, res: Response) {
  try {
    const filters = {
      status: req.query.status as string || undefined,  // ← Cambia esto
      tutorId: req.query.tutorId as string || undefined,
      contentType: req.query.contentType as string || undefined,
      search: req.query.search as string || undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    // ✅ Limpiar valores undefined antes de enviar al service
    const cleanFilters: any = {};
    if (filters.status) cleanFilters.status = filters.status;
    if (filters.tutorId) cleanFilters.tutorId = filters.tutorId;
    if (filters.contentType) cleanFilters.contentType = filters.contentType;
    if (filters.search) cleanFilters.search = filters.search;
    if (filters.page) cleanFilters.page = filters.page;
    if (filters.limit) cleanFilters.limit = filters.limit;

    const result = await CourseService.getCourses(cleanFilters);
    res.json(result);
  } catch (error: any) {
    console.error('Error en getCourses:', error);
    res.status(400).json({ error: error.message });
  }
}
  static async getCourseById(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.id;
      const userId = req.user?.userId;

      const course = await CourseService.getCourseById(courseId, userId);
      res.json(course);
    } catch (error: any) {
      console.error('Error en getCourseById:', error);
      res.status(404).json({ error: error.message });
    }
  }

  static async updateCourse(req: AuthRequest, res: Response) {
  try {
    const courseId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // ✅ Pasar true/false en vez de comprobar === 'admin'
    const isAdmin = userRole === 'admin';
    
    const course = await CourseService.updateCourse(courseId, userId, req.body, isAdmin);
    res.json(course);
  } catch (error: any) {
    console.error('Error en updateCourse:', error);
    res.status(400).json({ error: error.message });
  }
}
static async updateCourseStatus(req: AuthRequest, res: Response) {
  try {
    const courseId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const isAdmin = userRole === 'admin';
    
    await CourseService.updateCourseStatus(courseId, userId, status, isAdmin);
    res.json({ message: 'Estado actualizado' });
  } catch (error: any) {
    console.error('Error en updateCourseStatus:', error);
    res.status(400).json({ error: error.message });
  }
}

static async toggleCourseStatus(req: AuthRequest, res: Response) {
  try {
    const courseId = req.params.id;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const isAdmin = userRole === 'admin';
    
    const course = await CourseService.toggleCourseStatus(courseId, userId, status, isAdmin);
    res.json(course);
  } catch (error: any) {
    console.error('Error en toggleCourseStatus:', error);
    res.status(400).json({ error: error.message });
  }
}



  static async deleteCourse(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.id;
      const userId = req.user?.userId;
      const userRole = req.user?.role;



       if (!userId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      // ✅ Admin puede eliminar cualquier curso, tutor solo los suyos
      await CourseService.deleteCourse(courseId, userId, userRole === 'admin');
      res.status(204).send();
    } catch (error: any) {
      console.error('Error en deleteCourse:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async publishCourse(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.id;
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      await CourseService.publishCourse(courseId, tutorId);
      res.json({ message: 'Curso publicado exitosamente' });
    } catch (error: any) {
      console.error('Error en publishCourse:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export class ModuleController {
  static async createModule(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.courseId;
      const tutorId = req.user?.userId;

      if (!tutorId) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const module = await ModuleService.createModule({
        courseId,
        tutorId,
        ...req.body,
      });

      res.status(201).json(module);
    } catch (error: any) {
      console.error('Error en createModule:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getCourseModules(req: AuthRequest, res: Response) {
    try {
      const courseId = req.params.courseId;
      const modules = await ModuleService.getCourseModules(courseId);
      res.json(modules);
    } catch (error: any) {
      console.error('Error en getCourseModules:', error);
      res.status(400).json({ error: error.message });
    }
  }
}

export class LessonController {
  static async createLesson(req: AuthRequest, res: Response) {
    try {
      const moduleId = req.params.moduleId;
      const lesson = await LessonService.createLesson({
        moduleId,
        ...req.body,
      });

      res.status(201).json(lesson);
    } catch (error: any) {
      console.error('Error en createLesson:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async getLessonById(req: AuthRequest, res: Response) {
    try {
      const lessonId = req.params.id;
      const lesson = await LessonService.getLessonById(lessonId);
      res.json(lesson);
    } catch (error: any) {
      console.error('Error en getLessonById:', error);
      res.status(404).json({ error: error.message });
    }
  }

  static async addVideo(req: AuthRequest, res: Response) {
    try {
      const lessonId = req.params.id;
      const video = await LessonService.addVideo(lessonId, req.body);
      res.status(201).json(video);
    } catch (error: any) {
      console.error('Error en addVideo:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async addDocument(req: AuthRequest, res: Response) {
    try {
      const lessonId = req.params.id;
      const document = await LessonService.addDocument(lessonId, req.body);
      res.status(201).json(document);
    } catch (error: any) {
      console.error('Error en addDocument:', error);
      res.status(400).json({ error: error.message });
    }
  }
}