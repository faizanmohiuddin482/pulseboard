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

    // Get ticket
    const ticket = await gitOps.getTicket(params.id);

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticket" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { repo, changes, commitMessage } = body;

    if (!repo || !changes) {
      return NextResponse.json(
        { error: "Repository and changes data required" },
        { status: 400 }
      );
    }

    // Initialize Git operations
    const repoPath = path.join(process.cwd(), "repos", repo);
    const gitOps = new GitOperations(repoPath);

    // Pull latest changes
    await gitOps.pullLatest();

    // Get current ticket
    const currentTicket = await gitOps.getTicket(params.id);
    if (!currentTicket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Update ticket
    const commitHash = await gitOps.commitTicketChange(
      currentTicket,
      changes,
      commitMessage || `Update ticket: ${params.id}`,
      {
        name: auth.user.name || auth.user.login,
        email: auth.user.email || `${auth.user.login}@users.noreply.github.com`,
      }
    );

    // Push changes
    await gitOps.pushChanges();

    // Get updated ticket
    const updatedTicket = await gitOps.getTicket(params.id);

    return NextResponse.json({
      success: true,
      data: { ...updatedTicket, commit_hash: commitHash },
    });
  } catch (error) {
    console.error("Error updating ticket:", error);
    return NextResponse.json(
      { error: "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete ticket
    const commitHash = await gitOps.deleteTicket(params.id, {
      name: auth.user.name || auth.user.login,
      email: auth.user.email || `${auth.user.login}@users.noreply.github.com`,
    });

    // Push changes
    await gitOps.pushChanges();

    return NextResponse.json({
      success: true,
      data: { commit_hash: commitHash },
    });
  } catch (error) {
    console.error("Error deleting ticket:", error);
    return NextResponse.json(
      { error: "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
