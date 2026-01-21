import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { HttpError } from '@/utils/httpError';

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // 1. Handle Multer Errors
  if (err instanceof MulterError) {
    res.status(400).json({
      status: 'error',
      message: err.code === 'LIMIT_FILE_SIZE' ? 'File terlalu besar (Max 5MB)' : err.message,
    });
    return;
  }
};