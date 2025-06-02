"use client"

import { useContext, useEffect, useState } from "react"
import "./navbar.scss"
import { Link, useLocation } from "react-router-dom"
import { AuthContext } from "../../context/AuthContext"
import { useComparison } from "../../context/ComparisonContext"
import { useTheme } from "../../context/themeContext"
import { SocketContext } from "../../context/SocketContext"
import { motion, AnimatePresence } from "framer-motion"
import {
  Home,
  Search,
  PlusCircle,
  MessageSquare,
  User,
  Heart,
  Moon,
  Sun,
  ChevronDown,
  BarChart2,
  Layers,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react"

function Navbar() {
  const { currentUser, logout } = useContext(AuthContext)
  const { comparisonList, toggleComparisonView } = useComparison()
  const { theme, toggleTheme } = useTheme()
  const { isConnected } = useContext(SocketContext)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuOpen && !e.target.closest(".user-menu-container")) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [userMenuOpen])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => {
    return location.pathname === path
  }

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
  }

  return (
    <div className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="left">
          <Link to="/" className="logo">
            <motion.div
              className="logo-icon"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </motion.div>
            <span className="logo-text">DreamHome</span>
          </Link>

          <div className="desktop-nav">
            <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link to="/list" className={`nav-link ${isActive("/list") ? "active" : ""}`}>
              <Search size={18} />
              <span>Explore</span>
            </Link>
            {currentUser && (
              <>
                <Link to="/add" className={`nav-link ${isActive("/add") ? "active" : ""}`}>
                  <PlusCircle size={18} />
                  <span>Add Property</span>
                </Link>
                <Link to="/profile" className={`nav-link ${isActive("/profile") ? "active" : ""}`}>
                  <MessageSquare size={18} />
                  <span>Messages</span>
                  {isConnected && <span className="connection-dot online"></span>}
                  {!isConnected && <span className="connection-dot offline"></span>}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="right">
          {comparisonList.length > 0 && (
            <motion.button
              className="comparison-btn"
              onClick={toggleComparisonView}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Layers size={18} />
              <span>Compare</span>
              <span className="comparison-count">{comparisonList.length}</span>
            </motion.button>
          )}

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {currentUser ? (
            <>
              <button className="notification-btn">
                <Bell size={18} />
                <span className="notification-badge">3</span>
              </button>

              <div className="user-menu-container">
                <motion.button
                  className="user-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                >
                  <img src={currentUser.avatar || "/noavatar.jpg"} alt={currentUser.username} className="user-avatar" />
                  <span className="user-name">{currentUser.username}</span>
                  <ChevronDown size={16} className={`arrow ${userMenuOpen ? "open" : ""}`} />
                </motion.button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="user-dropdown"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="dropdown-header">
                        <img
                          src={currentUser.avatar || "/noavatar.jpg"}
                          alt={currentUser.username}
                          className="dropdown-avatar"
                        />
                        <div className="dropdown-user-info">
                          <span className="dropdown-username">{currentUser.username}</span>
                          <span className="dropdown-email">{currentUser.email}</span>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <Link to="/profile" className="dropdown-item">
                        <User size={16} />
                        <span>My Profile</span>
                      </Link>
                      <Link to="/profile/favorites" className="dropdown-item">
                        <Heart size={16} />
                        <span>Saved Properties</span>
                      </Link>
                      <Link to="/profile/analytics" className="dropdown-item">
                        <BarChart2 size={16} />
                        <span>Analytics</span>
                      </Link>
                      <Link to="/profile/settings" className="dropdown-item">
                        <Settings size={16} />
                        <span>Settings</span>
                      </Link>

                      <div className="dropdown-divider"></div>

                      <button className="dropdown-item logout" onClick={handleLogout}>
                        <LogOut size={16} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="auth-btn login">
                Sign In
              </Link>
              <Link to="/register" className="auth-btn register">
                Sign Up
              </Link>
            </div>
          )}

          <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mobile-nav">
              <Link to="/" className={`mobile-nav-link ${isActive("/") ? "active" : ""}`}>
                <Home size={20} />
                <span>Home</span>
              </Link>
              <Link to="/list" className={`mobile-nav-link ${isActive("/list") ? "active" : ""}`}>
                <Search size={20} />
                <span>Explore</span>
              </Link>
              {currentUser && (
                <>
                  <Link to="/add" className={`mobile-nav-link ${isActive("/add") ? "active" : ""}`}>
                    <PlusCircle size={20} />
                    <span>Add Property</span>
                  </Link>
                  <Link to="/profile" className={`mobile-nav-link ${isActive("/profile") ? "active" : ""}`}>
                    <MessageSquare size={20} />
                    <span>Messages</span>
                    {isConnected && <span className="connection-dot online"></span>}
                  </Link>
                </>
              )}
            </div>

            {currentUser ? (
              <div className="mobile-user-section">
                <div className="mobile-user-info">
                  <img
                    src={currentUser.avatar || "/noavatar.jpg"}
                    alt={currentUser.username}
                    className="mobile-user-avatar"
                  />
                  <div className="mobile-user-details">
                    <span className="mobile-username">{currentUser.username}</span>
                    <span className="mobile-email">{currentUser.email}</span>
                  </div>
                </div>

                <div className="mobile-user-actions">
                  <Link to="/profile" className="mobile-action-link">
                    <User size={18} />
                    <span>Profile</span>
                  </Link>
                  <Link to="/profile/favorites" className="mobile-action-link">
                    <Heart size={18} />
                    <span>Favorites</span>
                  </Link>
                  <Link to="/profile/settings" className="mobile-action-link">
                    <Settings size={18} />
                    <span>Settings</span>
                  </Link>
                  <button className="mobile-action-link logout" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mobile-auth-section">
                <Link to="/login" className="mobile-auth-btn login">
                  Sign In
                </Link>
                <Link to="/register" className="mobile-auth-btn register">
                  Sign Up
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)} />}
    </div>
  )
}

export default Navbar
