"use client"

import "./register.scss"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import apiRequest from "../../lib/apiRequest"
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Zap,
  Heart,
} from "lucide-react"

function Register() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [validationErrors, setValidationErrors] = useState({})

  const navigate = useNavigate()

  const validateForm = () => {
    const errors = {}

    if (!formData.username || formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters"
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const res = await apiRequest.post("/auth/register", formData)

      setSuccess("Account created successfully! Redirecting to login...")

      // Redirect after showing success message
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    { icon: Shield, title: "Secure & Safe", desc: "Your data is protected with enterprise-grade security" },
    { icon: Zap, title: "Lightning Fast", desc: "Find your dream property in seconds, not hours" },
    { icon: Heart, title: "Personalized", desc: "Get recommendations tailored to your preferences" },
  ]

  return (
    <div className="register-page">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="floating-shape shape-1"></div>
        <div className="floating-shape shape-2"></div>
        <div className="floating-shape shape-3"></div>
      </div>

      <div className="register-container">
        {/* Left Side - Form */}
        <div className="form-section">
          <div className="form-wrapper">
            {/* Header */}
            <div className="form-header">
              <h1>Create Your Account</h1>
              <p>Join thousands of users finding their perfect home</p>
            </div>

            {/* Alert Messages */}
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <CheckCircle size={20} />
                <span>{success}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="register-form">
              {/* Username Field */}
              <div className="form-group">
                <label htmlFor="username">
                  <User size={18} />
                  Username
                </label>
                <div className="input-wrapper">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className={validationErrors.username ? "error" : ""}
                    required
                  />
                </div>
                {validationErrors.username && <span className="field-error">{validationErrors.username}</span>}
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={18} />
                  Email Address
                </label>
                <div className="input-wrapper">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={validationErrors.email ? "error" : ""}
                    required
                  />
                </div>
                {validationErrors.email && <span className="field-error">{validationErrors.email}</span>}
              </div>

              {/* Password Field */}
              <div className="form-group">
                <label htmlFor="password">
                  <Lock size={18} />
                  Password
                </label>
                <div className="input-wrapper password-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={validationErrors.password ? "error" : ""}
                    required
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {validationErrors.password && <span className="field-error">{validationErrors.password}</span>}
                <div className="password-strength">
                  <div className="strength-indicators">
                    <div className={`indicator ${formData.password.length >= 6 ? "active" : ""}`}></div>
                    <div className={`indicator ${formData.password.length >= 8 ? "active" : ""}`}></div>
                    <div className={`indicator ${/[A-Z]/.test(formData.password) ? "active" : ""}`}></div>
                    <div className={`indicator ${/[0-9]/.test(formData.password) ? "active" : ""}`}></div>
                  </div>
                  <span className="strength-text">
                    {formData.password.length === 0
                      ? "Enter password"
                      : formData.password.length < 6
                        ? "Weak"
                        : formData.password.length < 8
                          ? "Fair"
                          : /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password)
                            ? "Strong"
                            : "Good"}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="spinner" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Login Link */}
              <div className="form-footer">
                <p>Already have an account?</p>
                <Link to="/login" className="login-link">
                  Sign in here
                  <ArrowRight size={16} />
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Side - Features */}
        <div className="features-section">
          <div className="features-content">
            <h2>Why Choose PropertyHub?</h2>
            <p>Join our community and discover the future of property searching</p>

            <div className="features-list">
              {features.map((feature, index) => (
                <div key={index} className="feature-item" style={{ animationDelay: `${index * 0.2}s` }}>
                  <div className="feature-icon">
                    <feature.icon size={24} />
                  </div>
                  <div className="feature-content">
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Happy Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Properties</span>
              </div>
              <div className="stat">
                <span className="stat-number">99%</span>
                <span className="stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
