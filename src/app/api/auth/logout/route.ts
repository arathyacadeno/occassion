import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    expires: new Date(0),
    path: "/",
  };

  response.cookies.set("occasions_token", "", cookieOptions);
  response.cookies.delete("occasions_token");

  // Also clear legacy or auxiliary cookie names if present
  response.cookies.set("token", "", cookieOptions);
  response.cookies.delete("token");
  response.cookies.set("occasions_auth_token", "", cookieOptions);
  response.cookies.delete("occasions_auth_token");

  return response;
}

