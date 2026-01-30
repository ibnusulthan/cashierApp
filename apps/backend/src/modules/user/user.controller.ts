import { Request, Response } from "express";
import prisma from "@/prisma";
import {
  createUserService,
  deactivateUserService,
  getActiveUsersService,
  updateUserService
} from "./user.service";
import { createUserSchema, userIdParamSchema } from "./user.validation";
import { updateUserSchema } from "./user.validation";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const qSearch = req.query.search as string;
  const qPage = req.query.page as string;
  const qLimit = req.query.limit as string;

  const pageNum = parseInt(qPage) || 1;
  const limitNum = parseInt(qLimit) || 10;

  const result = await getActiveUsersService({
    search: qSearch,
    page: pageNum,
    limit: limitNum,
  });
  
  res.json(result);
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid input",
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = await createUserService(parsed.data);
    res.status(201).json({
      message: "User created",
      user,
    });
  } catch (error: any) {
    if (error?.code === "P2002") {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    res.status(500).json({ message: "Failed to create user" });
  }
};


export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const parsed = userIdParamSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ message: "Invalid user id" });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: parsed.data.id },
  });
  
  if (!user || !user.isActive) {
    res.status(404).json({ message: "User not found or already deactivated" });
    return;
  }

  const adminId = req.user?.userId;

  if (adminId === parsed.data.id) {
    res.status(400).json({ message: "You cannot deactivate your own account (admin account)"});
    return;
  }

  await deactivateUserService(parsed.data.id);
  res.json({ message: "User deactivated (soft delete)" });
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  
  const parsed = updateUserSchema.safeParse(req.body);
  
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input", errors: parsed.error.flatten() });
    return;
  }

  const result = await updateUserService(id, req.body);
  res.json({ message: "User updated successfully", user: result });
};
