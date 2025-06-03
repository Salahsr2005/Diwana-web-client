"use client"

import React from "react"
import "./error-boundary.scss"

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h1>Oops! Something went wrong</h1>
            <p>Were sorry, but something unexpected happened.</p>

            <div className="error-actions">
              <button className="retry-btn" onClick={() => window.location.reload()}>
                🔄 Reload Page
              </button>
              <button className="home-btn" onClick={() => (window.location.href = "/")}>
                🏠 Go Home
              </button>
            </div>

            {import.meta.process.env.NODE_ENV === "development" && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error && this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
