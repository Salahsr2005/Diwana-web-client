"use client"

import { useContext, useState } from "react"
import "./login.scss"
import { Link, useNavigate } from "react-router-dom"
import apiRequest from "../../lib/apiRequest"
import { AuthContext } from "../../context/AuthContext"

function Login() {
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const { updateUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await apiRequest.post("/auth/login", {
        username: formData.username,
        password: formData.password,
      })

      updateUser(res.data)
      navigate("/")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: "🛡️",
      title: "Secure & Safe",
      description: "Your data is protected with enterprise-grade security",
    },
    {
      icon: "🏠",
      title: "10K+ Properties",
      description: "Access to the largest property database",
    },
    {
      icon: "✅",
      title: "Verified Listings",
      description: "All properties are verified and authenticated",
    },
  ]

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Left Side - Form */}
        <div className="form-section">
          <div className="form-wrapper">
            <div className="form-header">
              <div className="logo">
                <span className="logo-icon">🏠</span>
                <span>Diwana</span>
              </div>
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue your property journey</p>
            </div>

            {error && (
              <div className="error-message">
                <div className="error-icon">⚠️</div>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">
                  <span className="icon">📧</span>
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="icon">🔒</span>
                  Password
                </label>
                <div className="password-input">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "👁️" : "🙈"}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember me
                </label>
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="spinner"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <span className="arrow">→</span>
                  </>
                )}
              </button>

              <div className="divider">
                <span>Dont have an account?</span>
              </div>

              <Link to="/register" className="register-link">
                Create new account
              </Link>
            </form>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="features-section">
          <div className="features-background">
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>

          <div className="features-content">
            <h2>Join thousands of happy customers</h2>
            <p>Experience the best way to find and manage your properties with our modern platform.</p>

            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">
                    <span>{feature.icon}</span>
                  </div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="testimonial">
              <div className="testimonial-content">
                <p>
                  This platform made finding my dream home so easy. The interface is intuitive and the support team is
                  amazing!
                </p>
                <div className="testimonial-author">
                  <img src="/placeholder.svg?height=40&width=40" alt="Customer" />
                  <div>
                    <span className="name">Sarah Johnson</span>
                    <span className="role">Happy Customer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
