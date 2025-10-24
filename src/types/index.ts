export interface User {
  id: number;
  login: string;
  name: string;
  email: string;
  avatar_url: string;
}

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  assignee?: string;
  labels: string[];
  due_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  comments: Comment[];
  linked_issues?: number[];
  linked_prs?: number[];
  images?: string[];
}

export type TicketStatus =
  | "backlog"
  | "in_progress"
  | "in_review"
  | "done"
  | "cancelled";

export type Priority = "low" | "medium" | "high" | "critical";

export interface Comment {
  id: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  repository: Repository;
  tickets: Ticket[];
  created_at: string;
  updated_at: string;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  files: string[];
}

export interface TicketHistory {
  ticket_id: string;
  commits: GitCommit[];
  changes: TicketChange[];
}

export interface TicketChange {
  field: string;
  old_value: any;
  new_value: any;
  changed_by: string;
  changed_at: string;
  commit_hash: string;
}

export interface GitHubAuth {
  access_token: string;
  token_type: string;
  scope: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
