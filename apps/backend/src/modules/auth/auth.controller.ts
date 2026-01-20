import { Request, Response } from 'express';
import { loginSchema } from './auth.validation';
import { loginService } from './auth.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid input' });
    return;
  }

  try {
    const result = await loginService(
      parsed.data.username,
      parsed.data.password
    );
    res.json(result);
  } catch {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};
