"use client";

import { useState } from "react";
import { Github, CheckCircle, AlertCircle, ExternalLink } from "lucide-react";

export default function SetupPage() {
  const [step, setStep] = useState(1);
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState("");

  const steps = [
    {
      title: "Create GitHub OAuth App",
      description: "Create a new OAuth App in your GitHub settings",
      content: (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">
              Step-by-step guide:
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>
                Go to{" "}
                <a
                  href="https://github.com/settings/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  GitHub Developer Settings
                </a>
              </li>
              <li>Click "New OAuth App"</li>
              <li>
                Fill in the application details:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>
                    <strong>Application name:</strong> PulseBoard
                  </li>
                  <li>
                    <strong>Homepage URL:</strong>{" "}
                    {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                  </li>
                  <li>
                    <strong>Authorization callback URL:</strong>{" "}
                    {process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
                    /api/auth/github
                  </li>
                </ul>
              </li>
              <li>Click "Register application"</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      title: "Configure Environment",
      description: "Add your OAuth credentials to the application",
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="font-semibold text-yellow-900">Important:</span>
            </div>
            <p className="text-yellow-800">
              Copy your Client ID and Client Secret from the GitHub OAuth App
              page and paste them below.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="clientId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                GitHub Client ID
              </label>
              <input
                type="text"
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your GitHub Client ID"
              />
            </div>

            <div>
              <label
                htmlFor="clientSecret"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                GitHub Client Secret
              </label>
              <input
                type="password"
                id="clientSecret"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your GitHub Client Secret"
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Test Configuration",
      description: "Verify your setup is working correctly",
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-semibold text-green-900">
                Ready to test!
              </span>
            </div>
            <p className="text-green-800">
              Your GitHub OAuth configuration is complete. Click the button
              below to test the authentication.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => {
                // Save configuration to localStorage or send to API
                localStorage.setItem("github_client_id", clientId);
                localStorage.setItem("github_client_secret", clientSecret);
                window.location.href = "/api/auth/login";
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Github className="h-4 w-4 mr-2" />
              Test GitHub Login
            </button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            PulseBoard Setup
          </h1>
          <p className="text-lg text-gray-600">
            Configure your GitHub OAuth integration in just a few steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index + 1 <= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 ${
                      index + 1 < step ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {steps[step - 1].title}
            </h2>
            <p className="text-gray-600">{steps[step - 1].description}</p>
          </div>

          {steps[step - 1].content}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={() => setStep(Math.min(steps.length, step + 1))}
              disabled={step === steps.length}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === steps.length ? "Complete" : "Next"}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Need Help?
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>
              • Check our{" "}
              <a href="/docs" className="text-blue-600 hover:underline">
                documentation
              </a>{" "}
              for detailed setup instructions
            </p>
            <p>
              • Join our{" "}
              <a href="/community" className="text-blue-600 hover:underline">
                community
              </a>{" "}
              for support
            </p>
            <p>
              • Contact support at{" "}
              <a
                href="mailto:support@githubjira.com"
                className="text-blue-600 hover:underline"
              >
                support@githubjira.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
