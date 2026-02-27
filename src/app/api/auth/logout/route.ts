import { ok } from "@/lib/api";

export async function POST() {
  const response = ok({ loggedOut: true });
  response.cookies.set("sb-auth-token", "", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 0,
  });
  return response;
}

