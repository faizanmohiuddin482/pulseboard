"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, LogOut, GitBranch } from "lucide-react";
import Image from "next/image";
import { User, Repository, Ticket } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [showCreateRepo, setShowCreateRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState("");
  const [newRepoDescription, setNewRepoDescription] = useState("");
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "backlog",
    assignee: "",
  });
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          window.location.href = "/";
          return;
        }
        const data = await response.json();
        setUser(data.data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Read repository from URL on component mount
  useEffect(() => {
    const repoFromUrl = searchParams.get("repo");
    if (repoFromUrl) {
      setSelectedRepo(repoFromUrl);
    }
  }, [searchParams]);

  // Update URL when repository changes
  useEffect(() => {
    if (selectedRepo) {
      const url = new URL(window.location.href);
      url.searchParams.set("repo", selectedRepo);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [selectedRepo, router]);

  // Clear tickets when repository changes
  useEffect(() => {
    if (selectedRepo) {
      setTickets([]); // Clear previous tickets immediately
    }
  }, [selectedRepo]);

  const fetchRepositories = async () => {
    try {
      const response = await fetch("/api/repositories");
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch repositories:", error);
    }
  };

  const fetchTickets = useCallback(async () => {
    if (!selectedRepo) return;

    setTicketsLoading(true);
    try {
      const response = await fetch(`/api/tickets?repo=${selectedRepo}`);
      if (response.ok) {
        const data = await response.json();
        setTickets(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setTicketsLoading(false);
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (user) {
      fetchRepositories();
    }
  }, [user]);

  useEffect(() => {
    if (selectedRepo) {
      fetchTickets();
    }
  }, [selectedRepo, fetchTickets]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleCreateRepository = async () => {
    if (!newRepoName.trim()) return;

    try {
      const response = await fetch("/api/repositories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newRepoName,
          description: newRepoDescription,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh repositories list
        await fetchRepositories();
        // Select the new repository (this will also update the URL)
        setSelectedRepo(data.data.name);
        // Close modal
        setShowCreateRepo(false);
        setNewRepoName("");
        setNewRepoDescription("");
      } else {
        console.error("Failed to create repository");
      }
    } catch (error) {
      console.error("Error creating repository:", error);
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );
      setSelectedImages((prev) => [...prev, ...imageFiles]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (ticketId: string): Promise<string[]> => {
    const imageUrls: string[] = [];

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i];
      const fileName = `${ticketId}-image-${i + 1}.${file.name
        .split(".")
        .pop()}`;
      const imagePath = `tickets/images/${fileName}`;

      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Remove data:image/...;base64, prefix
      const base64Data = base64.split(",")[1];

      try {
        const response = await fetch("/api/upload-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repo: selectedRepo,
            path: imagePath,
            content: base64Data,
            message: `Add image for ticket ${ticketId}`,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          imageUrls.push(data.data.html_url);
        }
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
      }
    }

    return imageUrls;
  };

  const handleCreateTicket = async () => {
    if (!newTicket.title.trim() || !selectedRepo) return;

    setCreatingTicket(true);
    try {
      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo: selectedRepo,
          ticket: newTicket,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const ticketId = data.data.id;

        // Upload images if any
        if (selectedImages.length > 0) {
          const imageUrls = await uploadImages(ticketId);
          // Update ticket with image URLs
          const updatedTicket = {
            ...newTicket,
            id: ticketId,
            images: imageUrls,
          };

          // Update the ticket file with image URLs
          await fetch("/api/tickets", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              repo: selectedRepo,
              ticketId: ticketId,
              ticket: updatedTicket,
            }),
          });
        }

        // Refresh tickets list
        await fetchTickets();
        // Close modal and reset form
        setShowCreateTicket(false);
        setNewTicket({
          title: "",
          description: "",
          priority: "medium",
          status: "backlog",
          assignee: "",
        });
        setSelectedImages([]);
      } else {
        console.error("Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
    } finally {
      setCreatingTicket(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "backlog":
        return "bg-gray-100 text-gray-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "in_review":
        return "bg-yellow-100 text-yellow-800";
      case "done":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <GitBranch className="h-8 w-8 text-gray-900" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                PulseBoard
              </span>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2">
                  <Image
                    src={user.avatar_url}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Repository Selection */}
        <div className="mb-8">
          <label
            htmlFor="repository"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Select Repository
          </label>
          <select
            id="repository"
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="block w-full max-w-md px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Choose a repository...</option>
            {repositories.map((repo) => (
              <option key={repo.id} value={repo.name}>
                {repo.name}
              </option>
            ))}
          </select>
        </div>

        {selectedRepo && (
          <>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
              <button
                onClick={() => setShowCreateTicket(true)}
                disabled={ticketsLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </button>
            </div>

            {/* Tickets Grid */}
            <div className="grid gap-4">
              {ticketsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Loading tickets...
                  </h3>
                  <p className="text-gray-500">
                    Fetching tickets from the repository
                  </p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-12">
                  <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tickets yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Get started by creating your first ticket.
                  </p>
                  <button
                    onClick={() => setShowCreateTicket(true)}
                    disabled={ticketsLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Ticket
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {ticket.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            ticket.status
                          )}`}
                        >
                          {ticket.status.replace("_", " ")}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {ticket.description}
                      </p>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span
                          className={`font-medium ${getPriorityColor(
                            ticket.priority
                          )}`}
                        >
                          {ticket.priority}
                        </span>
                        <span>#{ticket.id}</span>
                      </div>

                      {ticket.assignee && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm text-gray-500">
                            Assigned to:{" "}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {ticket.assignee}
                          </span>
                        </div>
                      )}

                      {ticket.images && ticket.images.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="text-sm text-gray-500 mb-2 block">
                            Images ({ticket.images.length}):
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {ticket.images
                              .slice(0, 4)
                              .map((imageUrl, index) => (
                                <a
                                  key={index}
                                  href={imageUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >
                                  <Image
                                    src={imageUrl}
                                    alt={`Ticket image ${index + 1}`}
                                    width={100}
                                    height={80}
                                    className="w-full h-20 object-cover rounded border hover:opacity-80 transition-opacity"
                                  />
                                </a>
                              ))}
                            {ticket.images.length > 4 && (
                              <div className="flex items-center justify-center bg-gray-100 rounded border text-xs text-gray-500">
                                +{ticket.images.length - 4} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!selectedRepo && (
          <div className="text-center py-12">
            <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select a Repository
            </h3>
            <p className="text-gray-500 mb-6">
              Choose a repository to start managing your tickets, or create a
              new one.
            </p>
            <button
              onClick={() => setShowCreateRepo(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Repository
            </button>
          </div>
        )}

        {/* Create Repository Modal */}
        {showCreateRepo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Repository
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="my-project-management"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={newRepoDescription}
                    onChange={(e) => setNewRepoDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Project management repository"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateRepo(false);
                    setNewRepoName("");
                    setNewRepoDescription("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRepository}
                  disabled={!newRepoName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Repository
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Ticket Modal */}
        {showCreateTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Create New Ticket
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter ticket title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Describe the ticket"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTicket.priority}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, priority: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={newTicket.status}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="backlog">Backlog</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assignee (optional)
                  </label>
                  <input
                    type="text"
                    value={newTicket.assignee}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, assignee: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="GitHub username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images (optional)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />

                  {selectedImages.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-600">Selected images:</p>
                      {selectedImages.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <span className="text-sm text-gray-700">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateTicket(false);
                    setNewTicket({
                      title: "",
                      description: "",
                      priority: "medium",
                      status: "backlog",
                      assignee: "",
                    });
                    setSelectedImages([]);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTicket}
                  disabled={!newTicket.title.trim() || creatingTicket}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {creatingTicket ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Ticket"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
