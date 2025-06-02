"use client"

import "./singlePage.scss"
import Slider from "../../components/slider/Slider"
import Map from "../../components/map/Map"
import { useNavigate, useLoaderData } from "react-router-dom"
import DOMPurify from "dompurify"
import { useContext, useState } from "react"
import { AuthContext } from "../../context/AuthContext"
import apiRequest from "../../lib/apiRequest"

function SinglePage() {
  const post = useLoaderData()
  const [saved, setSaved] = useState(post.isSaved)
  const { currentUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleSave = async () => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    // Optimistic UI update
    setSaved((prev) => !prev)

    try {
      await apiRequest.post("/users/save", { postId: post.id })
    } catch (err) {
      console.log(err)
      // Revert on error
      setSaved((prev) => !prev)
    }
  }

  const handleContact = () => {
    if (!currentUser) {
      navigate("/login")
      return
    }

    // Navigate to profile with chat open or implement chat functionality
    navigate("/profile")
  }

  return (
    <div className="singlePage">
      <div className="details">
        <div className="wrapper">
          <Slider images={post.images} />
          <div className="info">
            <div className="top">
              <div className="post">
                <div className="title-section">
                  <h1>{post.title}</h1>
                  <div className="property-type">
                    <span className={post.type === "rent" ? "rent" : "buy"}>
                      {post.type === "rent" ? "For Rent" : "For Sale"}
                    </span>
                    <span className="property-category">{post.property}</span>
                  </div>
                </div>
                <div className="address">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{post.address}</span>
                </div>
                <div className="price">$ {post.price.toLocaleString()}</div>
              </div>
              <div className="user">
                <img src={post.user.avatar || "/noavatar.jpg"} alt="" />
                <span>{post.user.username}</span>
                <button className="contact-btn" onClick={handleContact}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                  </svg>
                  Contact
                </button>
              </div>
            </div>
            <div
              className="description"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.postDetail.desc),
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="features">
        <div className="wrapper">
          <div className="section">
            <h2 className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
              Property Details
            </h2>
            <div className="property-details">
              <div className="detail-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <div>
                  <span className="label">Property Type</span>
                  <p className="value">{post.property}</p>
                </div>
              </div>
              <div className="detail-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
                <div>
                  <span className="label">Size</span>
                  <p className="value">{post.postDetail.size} sqft</p>
                </div>
              </div>
              <div className="detail-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                <div>
                  <span className="label">Bedrooms</span>
                  <p className="value">{post.bedroom}</p>
                </div>
              </div>
              <div className="detail-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 2H2v20h20V2zM2 12h20M7 2v20M17 2v20"></path>
                </svg>
                <div>
                  <span className="label">Bathrooms</span>
                  <p className="value">{post.bathroom}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Policies
            </h2>
            <div className="policies">
              <div className="policy-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                  <span className="label">Utilities</span>
                  <p className="value">
                    {post.postDetail.utilities === "owner"
                      ? "Owner is responsible"
                      : post.postDetail.utilities === "tenant"
                        ? "Tenant is responsible"
                        : "Shared responsibility"}
                  </p>
                </div>
              </div>
              <div className="policy-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                </svg>
                <div>
                  <span className="label">Pet Policy</span>
                  <p className="value">{post.postDetail.pet === "allowed" ? "Pets Allowed" : "No Pets Allowed"}</p>
                </div>
              </div>
              <div className="policy-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="M7 15h0M2 9.5h20"></path>
                </svg>
                <div>
                  <span className="label">Income Policy</span>
                  <p className="value">{post.postDetail.income || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Nearby Places
            </h2>
            <div className="nearby-places">
              <div className="place-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
                <div>
                  <span className="label">School</span>
                  <p className="value">
                    {post.postDetail.school > 999
                      ? (post.postDetail.school / 1000).toFixed(1) + "km"
                      : post.postDetail.school + "m"}{" "}
                    away
                  </p>
                </div>
              </div>
              <div className="place-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 6v6h8V6"></path>
                  <path d="M4 6h16l-2 12H6L4 6z"></path>
                  <path d="M2 4h2l2 2"></path>
                </svg>
                <div>
                  <span className="label">Bus Stop</span>
                  <p className="value">{post.postDetail.bus}m away</p>
                </div>
              </div>
              <div className="place-item">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12V7a1 1 0 0 1 1-1h4l2 2h4a1 1 0 0 1 1 1v4"></path>
                  <path d="M3 20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-1a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1z"></path>
                </svg>
                <div>
                  <span className="label">Restaurant</span>
                  <p className="value">{post.postDetail.restaurant}m away</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              Location
            </h2>
            <div className="mapContainer">
              <Map items={[post]} />
            </div>
          </div>

          <div className="actions">
            <button className="contact-btn" onClick={handleContact}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Send a Message
            </button>
            <button className={`save-btn ${saved ? "saved" : ""}`} onClick={handleSave}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill={saved ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              {saved ? "Saved" : "Save Property"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SinglePage
