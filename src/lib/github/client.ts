import { Octokit } from "@octokit/rest";
import { createOAuthUserAuth } from "@octokit/auth-oauth-user";
import { User, Repository, GitHubAuth } from "@/types";

export class GitHubClient {
  private octokit: Octokit;
  private auth: GitHubAuth | null = null;

  constructor(authToken?: string) {
    this.octokit = new Octokit({
      auth: authToken || process.env.GITHUB_TOKEN,
    });
  }

  async setAuthFromToken(token: string): Promise<void> {
    try {
      const { data: user } = await this.octokit.users.getAuthenticated();
      this.auth = {
        access_token: token,
        token_type: "bearer",
        scope: "repo,user",
        user: {
          id: user.id,
          login: user.login,
          name: user.name || user.login,
          email: user.email || `${user.login}@users.noreply.github.com`,
          avatar_url: user.avatar_url,
        },
      };
    } catch (error) {
      console.error("Failed to setup auth from token:", error);
      throw error;
    }
  }

  async authenticateWithOAuth(code: string): Promise<GitHubAuth> {
    try {
      const auth = await createOAuthUserAuth({
        clientType: "oauth-app",
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      });

      const { token } = await auth();
      this.octokit = new Octokit({ auth: token });

      const { data: user } = await this.octokit.users.getAuthenticated();

      this.auth = {
        access_token: token,
        token_type: "bearer",
        scope: "repo,user",
        user: user as User,
      };

      return this.auth;
    } catch (error) {
      throw new Error(`GitHub authentication failed: ${error}`);
    }
  }

  async getUserRepositories(): Promise<Repository[]> {
    if (!this.auth) {
      throw new Error("Not authenticated");
    }

    try {
      const { data } = await this.octokit.repos.listForAuthenticatedUser({
        type: "private",
        sort: "updated",
        per_page: 100,
      });

      return data.map((repo) => ({
        id: repo.id,
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        html_url: repo.html_url,
        clone_url: repo.clone_url,
        default_branch: repo.default_branch,
      }));
    } catch (error) {
      throw new Error(`Failed to fetch repositories: ${error}`);
    }
  }

  async createRepository(
    name: string,
    description: string
  ): Promise<Repository> {
    if (!this.auth) {
      throw new Error("Not authenticated");
    }

    try {
      const { data } = await this.octokit.repos.createForAuthenticatedUser({
        name,
        description,
        private: true,
        auto_init: true,
        gitignore_template: "Node",
      });

      return {
        id: data.id,
        name: data.name,
        full_name: data.full_name,
        private: data.private,
        html_url: data.html_url,
        clone_url: data.clone_url,
        default_branch: data.default_branch,
      };
    } catch (error) {
      throw new Error(`Failed to create repository: ${error}`);
    }
  }

  async getRepositoryContents(
    repo: string,
    path: string = ""
  ): Promise<unknown> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.auth!.user.login,
        repo,
        path,
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to get repository contents: ${error}`);
    }
  }

  async createFile(
    repo: string,
    path: string,
    content: string,
    message: string
  ): Promise<unknown> {
    try {
      const { data } = await this.octokit.repos.createOrUpdateFileContents({
        owner: this.auth!.user.login,
        repo,
        path,
        message,
        content: Buffer.from(content).toString("base64"),
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to create file: ${error}`);
    }
  }

  async getFileContent(repo: string, path: string): Promise<string> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.auth!.user.login,
        repo,
        path,
      });

      if (Array.isArray(data)) {
        throw new Error("Expected file, got directory");
      }

      return Buffer.from(
        (data as { content: string }).content,
        "base64"
      ).toString("utf-8");
    } catch (error) {
      throw new Error(`Failed to get file content: ${error}`);
    }
  }

  async createOrUpdateFile(
    repo: string,
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<void> {
    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.auth!.user.login,
        repo,
        path,
        message,
        content: Buffer.from(content).toString("base64"),
        sha,
      });
    } catch (error) {
      throw new Error(`Failed to create/update file: ${error}`);
    }
  }

  async deleteFile(repo: string, path: string, message: string): Promise<void> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner: this.auth!.user.login,
        repo,
        path,
      });

      if ("sha" in data) {
        await this.octokit.repos.deleteFile({
          owner: this.auth!.user.login,
          repo,
          path,
          message,
          sha: data.sha,
        });
      }
    } catch (error) {
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  async getCommits(repo: string, path?: string): Promise<unknown[]> {
    try {
      const { data } = await this.octokit.repos.listCommits({
        owner: this.auth!.user.login,
        repo,
        path,
        per_page: 100,
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to get commits: ${error}`);
    }
  }

  async getCommit(repo: string, sha: string): Promise<unknown> {
    try {
      const { data } = await this.octokit.repos.getCommit({
        owner: this.auth!.user.login,
        repo,
        ref: sha,
      });

      return data;
    } catch (error) {
      throw new Error(`Failed to get commit: ${error}`);
    }
  }

  isAuthenticated(): boolean {
    return this.auth !== null;
  }

  getCurrentUser(): User | null {
    return this.auth?.user || null;
  }
}
