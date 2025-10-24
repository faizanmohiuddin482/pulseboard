# Deployment Options for GitHub Jira

## 🚀 **Option 1: One-Click Deploy (Recommended for End Users)**

### Vercel Deployment with Pre-configured GitHub App

1. **Fork this repository**
2. **Deploy to Vercel**:

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel Dashboard**:
   - `GITHUB_CLIENT_ID`: Your GitHub OAuth App Client ID
   - `GITHUB_CLIENT_SECRET`: Your GitHub OAuth App Client Secret
   - `NEXT_PUBLIC_APP_URL`: Your deployed URL

### Railway Deployment

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template-id)

## 🐳 **Option 2: Docker Deployment**

### Quick Start with Docker Compose

```bash
# Clone the repository
git clone https://github.com/your-username/github-jira.git
cd github-jira

# Create environment file
cp env.example .env

# Edit .env with your GitHub OAuth credentials
nano .env

# Start with Docker Compose
docker-compose up -d
```

### Manual Docker Build

```bash
# Build the image
docker build -t github-jira .

# Run the container
docker run -p 3000:3000 \
  -e GITHUB_CLIENT_ID=your_client_id \
  -e GITHUB_CLIENT_SECRET=your_client_secret \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  github-jira
```

## ☁️ **Option 3: Cloud Provider Deployments**

### AWS Amplify

1. Connect your GitHub repository to AWS Amplify
2. Set environment variables in Amplify console
3. Deploy automatically on push

### Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/PROJECT-ID/github-jira

# Deploy to Cloud Run
gcloud run deploy github-jira \
  --image gcr.io/PROJECT-ID/github-jira \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Container Instances

```bash
# Create resource group
az group create --name github-jira-rg --location eastus

# Deploy container
az container create \
  --resource-group github-jira-rg \
  --name github-jira \
  --image your-registry/github-jira \
  --dns-name-label github-jira \
  --ports 3000 \
  --environment-variables \
    GITHUB_CLIENT_ID=your_client_id \
    GITHUB_CLIENT_SECRET=your_client_secret
```

## 🔧 **Option 4: Self-Hosted Solutions**

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: github-jira
spec:
  replicas: 3
  selector:
    matchLabels:
      app: github-jira
  template:
    metadata:
      labels:
        app: github-jira
    spec:
      containers:
        - name: github-jira
          image: your-registry/github-jira:latest
          ports:
            - containerPort: 3000
          env:
            - name: GITHUB_CLIENT_ID
              valueFrom:
                secretKeyRef:
                  name: github-oauth
                  key: client-id
            - name: GITHUB_CLIENT_SECRET
              valueFrom:
                secretKeyRef:
                  name: github-oauth
                  key: client-secret
```

### Helm Chart

```bash
# Install Helm chart
helm install github-jira ./helm-chart \
  --set github.clientId=your_client_id \
  --set github.clientSecret=your_client_secret \
  --set ingress.host=github-jira.yourdomain.com
```

## 🏢 **Option 5: Enterprise Solutions**

### For Organizations

1. **GitHub App Installation**: Create a GitHub App that organizations can install
2. **Multi-tenant Architecture**: Support multiple organizations
3. **SSO Integration**: Integrate with corporate SSO systems
4. **On-premises Deployment**: Deploy behind corporate firewalls

### GitHub App vs OAuth App

| Feature          | OAuth App       | GitHub App            |
| ---------------- | --------------- | --------------------- |
| Setup Complexity | Manual per user | One-time installation |
| Permissions      | User-level      | Organization-level    |
| Maintenance      | Per user        | Centralized           |
| Security         | User tokens     | App tokens            |

## 📋 **Environment Variables Reference**

### Required Variables

```env
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NODE_ENV=production
```

### Optional Variables

```env
# GitHub App Configuration (for enterprise)
GITHUB_APP_ID=your_app_id
GITHUB_APP_PRIVATE_KEY=your_private_key
GITHUB_APP_INSTALLATION_ID=your_installation_id

# Database Configuration
DATABASE_URL=postgresql://user:pass@host:port/db

# Redis Configuration (for caching)
REDIS_URL=redis://localhost:6379

# Monitoring
SENTRY_DSN=your_sentry_dsn
```

## 🔒 **Security Considerations**

### Production Security

1. **HTTPS Only**: Always use HTTPS in production
2. **Environment Variables**: Never commit secrets to code
3. **Token Rotation**: Regularly rotate GitHub tokens
4. **Access Control**: Implement proper user permissions
5. **Audit Logging**: Log all GitHub API calls

### GitHub OAuth Best Practices

1. **Scoped Permissions**: Request only necessary permissions
2. **Token Expiration**: Implement token refresh logic
3. **Rate Limiting**: Respect GitHub API rate limits
4. **Error Handling**: Graceful handling of API errors

## 🚀 **Quick Start for End Users**

### For Individual Users

1. **Fork and Deploy**: Fork this repository and deploy to Vercel
2. **Create OAuth App**: Create a GitHub OAuth App in your settings
3. **Configure Environment**: Add your OAuth credentials to Vercel
4. **Start Using**: Begin managing your projects!

### For Organizations

1. **Contact Support**: Reach out for enterprise setup
2. **GitHub App Installation**: Install our GitHub App
3. **Organization Setup**: Configure organization-wide settings
4. **Team Onboarding**: Invite team members to use the platform

## 📞 **Support and Help**

- **Documentation**: [docs.githubjira.com](https://docs.githubjira.com)
- **Community**: [GitHub Discussions](https://github.com/your-org/github-jira/discussions)
- **Support**: [support@githubjira.com](mailto:support@githubjira.com)
- **Enterprise**: [enterprise@githubjira.com](mailto:enterprise@githubjira.com)
