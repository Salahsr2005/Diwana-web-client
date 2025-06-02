// Simple toast notification system
class Toast {
  static show(message, type = "info", duration = 3000) {
    // Create toast element
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`
    toast.textContent = message

    // Add styles
    Object.assign(toast.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 24px",
      borderRadius: "8px",
      color: "white",
      fontWeight: "500",
      zIndex: "10000",
      transform: "translateX(100%)",
      transition: "transform 0.3s ease",
      backgroundColor: type === "error" ? "#ef4444" : type === "success" ? "#10b981" : "#3b82f6",
    })

    // Add to DOM
    document.body.appendChild(toast)

    // Animate in
    setTimeout(() => {
      toast.style.transform = "translateX(0)"
    }, 10)

    // Remove after duration
    setTimeout(() => {
      toast.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, duration)
  }

  static success(message, duration) {
    this.show(message, "success", duration)
  }

  static error(message, duration) {
    this.show(message, "error", duration)
  }

  static info(message, duration) {
    this.show(message, "info", duration)
  }
}

export default Toast
