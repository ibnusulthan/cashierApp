import { Request, Response } from "express";
import prisma from "@/prisma";
import {
  createUserService,
  deactivateUserService,
  getActiveUsersService,
} from "./user.service";
import { createUserSchema, userIdParamSchema } from "./user.validation";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  const users = await getActiveUsersService();
  res.json(users);
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
