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

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const githubClient = new GitHubClient(auth.access_token);
    await githubClient.setAuthFromToken(auth.access_token);
    const repositories = await githubClient.getUserRepositories();

    return NextResponse.json({ success: true, data: repositories });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Repository name is required" },
        { status: 400 }
      );
    }

    const githubClient = new GitHubClient(auth.access_token);
    await githubClient.setAuthFromToken(auth.access_token);
    const repository = await githubClient.createRepository(
      name,
      description || "Project management repository"
    );

    return NextResponse.json({ success: true, data: repository });
  } catch (error) {
    console.error("Error creating repository:", error);
    return NextResponse.json(
      { error: "Failed to create repository" },
      { status: 500 }
    );
  }
}
