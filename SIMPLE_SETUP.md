# 🚀 Simple Setup Guide

## **Quick Start**

### **1. Clone and Install**

```bash
git clone <repository-url>
cd github-jira
npm install
```

### **2. Create GitHub OAuth App**

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: GitHub Jira
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github`
4. Copy the **Client ID** and **Client Secret**

### **3. Configure Environment**

```bash
cp env.example .env.local
```

Edit `.env.local`:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **4. Start the Application**

```bash
npm run dev
```

### **5. Login with GitHub**

1. Visit `http://localhost:3000`
2. Click "Login with GitHub"
3. Authorize the application
4. Start managing your tickets!

## **That's it!** 🎉

The application now works with your GitHub repositories and creates real Git commits for every ticket change.
