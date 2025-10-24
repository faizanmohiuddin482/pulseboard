import { Ticket, TicketStatus, Priority, User, Repository } from "@/types";

describe("Types", () => {
  describe("Ticket", () => {
    it("should create a valid ticket object", () => {
      const ticket: Ticket = {
        id: "ticket-123",
        title: "Test Ticket",
        description: "Test Description",
        status: "backlog",
        priority: "medium",
        assignee: "testuser",
        labels: ["bug", "urgent"],
        due_date: "2024-12-31",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by: "testuser",
        updated_by: "testuser",
        comments: [],
        linked_issues: [1, 2],
        linked_prs: [3, 4],
      };

      expect(ticket.id).toBe("ticket-123");
      expect(ticket.title).toBe("Test Ticket");
      expect(ticket.status).toBe("backlog");
      expect(ticket.priority).toBe("medium");
      expect(ticket.labels).toEqual(["bug", "urgent"]);
      expect(ticket.comments).toEqual([]);
    });

    it("should handle optional fields", () => {
      const ticket: Ticket = {
        id: "ticket-124",
        title: "Minimal Ticket",
        description: "Minimal Description",
        status: "in_progress",
        priority: "high",
        labels: [],
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        created_by: "testuser",
        updated_by: "testuser",
        comments: [],
      };

      expect(ticket.assignee).toBeUndefined();
      expect(ticket.labels).toEqual([]);
      expect(ticket.due_date).toBeUndefined();
      expect(ticket.linked_issues).toBeUndefined();
      expect(ticket.linked_prs).toBeUndefined();
    });
  });

  describe("TicketStatus", () => {
    it("should accept valid status values", () => {
      const statuses: TicketStatus[] = [
        "backlog",
        "in_progress",
        "in_review",
        "done",
        "cancelled",
      ];

      statuses.forEach((status) => {
        expect(typeof status).toBe("string");
        expect([
          "backlog",
          "in_progress",
          "in_review",
          "done",
          "cancelled",
        ]).toContain(status);
      });
    });
  });

  describe("Priority", () => {
    it("should accept valid priority values", () => {
      const priorities: Priority[] = ["low", "medium", "high", "critical"];

      priorities.forEach((priority) => {
        expect(typeof priority).toBe("string");
        expect(["low", "medium", "high", "critical"]).toContain(priority);
      });
    });
  });

  describe("User", () => {
    it("should create a valid user object", () => {
      const user: User = {
        id: 1,
        login: "testuser",
        name: "Test User",
        email: "test@example.com",
        avatar_url: "https://example.com/avatar.jpg",
      };

      expect(user.id).toBe(1);
      expect(user.login).toBe("testuser");
      expect(user.name).toBe("Test User");
      expect(user.email).toBe("test@example.com");
      expect(user.avatar_url).toBe("https://example.com/avatar.jpg");
    });
  });

  describe("Repository", () => {
    it("should create a valid repository object", () => {
      const repo: Repository = {
        id: 1,
        name: "test-repo",
        full_name: "user/test-repo",
        private: true,
        html_url: "https://github.com/user/test-repo",
        clone_url: "https://github.com/user/test-repo.git",
        default_branch: "main",
      };

      expect(repo.id).toBe(1);
      expect(repo.name).toBe("test-repo");
      expect(repo.full_name).toBe("user/test-repo");
      expect(repo.private).toBe(true);
      expect(repo.html_url).toBe("https://github.com/user/test-repo");
      expect(repo.clone_url).toBe("https://github.com/user/test-repo.git");
      expect(repo.default_branch).toBe("main");
    });
  });
});
