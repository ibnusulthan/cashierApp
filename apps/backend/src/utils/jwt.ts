import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

const JWT_SECRET = process.env.JWT_SECRET as string;

//Konversi env ke format yang diterima types jsonwebtoken
const EXPIRES_IN =
  process.env.JWT_EXPIRES_IN === undefined
    ? "1d"
    : process.env.JWT_EXPIRES_IN;

const signOptions: SignOptions = {
  expiresIn: EXPIRES_IN as any, //trick kecil biar typings tidak rewel
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, signOptions);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
};
