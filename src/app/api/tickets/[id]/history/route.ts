import { NextRequest, NextResponse } from "next/server";
import { GitOperations } from "@/lib/git/operations";
import { cookies } from "next/headers";
import path from "path";

async function getAuthFromCookies(): Promise<any> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("github_auth");
  return authCookie ? JSON.parse(authCookie.value) : null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const repo = searchParams.get("repo");

    if (!repo) {
      return NextResponse.json(
        { error: "Repository parameter required" },
        { status: 400 }
      );
    }

    // Initialize Git operations
    const repoPath = path.join(process.cwd(), "repos", repo);
    const gitOps = new GitOperations(repoPath);

    // Pull latest changes
    await gitOps.pullLatest();

    // Get ticket history
    const history = await gitOps.getTicketHistory(params.id);

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("Error fetching ticket history:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket history" },
      { status: 500 }
    );
  }
}
