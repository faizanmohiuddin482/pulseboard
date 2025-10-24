# GitHub Jira - Setup Instructions

## 🚀 Quick Start

### 1. Environment Setup

1. **Copy environment variables**:

   ```bash
   cp env.example .env.local
   ```

2. **Configure GitHub OAuth**:

   - Go to [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Fill in the details:
     - Application name: `GitHub Jira`
     - Homepage URL: `http://localhost:3000`
     - Authorization callback URL: `http://localhost:3000/api/auth/github`
   - Copy the Client ID and Client Secret to your `.env.local`

3. **Update `.env.local`**:
   ```env
   GITHUB_CLIENT_ID=your_github_client_id_here
   GITHUB_CLIENT_SECRET=your_github_client_secret_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 2. Install and Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test
```

### 3. Access the Application

- Open [http://localhost:3000](http://localhost:3000)
- Click "Login with GitHub"
- Authorize the application
- Select a repository to start managing tickets

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── api/                # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   └── tickets/        # Ticket management endpoints
│   ├── dashboard/          # Dashboard page
│   └── page.tsx            # Home page
├── lib/                    # Core libraries
│   ├── github/             # GitHub API client
│   └── git/                # Git operations
├── types/                  # TypeScript definitions
└── __tests__/              # Test files
```

## 🔧 Key Features Implemented

### ✅ Authentication & Repository Setup

- GitHub OAuth integration
- Repository selection and creation
- Secure token management

### ✅ Ticket Management System

- Create, read, update, delete tickets
- Status workflow (Backlog → In Progress → In Review → Done)
- Priority levels (Low, Medium, High, Critical)
- Assignee and label support

### ✅ Git-Based Timeline & Audit Trail

- Every ticket change creates a Git commit
- Complete history tracking via Git log
- Descriptive commit messages

### ✅ Modern UI

- Responsive design with Tailwind CSS
- Dashboard with ticket grid
- Repository selection
- User authentication flow

### ✅ API Layer

- RESTful API endpoints
- GitHub API integration
- Git operations abstraction

## 🧪 Testing

The project includes comprehensive tests for:

- Type definitions and validation
- Utility functions
- Core business logic

Run tests with:

```bash
npm test
npm run test:watch
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**:

   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Configure Environment Variables**:

   - Add all variables from `.env.local` in Vercel dashboard
   - Update `NEXT_PUBLIC_APP_URL` to your production URL

3. **Update GitHub OAuth App**:
   - Update Authorization callback URL to your production URL
   - Example: `https://your-app.vercel.app/api/auth/github`

### Docker

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

## 📋 Usage Guide

### Creating Your First Ticket

1. **Login**: Use GitHub OAuth to authenticate
2. **Select Repository**: Choose from your GitHub repositories
3. **Create Ticket**: Click "Create Ticket" and fill in details
4. **Automatic Commit**: The ticket is automatically committed to your repository

### Managing Tickets

- **View All Tickets**: Dashboard shows all tickets in a grid
- **Update Status**: Change ticket status through the UI
- **View History**: Complete audit trail via Git commits
- **Assign Users**: Assign tickets to team members

### Repository Structure

Tickets are stored as JSON files in your repository:

```
your-repo/
├── tickets/
│   ├── ticket-1234567890.json
│   ├── ticket-1234567891.json
│   └── ...
└── README.md
```

## 🔒 Security Features

- **OAuth Authentication**: Secure GitHub OAuth flow
- **Repository Permissions**: Access control based on GitHub permissions
- **Token Security**: HTTP-only cookies for token storage
- **Input Validation**: All inputs validated before Git operations

## 🛠️ Development

### Adding New Features

1. **API Endpoints**: Add new routes in `src/app/api/`
2. **Frontend Components**: Create React components in `src/components/`
3. **Git Operations**: Extend `src/lib/git/operations.ts`
4. **Types**: Update `src/types/index.ts`

### Code Style

- TypeScript for type safety
- Tailwind CSS for styling
- ESLint for code quality
- Jest for testing

## 🆘 Troubleshooting

### Common Issues

1. **OAuth Error**: Check GitHub OAuth app configuration
2. **Repository Access**: Ensure repository permissions are correct
3. **Git Operations**: Verify Git is installed and configured
4. **Environment Variables**: Double-check all required variables are set

### Getting Help

- Check the [README.md](README.md) for detailed documentation
- Review test files for usage examples
- Check GitHub Issues for known problems

## 🎯 Next Steps

### Phase 2 Features (Future)

- [ ] Kanban board view
- [ ] Sprint planning
- [ ] Time tracking
- [ ] Advanced search and filtering
- [ ] Mobile app
- [ ] Real-time collaboration
- [ ] GitHub Actions integration

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For questions or issues:

- Check the documentation
- Review test files for examples
- Open a GitHub issue
- Join discussions for help

---

**Built with ❤️ using Next.js, TypeScript, and GitHub API**
