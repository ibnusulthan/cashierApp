import prisma from "@/prisma";
import { comparePassword } from "@/utils/hash";
import { signToken } from "@/utils/jwt";
import { LoginResponse } from "./auth.types";

export const loginService = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user || !user.isActive) {
    throw new Error("Invalid credentials");
  }

  const match = await comparePassword(password, user.password);
  if (!match) throw new Error("Invalid credentials");

  const token = signToken({
    userId: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
    },
  };
};
