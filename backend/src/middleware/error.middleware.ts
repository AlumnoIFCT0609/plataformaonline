// ============================================
// ARCHIVO 1: backend/src/middleware/error.middleware.ts
// ============================================

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  console.error(`[ERROR] ${status} - ${message}`);
  console.error(err.stack);

  res.status(status).json({
    error: message,
    statusCode: status,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(404).json({
    error: 'Recurso no encontrado',
    statusCode: 404,
    path: req.originalUrl,
  });
};