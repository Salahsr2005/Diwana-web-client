"use client"

import { useContext, useState } from "react"
import "./profileUpdatePage.scss"
import { AuthContext } from "../../context/AuthContext"
import apiRequest from "../../lib/apiRequest"
import { useNavigate } from "react-router-dom"
import UploadWidget from "../../components/uploadWidget/UploadWidget"

function ProfileUpdatePage() {
  const { currentUser, updateUser } = useContext(AuthContext)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [avatar, setAvatar] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    const formData = new FormData(e.target)
    const { username, email, password } = Object.fromEntries(formData)

    try {
      const res = await apiRequest.put(`/users/${currentUser.id}`, {
        username,
        email,
        password,
        avatar: avatar[0] || currentUser.avatar,
      })

      setSuccess("Profile updated successfully!")
      updateUser(res.data)

      // Navigate after a short delay to show success message
      setTimeout(() => {
        navigate("/profile")
      }, 1500)
    } catch (err) {
      console.log(err)
      setError(err.response?.data?.message || "An error occurred while updating your profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="profileUpdatePage">
      <div className="update-container">
        <div className="form-section">
          <h1>Update Your Profile</h1>
          <p className="subtitle">Change your profile information below</p>

          {error && (
            <div className="error-message">
              <span className="icon">⚠️</span>
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <span className="icon">✅</span>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">
                <span className="icon">👤</span>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                defaultValue={currentUser.username}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                <span className="icon">📧</span>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                defaultValue={currentUser.email}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <span className="icon">🔒</span>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter new password (leave empty to keep current)"
              />
              <p className="helper-text">Leave empty if you dont want to change your password</p>
            </div>

            <div className="buttons">
              <button type="button" className="cancel-btn" onClick={() => navigate("/profile")}>
                Cancel
              </button>
              <button type="submit" className="update-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="spinner">⏳</span>
                    Updating...
                  </>
                ) : (
                  <>
                    <span className="icon">💾</span>
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="avatar-section">
          <div className="avatar-container">
            <img
              src={avatar[0] || currentUser.avatar || "/noavatar.jpg"}
              alt="Profile avatar"
              className="avatar-preview"
            />
            <div className="avatar-overlay">
              <p>Profile Photo</p>
              <UploadWidget
                uwConfig={{
                  cloudName: "lamadev",
                  uploadPreset: "estate",
                  multiple: false,
                  maxImageFileSize: 2000000,
                  folder: "avatars",
                }}
                setState={setAvatar}
              />
            </div>
          </div>
          <div className="avatar-info">
            <h3>Profile Photo</h3>
            <p>Upload a new profile photo. Recommended size: 400x400px.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileUpdatePage
