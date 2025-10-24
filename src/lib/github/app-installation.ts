import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";

export class GitHubAppInstallation {
  private octokit: Octokit;

  constructor() {
    this.octokit = new Octokit({
      auth: {
        appId: process.env.GITHUB_APP_ID!,
        privateKey: process.env.GITHUB_APP_PRIVATE_KEY!,
        installationId: process.env.GITHUB_APP_INSTALLATION_ID!,
      },
    });
  }

  async getInstallationUrl(): Promise<string> {
    // Generate installation URL for users to install the GitHub App
    const appId = process.env.GITHUB_APP_ID;
    return `https://github.com/apps/${process.env.GITHUB_APP_NAME}/installations/new`;
  }

  async getUserInstallations(userToken: string): Promise<any[]> {
    const userOctokit = new Octokit({ auth: userToken });

    try {
      const { data } =
        await userOctokit.apps.listInstallationsForAuthenticatedUser();
      return data.installations;
    } catch (error) {
      throw new Error(`Failed to get user installations: ${error}`);
    }
  }

  async createRepositoryForUser(
    userToken: string,
    repoName: string,
    description: string
  ): Promise<any> {
    const userOctokit = new Octokit({ auth: userToken });

    try {
      const { data } = await userOctokit.repos.createForAuthenticatedUser({
        name: repoName,
        description,
        private: true,
        auto_init: true,
        gitignore_template: "Node",
      });
      return data;
    } catch (error) {
      throw new Error(`Failed to create repository: ${error}`);
    }
  }
}
