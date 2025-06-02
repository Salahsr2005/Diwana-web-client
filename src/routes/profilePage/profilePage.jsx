"use client"

import Chat from "../../components/chat/Chat"
import List from "../../components/list/List"
import "./profilePage.scss"
import apiRequest from "../../lib/apiRequest"
import { Await, Link, useLoaderData, useNavigate } from "react-router-dom"
import { Suspense, useContext, useState } from "react"
import { AuthContext } from "../../context/AuthContext"

function ProfilePage() {
  const data = useLoaderData()
  const [activeTab, setActiveTab] = useState("myListings")

  const { updateUser, currentUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await apiRequest.post("/auth/logout")
      updateUser(null)
      navigate("/")
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <div className="profilePage">
      <div className="details">
        <div className="wrapper">
          <div className="profile-header">
            <div className="profile-info">
              <div className="avatar-container">
                <img
                  src={currentUser.avatar || "/noavatar.jpg"}
                  alt={`${currentUser.username}'s avatar`}
                  className="avatar"
                />
              </div>
              <div className="user-details">
                <h1>{currentUser.username}</h1>
                <p className="email">{currentUser.email}</p>
                <div className="actions">
                  <Link to="/profile/update" className="edit-profile">
                    <span className="icon">✏️</span>
                    Edit Profile
                  </Link>
                  <button onClick={handleLogout} className="logout">
                    <span className="icon">🚪</span>
                    Logout
                  </button>
                </div>
              </div>
            </div>
            <Link to="/add" className="add-listing">
              <span className="icon">➕</span>
              Create New Listing
            </Link>
          </div>

          <div className="tabs">
            <button className={activeTab === "myListings" ? "active" : ""} onClick={() => setActiveTab("myListings")}>
              <span className="icon">🏠</span>
              My Listings
            </button>
            <button
              className={activeTab === "savedListings" ? "active" : ""}
              onClick={() => setActiveTab("savedListings")}
            >
              <span className="icon">🔖</span>
              Saved Listings
            </button>
          </div>

          <div className="listings-container">
            {activeTab === "myListings" && (
              <Suspense fallback={<div className="loading-skeleton">Loading your listings...</div>}>
                <Await
                  resolve={data.postResponse}
                  errorElement={<div className="error-message">Error loading your listings. Please try again.</div>}
                >
                  {(postResponse) =>
                    postResponse.data.userPosts.length > 0 ? (
                      <List posts={postResponse.data.userPosts} />
                    ) : (
                      <div className="empty-state">
                        <span className="empty-icon">🏠</span>
                        <h3>No listings yet</h3>
                        <p>Create your first property listing to get started</p>
                        <Link to="/add" className="create-listing-btn">
                          Create Listing
                        </Link>
                      </div>
                    )
                  }
                </Await>
              </Suspense>
            )}

            {activeTab === "savedListings" && (
              <Suspense fallback={<div className="loading-skeleton">Loading saved listings...</div>}>
                <Await
                  resolve={data.postResponse}
                  errorElement={<div className="error-message">Error loading saved listings. Please try again.</div>}
                >
                  {(postResponse) =>
                    postResponse.data.savedPosts.length > 0 ? (
                      <List posts={postResponse.data.savedPosts} />
                    ) : (
                      <div className="empty-state">
                        <span className="empty-icon">🔖</span>
                        <h3>No saved listings</h3>
                        <p>Properties you save will appear here</p>
                        <Link to="/list" className="browse-listings-btn">
                          Browse Listings
                        </Link>
                      </div>
                    )
                  }
                </Await>
              </Suspense>
            )}
          </div>
        </div>
      </div>
      <div className="chatContainer">
        <div className="wrapper">
          <Suspense fallback={<div className="loading-skeleton">Loading messages...</div>}>
            <Await
              resolve={data.chatResponse}
              errorElement={<div className="error-message">Error loading messages. Please try again.</div>}
            >
              {(chatResponse) => <Chat chats={chatResponse.data} />}
            </Await>
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
