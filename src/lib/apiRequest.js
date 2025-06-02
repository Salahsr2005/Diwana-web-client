import axios from "axios"

const apiRequest = axios.create({
  baseURL: "https://diwana-web.onrender.com/api",
  withCredentials: true,
})

// Add response interceptor to handle errors
apiRequest.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("API Error:", error.response.data)

      // Handle specific error codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          if (window.location.pathname !== "/login") {
            window.location.href = "/login"
          }
          break
        case 403:
          // Forbidden
          console.error("Access forbidden")
          break
        case 404:
          // Not found
          console.error("Resource not found")
          break
        case 500:
          // Server error
          console.error("Internal server error")
          break
        default:
          console.error("An error occurred:", error.response.data.message)
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Network error:", error.request)
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error:", error.message)
    }

    return Promise.reject(error)
  },
)

export default apiRequest
