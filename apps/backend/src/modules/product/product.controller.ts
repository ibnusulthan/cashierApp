import { Request, Response } from 'express';
import prisma from '@/prisma';
import { Prisma } from '@prisma/client'; // Import Prisma untuk akses tipe QueryMode
import { createProductSchema, updateProductSchema } from './product.validation';
import cloudinary from '@/utils/cloudinary';

export const getProducts = async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const category = req.query.category as string;
  const sort = req.query.sort as string;
  const page = (req.query.page as string) || '1';
  const limit = (req.query.limit as string) || '10';

  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const skip = (pageNum - 1) * limitNum;

  // Definisikan tipe condition secara eksplisit agar TS tidak komplain
  const whereCondition: Prisma.ProductWhereInput = {
    deletedAt: null,
    ...(search && {
      name: {
        contains: String(search),
        mode: 'insensitive' as Prisma.QueryMode, // Casting ke QueryMode
      },
    }),
    ...(category && {
      categoryId: String(category),
    }),
  };

  try {
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereCondition,
        orderBy: {
          // Pastikan sort key sesuai dengan logic frontend (price_asc/price_desc)
          ...(sort === 'price_asc' && { price: 'asc' }),
          ...(sort === 'price_desc' && { price: 'desc' }),
          ...(sort === 'newest' || !sort ? { createdAt: 'desc' } : {}),
        },
        include: { category: true },
        skip: skip,
        take: limitNum,
      }),
      prisma.product.count({ where: whereCondition }),
    ]);

    res.json({
      data: products,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data produk' });
  }
};

export const createProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = createProductSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { name, price, stock, categoryId } = parsed.data;

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
      stockHistories: {
        create: {
          change: stock,
          reason: 'Initial stock',
        },
      },
    },
  });

  res.status(201).json({
    message: 'Product created',
    product,
  });
};

export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
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

  const newName = parsed.data.name?.trim();
  const newCategoryId = parsed.data.categoryId || product.categoryId;

  if (newName) {
    const duplicate = await prisma.product.findFirst({
      where: {
        id: { not: id }, // Cari produk selain dirinya sendiri
        deletedAt: null,
        categoryId: newCategoryId,
        name: {
          equals: newName,
          mode: 'insensitive',
        },
      },
    });

    if (duplicate) {
      res
        .status(400)
        .json({
          message: 'Product with this name already exists in this category',
        });
      return;
    }
  }

  // Jika ada categoryId baru, cek validitasnya
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

  // audit stock logic
  let stockChange = 0;
  if (parsed.data.stock !== undefined) {
    stockChange = parsed.data.stock - product.stock;
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...parsed.data,
      name: newName,
      ...(file && {
        imageUrl: file.path,
        imagePublicId: file.filename,
      }),
      ...(stockChange !== 0 && {
        stockHistories: {
          create: {
            change: stockChange,
            reason: 'Manual update by Admin',
          },
        },
      }),
    },
  });

  res.json({
    message: 'Product updated',
    product: updated,
  });
};

export const deleteProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const getStockHistories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const productId = req.query.productId as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const histories = await prisma.stockHistory.findMany({
      where: {
        ...(productId && { productId: productId }),
        ...(startDate || endDate
          ? {
              createdAt: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined,
              },
            }
          : {}),
      },
      include: {
        product: {
          select: {
            name: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      message: 'Stock histories fetched successfully',
      data: histories,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stock histories' });
  }
};
