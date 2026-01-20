import { Request, Response } from 'express';
import prisma from '@/prisma';
import { createProductSchema, updateProductSchema } from './product.validation';
import cloudinary from '@/utils/cloudinary';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: { category: true },
  });
  res.json(products);
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  const parsed = createProductSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, price, stock, categoryId } =parsed.data;

  // Pastikan category ada & tidak dihapus
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.deletedAt) {
    res.status(400).json({ message: 'Invalid or deleted category' });
    return;
  }

  const existing = await prisma.product.findFirst({
    where: {
      deletedAt: null,
      categoryId,
      name: {
        equals: name.trim(),
        mode: 'insensitive',
      },
    },
  });

  if (existing) {
    res
      .status(400)
      .json({ message: 'Product already exists in this category' });
    return;
  }

  const file = req.file as any;

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      price,
      stock,
      categoryId,
      imageUrl: file?.path || null,
      imagePublicId: file?.filename || null,
    },
  });

  res.status(201).json({
    message: 'Product created',
    product,
  });
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsed = updateProductSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product || product.deletedAt) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  // Jika ada categoryId baru, cek dulu
  if (parsed.data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: parsed.data.categoryId },
    });

    if (!category || category.deletedAt) {
      res.status(400).json({ message: 'Invalid or deleted category' });
      return;
    }
  }

  const file = req.file as any;

  if (file && product.imagePublicId) {
    await cloudinary.uploader.destroy(product.imagePublicId);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { 
        ...parsed.data, 
        name: parsed.data.name?.trim(),
        ...(file && {
            imageUrl: file.path,
            imagePublicId: file.filename,
        }),
      },
  });

  res.json({
    message: 'Product updated',
    product: updated,
  });
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product || product.deletedAt) {
    res.status(404).json({ message: 'Product not found' });
    return;
  }

  await prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  res.json({ message: 'Product soft deleted' });
};
