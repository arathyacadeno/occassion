import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "occasions-florist-calicut-secret-2026-secure-jwt";
const TOKEN_EXPIRY = "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: "customer" | "admin";
}

export function signUserToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyUserToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Extracts authenticated user from request headers or cookies
 */
export function getAuthenticatedUser(request: Request): (TokenPayload & { id: string }) | null {
  let token: string | null = null;

  // 1. Authorization header: Bearer <token>
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  }

  // 2. Cookie header: occasions_token=<token>
  if (!token) {
    const cookieHeader = request.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)occasions_token=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  if (!token) return null;

  const payload = verifyUserToken(token);
  if (!payload) return null;

  // Verify user still exists in DB
  try {
    const db = getDb();
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(payload.userId);
    if (!user) return null;
    return {
      userId: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "customer" | "admin",
    };
  } catch {
    return {
      ...payload,
      id: payload.userId,
    };
  }
}
