import { Request, Response } from 'express';
import prisma from '@/prisma';
import { createCategorySchema } from './category.validation';

export const getCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
  });
  res.json(categories);
};

export const createCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createCategorySchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name } = parsed.data;

  const existing = await prisma.category.findFirst({
    where: {
      deletedAt: null,
      name: { equals: name.trim(), mode: 'insensitive' },
    },
  });

  if (existing) {
    res.status(400).json({ message: 'Category already exists' });
    return;
  }

  const category = await prisma.category.create({
    data: { name: name.trim() },
  });

  res.status(201).json({
    message: 'Category created',
    category,
  });
};

export const deleteCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  // Cek ada atau tidak
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category || category.deletedAt) {
    res.status(404).json({ message: 'Category not found' });
    return;
  }

  const usedByProduct = await prisma.product.findFirst({
    where: {
      categoryId: id,
      deletedAt: null,
    },
  });

  if (usedByProduct) {
    res.status(400).json({
      message: 'Cannot delete category that is used by products',
    });
    return;
  }

  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ message: 'Category soft deleted' });
};
