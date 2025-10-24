"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle, Github, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "no_code":
        return "No authorization code received from GitHub.";
      case "authentication_failed":
        return "GitHub authentication failed. Please try again.";
      case "access_denied":
        return "Access was denied. Please authorize the application to continue.";
      default:
        return "An authentication error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            Authentication Error
          </h1>

          <p className="text-gray-600 mb-6">{getErrorMessage(error)}</p>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>

            <Link
              href="/api/auth/simple-login?action=demo"
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              <Github className="h-4 w-4 mr-2" />
              Try Demo Instead
            </Link>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              Having trouble? Try the{" "}
              <Link href="/setup" className="text-blue-600 hover:underline">
                setup guide
              </Link>{" "}
              or use the demo mode to test the application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
