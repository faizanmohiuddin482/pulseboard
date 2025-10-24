export interface GitHubConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string[];
}

export class GitHubConfigManager {
  private static instance: GitHubConfigManager;
  private config: GitHubConfig | null = null;

  private constructor() {}

  static getInstance(): GitHubConfigManager {
    if (!GitHubConfigManager.instance) {
      GitHubConfigManager.instance = new GitHubConfigManager();
    }
    return GitHubConfigManager.instance;
  }

  getConfig(): GitHubConfig {
    if (!this.config) {
      this.config = {
        clientId: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        redirectUri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github`,
        scope: ["repo", "user"],
      };
    }
    return this.config;
  }

  isConfigured(): boolean {
    const config = this.getConfig();
    return !!(config.clientId && config.clientSecret);
  }

  getAuthUrl(): string {
    const config = this.getConfig();
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope.join(","),
      state: this.generateState(),
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  private generateState(): string {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }
}
