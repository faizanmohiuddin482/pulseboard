# PulseBoard - Project Management Application

A modern project management tool that stores all tickets and updates directly in GitHub private repositories, using Git commits as a timeline for complete audit trails.

## 🚀 Features

- **Git-Based Storage**: All tickets stored as JSON files in GitHub repositories
- **Complete Audit Trail**: Every change tracked in Git history with descriptive commit messages
- **GitHub Integration**: Seamless integration with GitHub Issues, PRs, and Actions
- **Modern UI**: Built with Next.js, TypeScript, and Tailwind CSS
- **Real-time Updates**: Automatic synchronization with GitHub repositories
- **Team Collaboration**: Support for multiple users and repositories

## 🏗️ Architecture

### Core Components

1. **Authentication Layer**: GitHub OAuth integration for secure access
2. **Git Operations**: Automated Git operations for ticket management
3. **API Layer**: RESTful API for frontend-backend communication
4. **Frontend**: Modern React-based UI with TypeScript

### Data Storage

- **Primary Storage**: GitHub private repositories
- **Ticket Format**: JSON files in `/tickets/{ticket-id}.json`
- **History**: Git commit history for complete audit trail
- **Structure**: Organized by repository and ticket ID

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **GitHub Integration**: Octokit, GitHub API v3/v4
- **Git Operations**: simple-git, isomorphic-git
- **State Management**: React Context, Zustand
- **Authentication**: GitHub OAuth

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- GitHub account
- GitHub OAuth App (for authentication)

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd github-jira
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp env.example .env.local
   ```

   Update `.env.local` with your GitHub OAuth credentials:

   ```env
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   GITHUB_TOKEN=your_github_personal_access_token
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Create GitHub OAuth App**

   - Go to GitHub Settings > Developer settings > OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL to: `http://localhost:3000/api/auth/github`
   - Copy Client ID and Client Secret to your `.env.local`

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### GitHub OAuth Setup

1. **Create GitHub OAuth App**:

   - Repository: GitHub Settings > Developer settings > OAuth Apps
   - Application name: "GitHub Jira"
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/github`

2. **Generate Personal Access Token** (optional):
   - Go to GitHub Settings > Developer settings > Personal access tokens
   - Generate token with `repo` scope
   - Add to `.env.local` as `GITHUB_TOKEN`

### Repository Structure

The application expects the following structure in your GitHub repository:

```
your-repo/
├── tickets/
│   ├── ticket-1234567890.json
│   ├── ticket-1234567891.json
│   └── ...
├── README.md
└── .gitignore
```

## 📋 Usage

### Creating Tickets

1. **Login with GitHub**: Click "Login with GitHub" on the homepage
2. **Select Repository**: Choose a repository from your GitHub account
3. **Create Ticket**: Click "Create Ticket" and fill in the details
4. **Automatic Commit**: The ticket is automatically committed to your repository

### Managing Tickets

- **View Tickets**: All tickets are displayed in a grid layout
- **Update Status**: Change ticket status (Backlog → In Progress → In Review → Done)
- **Assign Users**: Assign tickets to team members
- **Add Comments**: Comments are stored as part of the ticket JSON
- **View History**: Complete audit trail via Git history

### Ticket Fields

- **Title**: Short description of the ticket
- **Description**: Detailed description
- **Status**: Backlog, In Progress, In Review, Done, Cancelled
- **Priority**: Low, Medium, High, Critical
- **Assignee**: GitHub username
- **Labels**: Custom labels for categorization
- **Due Date**: Optional due date
- **Comments**: Array of comments with timestamps

## 🔒 Security

- **OAuth Authentication**: Secure GitHub OAuth flow
- **Repository Permissions**: Access control based on GitHub repository permissions
- **Token Security**: GitHub tokens stored securely in HTTP-only cookies
- **Input Validation**: All user inputs validated before Git operations
- **Rate Limiting**: Respects GitHub API rate limits

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Individual component and function tests
- **Integration Tests**: API endpoint tests
- **Git Operations Tests**: Critical Git operation tests
- **Authentication Tests**: OAuth flow tests

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**:

   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**:

   - Add all environment variables in Vercel dashboard
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

3. **Update GitHub OAuth App**:
   - Update Authorization callback URL to your production URL
   - Example: `https://your-app.vercel.app/api/auth/github`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 API Reference

### Authentication Endpoints

- `GET /api/auth/login` - Initiate GitHub OAuth
- `GET /api/auth/github` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Repository Endpoints

- `GET /api/repositories` - List user repositories
- `POST /api/repositories` - Create new repository

### Ticket Endpoints

- `GET /api/tickets?repo={repo}` - List tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/{id}?repo={repo}` - Get ticket
- `PUT /api/tickets/{id}` - Update ticket
- `DELETE /api/tickets/{id}?repo={repo}` - Delete ticket
- `GET /api/tickets/{id}/history?repo={repo}` - Get ticket history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions and ideas

## 🔮 Roadmap

### Phase 2 Features

- [ ] Sprint planning and management
- [ ] Time tracking stored in commits
- [ ] Custom fields and ticket types
- [ ] Automated workflows using GitHub Actions
- [ ] Reporting and analytics from Git history
- [ ] Export/import from Jira
- [ ] Mobile-responsive PWA
- [ ] Real-time collaboration
- [ ] Advanced search and filtering
- [ ] Custom dashboards and widgets

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- GitHub integration via [Octokit](https://octokit.github.io/)
- Git operations via [simple-git](https://github.com/steveukx/git-js)
- Icons by [Lucide](https://lucide.dev/)
