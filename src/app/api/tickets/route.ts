import { NextRequest, NextResponse } from "next/server";
import { GitHubClient } from "@/lib/github/client";
import { Ticket } from "@/types";
import { cookies } from "next/headers";

async function getAuthFromCookies(): Promise<{
  access_token: string;
  user: { login: string; name?: string; email?: string };
} | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("github_auth");
  return authCookie ? JSON.parse(authCookie.value) : null;
}

export async function GET(request: NextRequest) {
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

    // Fetch tickets using GitHub API directly
    const githubClient = new GitHubClient(auth.access_token);
    await githubClient.setAuthFromToken(auth.access_token);

    // Get the contents of the tickets directory
    const ticketsDir = await githubClient.getRepositoryContents(
      repo,
      "tickets"
    );

    if (!ticketsDir || !Array.isArray(ticketsDir)) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch each ticket file
    const tickets: Ticket[] = [];
    for (const file of ticketsDir) {
      if (file.type === "file" && file.name.endsWith(".json")) {
        try {
          const ticketContent = await githubClient.getFileContent(
            repo,
            file.path
          );
          const ticket = JSON.parse(ticketContent);
          tickets.push(ticket);
        } catch (error) {
          console.error(`Failed to fetch ticket ${file.name}:`, error);
        }
      }
    }

    return NextResponse.json({ success: true, data: tickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch tickets" },
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
    const { repo, ticket } = body;

    if (!repo || !ticket) {
      return NextResponse.json(
        { error: "Repository and ticket data required" },
        { status: 400 }
      );
    }

    // Create ticket using GitHub API directly
    const githubClient = new GitHubClient(auth.access_token);
    await githubClient.setAuthFromToken(auth.access_token);

    const ticketId = `ticket-${Date.now()}`;
    const newTicket: Ticket = {
      ...ticket,
      id: ticketId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: auth.user.login,
      updated_by: auth.user.login,
      comments: [],
    };

    // Create the ticket file directly in the repository
    const ticketPath = `tickets/${ticketId}.json`;
    const ticketContent = JSON.stringify(newTicket, null, 2);

    const commitMessage = `Create ticket: ${newTicket.title}`;

    // Use GitHub API to create the file
    const result = await githubClient.createFile(
      repo,
      ticketPath,
      ticketContent,
      commitMessage
    );

    return NextResponse.json({
      success: true,
      data: { ...newTicket, commit_hash: (result as { sha: string }).sha },
    });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
