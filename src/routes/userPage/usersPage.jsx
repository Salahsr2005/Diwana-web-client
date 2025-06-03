"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./usersPage.scss"
import apiRequest from "../../lib/apiRequest"
import { toast } from "react-hot-toast"
import {
  Search,
  Filter,
  MapPin,
  Star,
  MessageCircle,
  Mail,
  Calendar,
  Home,
  Users,
  Award,
  Verified,
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
} from "lucide-react"

function UsersPage() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")
  const [filterType, setFilterType] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await apiRequest.get("/users")
        setUsers(response.data)
        setFilteredUsers(response.data)
      } catch (err) {
        console.error("Error fetching users:", err)
        setError("Failed to load users")
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  // Filter and search users
  useEffect(() => {
    let filtered = [...users]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (user) =>
          user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((user) => {
        switch (filterType) {
          case "agents":
            return user.userType === "agent" || user.isAgent
          case "owners":
            return user.userType === "owner" || user.posts?.length > 0
          case "verified":
            return user.isVerified
          case "recent":
            return new Date(user.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          default:
            return true
        }
      })
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue

      switch (sortBy) {
        case "name":
          aValue = a.username?.toLowerCase() || ""
          bValue = b.username?.toLowerCase() || ""
          break
        case "rating":
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case "properties":
          aValue = a.posts?.length || 0
          bValue = b.posts?.length || 0
          break
        case "joined":
          aValue = new Date(a.createdAt)
          bValue = new Date(b.createdAt)
          break
        default:
          aValue = a.username?.toLowerCase() || ""
          bValue = b.username?.toLowerCase() || ""
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredUsers(filtered)
  }, [users, searchQuery, filterType, sortBy, sortOrder])

  const handleContactUser = (user) => {
    // Navigate to chat or contact form
    navigate(`/profile/${user.id}`)
  }

  const handleViewProfile = (user) => {
    navigate(`/profile/${user.id}`)
  }

  const formatJoinDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    })
  }

  const getUserTypeLabel = (user) => {
    if (user.userType === "agent" || user.isAgent) return "Agent"
    if (user.posts?.length > 0) return "Property Owner"
    return "User"
  }

  const getUserTypeIcon = (user) => {
    if (user.userType === "agent" || user.isAgent) return <Award size={16} />
    if (user.posts?.length > 0) return <Home size={16} />
    return <Users size={16} />
  }

  if (loading) {
    return (
      <div className="users-page">
        <div className="users-loading">
          <div className="loading-spinner">🔄</div>
          <h3>Loading users...</h3>
          <p>Please wait while we fetch the user directory</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="users-page">
        <div className="users-error">
          <span className="error-icon">⚠️</span>
          <h3>Error Loading Users</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <div className="header-content">
          <div className="title-section">
            <h1>👥 User Directory</h1>
            <p>Connect with property owners, agents, and other users in our community</p>
          </div>
          <div className="stats-section">
            <div className="stat-item">
              <span className="stat-number">{users.length}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{users.filter((u) => u.isAgent).length}</span>
              <span className="stat-label">Agents</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{users.filter((u) => u.posts?.length > 0).length}</span>
              <span className="stat-label">Property Owners</span>
            </div>
          </div>
        </div>
      </div>

      <div className="users-controls">
        <div className="search-section">
          <div className="search-input-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search users by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="clear-search-btn">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="controls-row">
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
            >
              <Grid size={18} />
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>

          <div className="sort-controls">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="name">Sort by Name</option>
              <option value="rating">Sort by Rating</option>
              <option value="properties">Sort by Properties</option>
              <option value="joined">Sort by Join Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="sort-order-btn"
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              {sortOrder === "asc" ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </button>
          </div>

          <button className={`filter-btn ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
            <Filter size={18} />
            <span>Filters</span>
            {filterType !== "all" && <span className="filter-indicator">1</span>}
          </button>
        </div>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>User Type:</label>
              <div className="filter-options">
                <button
                  className={`filter-option ${filterType === "all" ? "active" : ""}`}
                  onClick={() => setFilterType("all")}
                >
                  All Users
                </button>
                <button
                  className={`filter-option ${filterType === "agents" ? "active" : ""}`}
                  onClick={() => setFilterType("agents")}
                >
                  Agents
                </button>
                <button
                  className={`filter-option ${filterType === "owners" ? "active" : ""}`}
                  onClick={() => setFilterType("owners")}
                >
                  Property Owners
                </button>
                <button
                  className={`filter-option ${filterType === "verified" ? "active" : ""}`}
                  onClick={() => setFilterType("verified")}
                >
                  Verified Users
                </button>
                <button
                  className={`filter-option ${filterType === "recent" ? "active" : ""}`}
                  onClick={() => setFilterType("recent")}
                >
                  Recently Joined
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="users-results">
        <div className="results-header">
          <span className="results-count">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <span className="no-users-icon">👤</span>
            <h3>No users found</h3>
            <p>Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchQuery("")
                setFilterType("all")
              }}
              className="clear-filters-btn"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`users-grid ${viewMode}`}>
            {filteredUsers.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-avatar-section">
                  <img
                    src={user.avatar || "/noavatar.jpg"}
                    alt={user.username}
                    className="user-avatar"
                    onError={(e) => {
                      e.target.src = "/noavatar.jpg"
                    }}
                  />
                  {user.isVerified && (
                    <div className="verified-badge" title="Verified User">
                      <Verified size={16} />
                    </div>
                  )}
                  <div className="user-type-badge">
                    {getUserTypeIcon(user)}
                    <span>{getUserTypeLabel(user)}</span>
                  </div>
                </div>

                <div className="user-info">
                  <div className="user-header">
                    <h3 className="user-name">{user.username}</h3>
                    {user.rating && (
                      <div className="user-rating">
                        <Star size={14} fill="currentColor" />
                        <span>{user.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="user-details">
                    {user.email && (
                      <div className="detail-item">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                    )}
                    {user.location && (
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{user.location}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <Calendar size={14} />
                      <span>Joined {formatJoinDate(user.createdAt)}</span>
                    </div>
                    {user.posts && user.posts.length > 0 && (
                      <div className="detail-item">
                        <Home size={14} />
                        <span>{user.posts.length} properties</span>
                      </div>
                    )}
                  </div>

                  {user.bio && (
                    <div className="user-bio">
                      <p>{user.bio}</p>
                    </div>
                  )}
                </div>

                <div className="user-actions">
                  <button onClick={() => handleViewProfile(user)} className="action-btn primary">
                    <Users size={16} />
                    <span>View Profile</span>
                  </button>
                  <button onClick={() => handleContactUser(user)} className="action-btn secondary">
                    <MessageCircle size={16} />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default UsersPage
