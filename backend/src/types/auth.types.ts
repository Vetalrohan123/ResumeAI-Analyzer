import type { UserRole } from "@prisma/client";
import type { Request } from "express";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest
  extends Request {
  user?: AuthUser;
}