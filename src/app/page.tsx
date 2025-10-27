"use client";

import { useEffect, useState } from "react";
import {
  Github,
  GitBranch,
  Users,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GitBranch className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                PulseBoard
              </span>
            </div>
            <button
              onClick={handleGitHubLogin}
              className="btn-primary flex items-center space-x-2 px-6 py-3 text-lg font-semibold"
            >
              <Github className="h-5 w-5" />
              <span>Get Started</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/3 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            {/* Main Headline */}
            <div className="animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                Project Management
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Reimagined
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
                The modern project management platform that stores everything in
                GitHub. Track progress, collaborate seamlessly, and maintain
                complete transparency with Git-based audit trails.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-slide-up">
              <button
                onClick={handleGitHubLogin}
                className="btn-primary flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <Github className="h-6 w-6" />
                <span>Start with GitHub</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="/setup"
                className="btn-secondary flex items-center justify-center space-x-3 px-8 py-4 text-lg font-semibold"
              >
                <span>Setup Guide</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <div className="card p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <GitBranch className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Git-Powered Storage
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every ticket and update is stored directly in your GitHub
                  repository with complete version control and audit trails.
                </p>
              </div>

              <div className="card p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Team Collaboration
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Seamlessly integrate with GitHub&apos;s ecosystem including
                  Issues, Pull Requests, and Actions for enhanced workflows.
                </p>
              </div>

              <div className="card p-8 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Complete Transparency
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Every change creates a Git commit with descriptive messages,
                  providing complete accountability and traceability.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Choose PulseBoard?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built for modern teams who value transparency, collaboration,
                and seamless GitHub integration.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Lightning Fast
                </h3>
                <p className="text-gray-600 text-sm">
                  Optimized for speed and performance
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Secure by Design
                </h3>
                <p className="text-gray-600 text-sm">
                  GitHub&apos;s security infrastructure
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Always Available
                </h3>
                <p className="text-gray-600 text-sm">
                  Access your data anywhere, anytime
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Proven Workflow
                </h3>
                <p className="text-gray-600 text-sm">
                  Git-based version control
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Project Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join teams who have already made the switch to transparent,
              Git-powered project management.
            </p>
            <button
              onClick={handleGitHubLogin}
              className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center space-x-3 mx-auto"
            >
              <Github className="h-6 w-6" />
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PulseBoard</span>
            </div>
            <p className="text-gray-400 mb-4">
              Modern project management powered by GitHub
            </p>
            <p className="text-gray-500 text-sm">
              &copy; 2024 PulseBoard. Built with Next.js and GitHub API.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
