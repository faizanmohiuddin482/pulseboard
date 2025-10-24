import { NextRequest, NextResponse } from "next/server";
import { GitHubClient } from "@/lib/github/client";
import { cookies } from "next/headers";

async function getAuthFromCookies(): Promise<{
  access_token: string;
  user: { login: string; name?: string; email?: string };
} | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("github_auth");
  return authCookie ? JSON.parse(authCookie.value) : null;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { repo, path, content, message } = body;

    if (!repo || !path || !content || !message) {
      return NextResponse.json(
        { error: "Repository, path, content, and message are required" },
        { status: 400 }
      );
    }

    // Upload image using GitHub API
    const githubClient = new GitHubClient(auth.access_token);
    await githubClient.setAuthFromToken(auth.access_token);

    const result = await githubClient.createFile(repo, path, content, message);

    return NextResponse.json({
      success: true,
      data: {
        sha: (result as { sha: string }).sha,
        html_url: `https://github.com/${auth.user.login}/${repo}/blob/main/${path}`,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}
