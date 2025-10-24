// Simple utility functions for testing
export function formatTicketId(timestamp: number): string {
  return `ticket-${timestamp}`;
}

export function validateTicketStatus(status: string): boolean {
  const validStatuses = [
    "backlog",
    "in_progress",
    "in_review",
    "done",
    "cancelled",
  ];
  return validStatuses.includes(status);
}

export function validatePriority(priority: string): boolean {
  const validPriorities = ["low", "medium", "high", "critical"];
  return validPriorities.includes(priority);
}

export function generateCommitMessage(
  ticketId: string,
  action: string,
  details?: string
): string {
  const baseMessage = `${action} ticket: ${ticketId}`;
  return details ? `${baseMessage} - ${details}` : baseMessage;
}

// Tests for utility functions
describe("Utility Functions", () => {
  describe("formatTicketId", () => {
    it("should format ticket ID correctly", () => {
      const timestamp = 1640995200000; // 2022-01-01T00:00:00Z
      const ticketId = formatTicketId(timestamp);
      expect(ticketId).toBe("ticket-1640995200000");
    });
  });

  describe("validateTicketStatus", () => {
    it("should validate correct status values", () => {
      expect(validateTicketStatus("backlog")).toBe(true);
      expect(validateTicketStatus("in_progress")).toBe(true);
      expect(validateTicketStatus("in_review")).toBe(true);
      expect(validateTicketStatus("done")).toBe(true);
      expect(validateTicketStatus("cancelled")).toBe(true);
    });

    it("should reject invalid status values", () => {
      expect(validateTicketStatus("invalid")).toBe(false);
      expect(validateTicketStatus("")).toBe(false);
      expect(validateTicketStatus("pending")).toBe(false);
    });
  });

  describe("validatePriority", () => {
    it("should validate correct priority values", () => {
      expect(validatePriority("low")).toBe(true);
      expect(validatePriority("medium")).toBe(true);
      expect(validatePriority("high")).toBe(true);
      expect(validatePriority("critical")).toBe(true);
    });

    it("should reject invalid priority values", () => {
      expect(validatePriority("invalid")).toBe(false);
      expect(validatePriority("")).toBe(false);
      expect(validatePriority("urgent")).toBe(false);
    });
  });

  describe("generateCommitMessage", () => {
    it("should generate basic commit message", () => {
      const message = generateCommitMessage("ticket-123", "Create");
      expect(message).toBe("Create ticket: ticket-123");
    });

    it("should generate commit message with details", () => {
      const message = generateCommitMessage(
        "ticket-123",
        "Update",
        "Changed status to in_progress"
      );
      expect(message).toBe(
        "Update ticket: ticket-123 - Changed status to in_progress"
      );
    });
  });
});
