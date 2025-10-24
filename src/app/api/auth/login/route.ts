import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github`;

  if (!clientId) {
    return NextResponse.json(
      { error: "GitHub client ID not configured" },
      { status: 500 }
    );
  }

  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "repo,user");
  githubAuthUrl.searchParams.set("state", "random_state_string");

  return NextResponse.redirect(githubAuthUrl.toString());
}
