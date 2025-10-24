"use client";

import { useEffect, useState } from "react";
import { Github, GitBranch, Users, BarChart3 } from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleGitHubLogin = () => {
    window.location.href = "/api/auth/login";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GitBranch className="h-8 w-8 text-gray-900" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                PulseBoard
              </span>
            </div>
            <button
              onClick={handleGitHubLogin}
              className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center"
            >
              <Github className="h-4 w-4 mr-2" />
              Login with GitHub
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            PulseBoard
            <span className="block text-blue-600">Project Management</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A modern project management tool that stores all your tickets and
            updates directly in GitHub repositories, using Git commits as a
            timeline for complete audit trails.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={handleGitHubLogin}
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Github className="h-5 w-5 mr-2" />
              Login with GitHub
            </button>
            <a
              href="/setup"
              className="border border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors inline-block text-center"
            >
              Setup Guide
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <GitBranch className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Git-Based Storage
              </h3>
              <p className="text-gray-600">
                All tickets and updates are stored as files in your GitHub
                repository, with every change tracked in Git history.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <Users className="h-12 w-12 text-green-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Seamlessly integrate with GitHub&apos;s existing features like
                Issues, Pull Requests, and Actions for enhanced workflow.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg">
              <BarChart3 className="h-12 w-12 text-purple-600 mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Complete Audit Trail
              </h3>
              <p className="text-gray-600">
                Every ticket modification creates a Git commit with descriptive
                messages, providing complete transparency and accountability.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 PulseBoard. Built with Next.js and GitHub API.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
