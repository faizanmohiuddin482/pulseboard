import { NextRequest, NextResponse } from "next/server";
import { GitHubClient } from "@/lib/github/client";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth/error?error=${error}`, request.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/error?error=no_code", request.url)
    );
  }

  try {
    const githubClient = new GitHubClient();
    const auth = await githubClient.authenticateWithOAuth(code);

    // Store auth in session/cookie
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("github_auth", JSON.stringify(auth), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("GitHub authentication error:", error);
    return NextResponse.redirect(
      new URL(`/auth/error?error=authentication_failed`, request.url)
    );
  }
}
