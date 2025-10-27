"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  LogOut,
  GitBranch,
  Settings,
  Home,
  BarChart3,
  Users,
  Bell,
  Search,
  Filter,
  Image as ImageIcon,
  MoreHorizontal,
  Edit,
  Eye,
  Calendar,
  Tag,
  Clock,
  User,
  MessageSquare,
  Activity,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  Grid3X3,
  List,
  Kanban,
  SortAsc,
  SortDesc,
} from "lucide-react";
import Image from "next/image";
import { User as UserType, Repository, Ticket } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserType | null>(null);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // New state for enhanced UX
  const [viewMode, setViewMode] = useState<"grid" | "list" | "kanban">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

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
      setTickets([]);
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
        await fetchRepositories();
        setSelectedRepo(data.data.name);
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
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in_review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "done":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "high":
        return "text-orange-600 bg-orange-50";
      case "critical":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "backlog":
        return <Clock className="h-3 w-3" />;
      case "in_progress":
        return <Play className="h-3 w-3" />;
      case "in_review":
        return <RotateCcw className="h-3 w-3" />;
      case "done":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "low":
        return <AlertCircle className="h-3 w-3" />;
      case "medium":
        return <AlertCircle className="h-3 w-3" />;
      case "high":
        return <AlertCircle className="h-3 w-3" />;
      case "critical":
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  // Filter and sort tickets
  const filteredTickets = tickets
    .filter((ticket) => {
      const matchesSearch =
        ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || ticket.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "priority":
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          comparison =
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
          break;
        case "created":
        default:
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // Get ticket statistics
  const ticketStats = {
    total: tickets.length,
    backlog: tickets.filter((t) => t.status === "backlog").length,
    inProgress: tickets.filter((t) => t.status === "in_progress").length,
    inReview: tickets.filter((t) => t.status === "in_review").length,
    done: tickets.filter((t) => t.status === "done").length,
    cancelled: tickets.filter((t) => t.status === "cancelled").length,
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-bold text-gray-900">
              PulseBoard
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg"
            >
              <Home className="h-4 w-4 mr-3" />
              Dashboard
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <BarChart3 className="h-4 w-4 mr-3" />
              Analytics
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Users className="h-4 w-4 mr-3" />
              Team
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4 mr-3" />
              Settings
            </a>
          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <Image
                src={user?.avatar_url || ""}
                alt={user?.name || ""}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.login}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                >
                  <Filter className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {/* Repository Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <button
                onClick={() => setShowCreateRepo(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>New Repository</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {repositories.map((repo) => (
                <div
                  key={repo.id}
                  className={`card p-4 cursor-pointer transition-all duration-200 ${
                    selectedRepo === repo.name
                      ? "ring-2 ring-blue-500 bg-blue-50"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedRepo(repo.name)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                      <GitBranch className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {repo.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate">
                        {repo.full_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets Section */}
          {selectedRepo && (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {ticketStats.total}
                  </div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {ticketStats.backlog}
                  </div>
                  <div className="text-sm text-gray-500">Backlog</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {ticketStats.inProgress}
                  </div>
                  <div className="text-sm text-gray-500">In Progress</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {ticketStats.inReview}
                  </div>
                  <div className="text-sm text-gray-500">In Review</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {ticketStats.done}
                  </div>
                  <div className="text-sm text-gray-500">Done</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {ticketStats.cancelled}
                  </div>
                  <div className="text-sm text-gray-500">Cancelled</div>
                </div>
              </div>

              {/* Filters and Controls */}
              {showFilters && (
                <div className="card p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input"
                      >
                        <option value="all">All Status</option>
                        <option value="backlog">Backlog</option>
                        <option value="in_progress">In Progress</option>
                        <option value="in_review">In Review</option>
                        <option value="done">Done</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="input"
                      >
                        <option value="all">All Priority</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="input"
                      >
                        <option value="created">Created Date</option>
                        <option value="title">Title</option>
                        <option value="status">Status</option>
                        <option value="priority">Priority</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order
                      </label>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSortOrder("desc")}
                          className={`p-2 rounded-lg ${
                            sortOrder === "desc"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <SortDesc className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setSortOrder("asc")}
                          className={`p-2 rounded-lg ${
                            sortOrder === "asc"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          <SortAsc className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* View Controls */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Tickets</h2>
                  <p className="text-sm text-gray-500">
                    {filteredTickets.length} of {tickets.length} tickets
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg ${
                        viewMode === "grid"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg ${
                        viewMode === "list"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("kanban")}
                      className={`p-2 rounded-lg ${
                        viewMode === "kanban"
                          ? "bg-blue-100 text-blue-600"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Kanban className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCreateTicket(true)}
                    disabled={ticketsLoading}
                    className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4" />
                    <span>New Ticket</span>
                  </button>
                </div>
              </div>

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
              ) : filteredTickets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GitBranch className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {tickets.length === 0
                      ? "No tickets yet"
                      : "No tickets match your filters"}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {tickets.length === 0
                      ? "Get started by creating your first ticket."
                      : "Try adjusting your search or filter criteria."}
                  </p>
                  {tickets.length === 0 && (
                    <button
                      onClick={() => setShowCreateTicket(true)}
                      className="btn-primary"
                    >
                      Create Your First Ticket
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {viewMode === "grid" && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {filteredTickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="card p-6 hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => handleTicketClick(ticket)}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                              {ticket.title}
                            </h3>
                            <div className="flex items-center space-x-2 ml-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 ${getStatusColor(
                                  ticket.status
                                )}`}
                              >
                                {getStatusIcon(ticket.status)}
                                <span>{ticket.status.replace("_", " ")}</span>
                              </span>
                              <button
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle more actions
                                }}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {ticket.description}
                          </p>

                          <div className="flex items-center justify-between mb-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              {getPriorityIcon(ticket.priority)}
                              <span>{ticket.priority}</span>
                            </span>
                            <span className="text-xs text-gray-500">
                              #{ticket.id}
                            </span>
                          </div>

                          {ticket.assignee && (
                            <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium text-gray-600">
                                    {ticket.assignee.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-600">
                                  Assigned to {ticket.assignee}
                                </span>
                              </div>
                            </div>
                          )}

                          {ticket.images && ticket.images.length > 0 && (
                            <div className="mb-4 pb-4 border-t border-gray-200 pt-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <ImageIcon className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">
                                  {ticket.images.length} image
                                  {ticket.images.length > 1 ? "s" : ""}
                                </span>
                              </div>
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
                                      onClick={(e) => e.stopPropagation()}
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

                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                              <button
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTicketClick(ticket);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Handle edit
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(ticket.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {viewMode === "list" && (
                    <div className="card">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ticket
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Assignee
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredTickets.map((ticket) => (
                              <tr
                                key={ticket.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleTicketClick(ticket)}
                              >
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {ticket.title}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      #{ticket.id}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center space-x-1 w-fit ${getStatusColor(
                                      ticket.status
                                    )}`}
                                  >
                                    {getStatusIcon(ticket.status)}
                                    <span>
                                      {ticket.status.replace("_", " ")}
                                    </span>
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getPriorityColor(
                                      ticket.priority
                                    )}`}
                                  >
                                    {getPriorityIcon(ticket.priority)}
                                    <span>{ticket.priority}</span>
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  {ticket.assignee ? (
                                    <div className="flex items-center space-x-2">
                                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-medium text-gray-600">
                                          {ticket.assignee
                                            .charAt(0)
                                            .toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-sm text-gray-900">
                                        {ticket.assignee}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      Unassigned
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                  {new Date(
                                    ticket.created_at
                                  ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center space-x-2">
                                    <button
                                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTicketClick(ticket);
                                      }}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Handle edit
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {viewMode === "kanban" && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      {[
                        "backlog",
                        "in_progress",
                        "in_review",
                        "done",
                        "cancelled",
                      ].map((status) => (
                        <div key={status} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-medium text-gray-900 capitalize">
                              {status.replace("_", " ")}
                            </h3>
                            <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
                              {
                                filteredTickets.filter(
                                  (t) => t.status === status
                                ).length
                              }
                            </span>
                          </div>
                          <div className="space-y-3">
                            {filteredTickets
                              .filter((ticket) => ticket.status === status)
                              .map((ticket) => (
                                <div
                                  key={ticket.id}
                                  className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => handleTicketClick(ticket)}
                                >
                                  <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                    {ticket.title}
                                  </h4>
                                  <div className="flex items-center justify-between">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                        ticket.priority
                                      )}`}
                                    >
                                      {ticket.priority}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      #{ticket.id}
                                    </span>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {!selectedRepo && (
            <>
              {repositories.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GitBranch className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Repositories Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Create your first repository to start managing tickets.
                  </p>
                  <button
                    onClick={() => setShowCreateRepo(true)}
                    className="btn-primary"
                  >
                    Create Your First Repository
                  </button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <GitBranch className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Repository
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Choose a repository from the list above to start managing
                    your tickets.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Ticket Detail Modal */}
      {showTicketModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedTicket.title}
                </h2>
                <button
                  onClick={() => setShowTicketModal(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      selectedTicket.priority
                    )}`}
                  >
                    {selectedTicket.priority}
                  </span>
                  <span className="text-sm text-gray-500">
                    #{selectedTicket.id}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-900">{selectedTicket.description}</p>
                </div>

                {selectedTicket.assignee && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Assignee
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {selectedTicket.assignee.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="text-gray-900">
                        {selectedTicket.assignee}
                      </span>
                    </div>
                  </div>
                )}

                {selectedTicket.images && selectedTicket.images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Images
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedTicket.images.map((imageUrl, index) => (
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
                            width={200}
                            height={150}
                            className="w-full h-32 object-cover rounded border hover:opacity-80 transition-opacity"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Created{" "}
                    {new Date(selectedTicket.created_at).toLocaleDateString()}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-secondary">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Repository Modal */}
      {showCreateRepo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 animate-scale-in">
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
                  className="input"
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
                  className="input"
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
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRepository}
                disabled={!newRepoName.trim()}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Repository
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showCreateTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 animate-scale-in max-h-[90vh] overflow-y-auto">
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
                  className="input"
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
                  className="input"
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
                    className="input"
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
                    className="input"
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
                  className="input"
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
                  className="input"
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
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTicket}
                disabled={!newTicket.title.trim() || creatingTicket}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {creatingTicket ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Ticket</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
