import simpleGit, { SimpleGit } from "simple-git";
import { Ticket, GitCommit, TicketHistory, TicketChange } from "@/types";
import path from "path";
import fs from "fs/promises";

export class GitOperations {
  private git: SimpleGit;
  private repoPath: string;

  constructor(repoPath: string) {
    this.repoPath = repoPath;
    this.git = simpleGit(repoPath);
  }

  async cloneRepository(cloneUrl: string, localPath: string): Promise<void> {
    try {
      await this.git.clone(cloneUrl, localPath);
      this.repoPath = localPath;
      this.git = simpleGit(localPath);
    } catch (error) {
      throw new Error(`Failed to clone repository: ${error}`);
    }
  }

  async pullLatest(): Promise<void> {
    try {
      await this.git.pull();
    } catch (error) {
      throw new Error(`Failed to pull latest changes: ${error}`);
    }
  }

  async commitTicketChange(
    ticket: Ticket,
    changes: Partial<Ticket>,
    commitMessage: string,
    author: { name: string; email: string }
  ): Promise<string> {
    try {
      // Update ticket file
      const ticketPath = path.join(
        this.repoPath,
        "tickets",
        `${ticket.id}.json`
      );
      const updatedTicket = {
        ...ticket,
        ...changes,
        updated_at: new Date().toISOString(),
      };

      await fs.writeFile(ticketPath, JSON.stringify(updatedTicket, null, 2));

      // Add and commit changes
      await this.git.add(ticketPath);
      await this.git.addConfig("user.name", author.name);
      await this.git.addConfig("user.email", author.email);

      const result = await this.git.commit(commitMessage);
      return result.commit;
    } catch (error) {
      throw new Error(`Failed to commit ticket change: ${error}`);
    }
  }

  async createTicket(
    ticket: Ticket,
    author: { name: string; email: string }
  ): Promise<string> {
    try {
      // Ensure tickets directory exists
      const ticketsDir = path.join(this.repoPath, "tickets");
      await fs.mkdir(ticketsDir, { recursive: true });

      // Create ticket file
      const ticketPath = path.join(ticketsDir, `${ticket.id}.json`);
      await fs.writeFile(ticketPath, JSON.stringify(ticket, null, 2));

      // Add and commit
      await this.git.add(ticketPath);
      await this.git.addConfig("user.name", author.name);
      await this.git.addConfig("user.email", author.email);

      const result = await this.git.commit(`Create ticket: ${ticket.title}`);
      return result.commit;
    } catch (error) {
      throw new Error(`Failed to create ticket: ${error}`);
    }
  }

  async deleteTicket(
    ticketId: string,
    author: { name: string; email: string }
  ): Promise<string> {
    try {
      const ticketPath = path.join(
        this.repoPath,
        "tickets",
        `${ticketId}.json`
      );

      // Remove file and commit
      await this.git.rm(ticketPath);
      await this.git.addConfig("user.name", author.name);
      await this.git.addConfig("user.email", author.email);

      const result = await this.git.commit(`Delete ticket: ${ticketId}`);
      return result.commit;
    } catch (error) {
      throw new Error(`Failed to delete ticket: ${error}`);
    }
  }

  async pushChanges(): Promise<void> {
    try {
      await this.git.push();
    } catch (error) {
      throw new Error(`Failed to push changes: ${error}`);
    }
  }

  async getTicketHistory(ticketId: string): Promise<TicketHistory> {
    try {
      const ticketPath = `tickets/${ticketId}.json`;
      const log = await this.git.log({ file: ticketPath });

      const commits: GitCommit[] = log.all.map((commit) => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
        files: [ticketPath],
      }));

      const changes: TicketChange[] = [];

      // Parse commit messages to extract changes
      for (let i = 0; i < commits.length - 1; i++) {
        const currentCommit = commits[i];
        const nextCommit = commits[i + 1];

        // This is a simplified version - in a real implementation,
        // you'd want to compare the actual file contents
        const change: TicketChange = {
          field: "general",
          old_value: "previous state",
          new_value: "current state",
          changed_by: currentCommit.author,
          changed_at: currentCommit.date,
          commit_hash: currentCommit.hash,
        };

        changes.push(change);
      }

      return {
        ticket_id: ticketId,
        commits,
        changes,
      };
    } catch (error) {
      throw new Error(`Failed to get ticket history: ${error}`);
    }
  }

  async getAllTickets(): Promise<Ticket[]> {
    try {
      const ticketsDir = path.join(this.repoPath, "tickets");
      const files = await fs.readdir(ticketsDir);
      const ticketFiles = files.filter((file) => file.endsWith(".json"));

      const tickets: Ticket[] = [];

      for (const file of ticketFiles) {
        const filePath = path.join(ticketsDir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const ticket = JSON.parse(content) as Ticket;
        tickets.push(ticket);
      }

      return tickets;
    } catch (error) {
      throw new Error(`Failed to get all tickets: ${error}`);
    }
  }

  async getTicket(ticketId: string): Promise<Ticket | null> {
    try {
      const ticketPath = path.join(
        this.repoPath,
        "tickets",
        `${ticketId}.json`
      );
      const content = await fs.readFile(ticketPath, "utf-8");
      return JSON.parse(content) as Ticket;
    } catch (error) {
      return null;
    }
  }

  async getCommitHistory(path?: string): Promise<GitCommit[]> {
    try {
      const log = await this.git.log({ file: path });

      return log.all.map((commit) => ({
        hash: commit.hash,
        message: commit.message,
        author: commit.author_name,
        date: commit.date,
        files: [path || "all"],
      }));
    } catch (error) {
      throw new Error(`Failed to get commit history: ${error}`);
    }
  }

  async revertToCommit(commitHash: string): Promise<void> {
    try {
      await this.git.reset(["--hard", commitHash]);
    } catch (error) {
      throw new Error(`Failed to revert to commit: ${error}`);
    }
  }
}
