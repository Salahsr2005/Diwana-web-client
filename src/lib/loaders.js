import { defer } from "react-router-dom"
import apiRequest from "./apiRequest"

export const singlePageLoader = async ({ request, params }) => {
  try {
    const res = await apiRequest("/posts/" + params.id)
    return res.data
  } catch (error) {
    console.error("Error loading single page:", error)
    throw new Response("Property not found", { status: 404 })
  }
}

export const listPageLoader = async ({ request, params }) => {
  try {
    const query = request.url.split("?")[1]
    const postPromise = apiRequest("/posts?" + (query || ""))
    return defer({
      postResponse: postPromise,
    })
  } catch (error) {
    console.error("Error loading list page:", error)
    return defer({
      postResponse: Promise.resolve({ data: [] }),
    })
  }
}

export const profilePageLoader = async () => {
  try {
    const postPromise = apiRequest("/users/profilePosts")
    const chatPromise = apiRequest("/chats")
    return defer({
      postResponse: postPromise,
      chatResponse: chatPromise,
    })
  } catch (error) {
    console.error("Error loading profile page:", error)
    return defer({
      postResponse: Promise.resolve({ data: { userPosts: [], savedPosts: [] } }),
      chatResponse: Promise.resolve({ data: [] }),
    })
  }
}
