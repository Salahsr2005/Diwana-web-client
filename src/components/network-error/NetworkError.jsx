"use client"

import { useState, useEffect } from "react"
import "./network-error.scss"

function NetworkError({ onRetry, error }) {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await onRetry()
    } catch (err) {
      console.error("Retry failed:", err)
    } finally {
      setIsRetrying(false)
    }
  }

  const getErrorMessage = () => {
    if (!isOnline) {
      return "You're currently offline. Please check your internet connection."
    }

    if (error?.code === "ECONNREFUSED" || error?.message?.includes("Network Error")) {
      return "Unable to connect to the server. The server might be down or unreachable."
    }

    return "Something went wrong. Please try again."
  }

  const getErrorIcon = () => {
    if (!isOnline) return "📡"
    return "🌐"
  }

  return (
    <div className="network-error">
      <div className="error-content">
        <div className="error-icon">{getErrorIcon()}</div>
        <h2>Connection Problem</h2>
        <p>{getErrorMessage()}</p>

        <div className="connection-status">
          <span className={`status ${isOnline ? "online" : "offline"}`}>
            <span className="status-dot"></span>
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        <div className="error-actions">
          <button className="retry-btn" onClick={handleRetry} disabled={isRetrying || !isOnline}>
            {isRetrying ? (
              <>
                <span className="spinner"></span>
                Retrying...
              </>
            ) : (
              <>🔄 Try Again</>
            )}
          </button>

          <button className="home-btn" onClick={() => (window.location.href = "/")}>
            🏠 Go Home
          </button>
        </div>

        <div className="help-text">
          <p>If the problem persists:</p>
          <ul>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Contact support if the issue continues</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NetworkError
