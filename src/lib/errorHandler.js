// HTTP Headers Error Fix
// This utility helps prevent the ERR_HTTP_HEADERS_SENT error

export class ResponseHandler {
  constructor(res) {
    this.res = res
    this.sent = false
  }

  send(statusCode, data) {
    if (this.sent) {
      console.warn("Response already sent, ignoring duplicate send attempt")
      return
    }

    this.sent = true
    return this.res.status(statusCode).json(data)
  }

  sendError(statusCode, message) {
    if (this.sent) {
      console.warn("Response already sent, ignoring duplicate error send attempt")
      return
    }

    this.sent = true
    return this.res.status(statusCode).json({
      error: true,
      message: message || "An error occurred",
    })
  }

  isSent() {
    return this.sent || this.res.headersSent
  }
}

// Middleware to wrap response object
export const responseWrapper = (req, res, next) => {
  res.handler = new ResponseHandler(res)
  next()
}

// Example usage in controllers:
/*
export const getPosts = async (req, res) => {
  const handler = new ResponseHandler(res);
  
  try {
    const posts = await prisma.post.findMany({
      // ... query options
    });
    
    return handler.send(200, posts);
  } catch (err) {
    console.error(err);
    return handler.sendError(500, "Failed to get posts");
  }
};

// Or with middleware:
export const getPostsWithMiddleware = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      // ... query options
    });
    
    return res.handler.send(200, posts);
  } catch (err) {
    console.error(err);
    return res.handler.sendError(500, "Failed to get posts");
  }
};
*/

// Async error wrapper to catch unhandled promise rejections
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error("Async handler error:", error)

      // Check if response was already sent
      if (!res.headersSent) {
        res.status(500).json({
          error: true,
          message: "Internal server error",
        })
      }
    })
  }
}

// Global error handler middleware
export const globalErrorHandler = (err, req, res, next) => {
  console.error("Global error handler:", err)

  // Check if response was already sent
  if (res.headersSent) {
    return next(err)
  }

  // Default error response
  const statusCode = err.statusCode || 500
  const message = err.message || "Internal server error"

  res.status(statusCode).json({
    error: true,
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
