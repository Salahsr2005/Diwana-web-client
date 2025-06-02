"use client"

import { Link } from "react-router-dom"
import "./card.scss"
import {
  Bed,
  Bath,
  Heart,
  MessageSquare,
  MapPin,
  Square,
  Eye,
  Share2,
  Calendar,
  TrendingUp,
  Wifi,
  Car,
  Shield,
  Star,
  ArrowRight,
  Home,
  DollarSign,
} from "lucide-react"
import { useComparison } from "../../context/ComparisonContext"
import { useState } from "react"
import { toast } from "react-hot-toast"
import PropertyDetailModal from "../property-detail-modal/PropertyDetailModal"

function Card({ item }) {
  const { addToComparison, removeFromComparison, comparisonList } = useComparison()
  const [isSaved, setIsSaved] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const isInComparison = comparisonList.some((property) => property.id === item.id)

  const handleComparisonToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInComparison) {
      removeFromComparison(item.id)
      toast.success("Removed from comparison", {
        icon: "🗑️",
        style: {
          borderRadius: "12px",
          background: "var(--card-bg)",
          color: "var(--text-primary)",
        },
      })
    } else {
      const added = addToComparison(item)
      if (added) {
        toast.success("Added to comparison", {
          icon: "⚖️",
          style: {
            borderRadius: "12px",
            background: "var(--card-bg)",
            color: "var(--text-primary)",
          },
        })
      } else {
        toast.error("Maximum 3 properties for comparison", {
          icon: "⚠️",
          style: {
            borderRadius: "12px",
            background: "var(--card-bg)",
            color: "var(--text-primary)",
          },
        })
      }
    }
  }

  const handleSaveToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(!isSaved)
    toast.success(isSaved ? "Removed from favorites" : "Added to favorites", {
      icon: isSaved ? "💔" : "❤️",
      style: {
        borderRadius: "12px",
        background: "var(--card-bg)",
        color: "var(--text-primary)",
      },
    })
  }

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: `Check out this property: ${item.title}`,
        url: window.location.origin + `/${item.id}`,
      })
    } else {
      navigator.clipboard.writeText(window.location.origin + `/${item.id}`)
      toast.success("Link copied to clipboard!", {
        icon: "📋",
        style: {
          borderRadius: "12px",
          background: "var(--card-bg)",
          color: "var(--text-primary)",
        },
      })
    }
  }

  const handleViewDetails = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsModalOpen(true)
  }

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K`
    }
    return `$${price.toLocaleString()}`
  }

  // Calculate days since posted (mock for now, should come from API)
  const getDaysAgo = () => {
    return Math.floor(Math.random() * 30) + 1
  }

  const daysAgo = getDaysAgo()

  return (
    <>
      <div className="modern-property-card animate-fade-in">
        <div className="card-container">
          {/* Image Section */}
          <div className="image-section">
            <div className="image-container">
              <img
                src={item.images?.[0] || "/placeholder.svg?height=240&width=400"}
                alt={item.title}
                onLoad={() => setIsImageLoaded(true)}
                className={isImageLoaded ? "loaded" : ""}
              />
              <div className="image-overlay">
                <div className="overlay-gradient"></div>
              </div>

              {/* Property Type Badge */}
              <div className="property-badges">
                <span className={`property-type ${item.type}`}>
                  <Home size={12} />
                  {item.type === "rent" ? "For Rent" : "For Sale"}
                </span>
                {item.featured && (
                  <span className="featured-badge">
                    <Star size={12} />
                    Featured
                  </span>
                )}
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <button
                  className={`action-btn save-btn ${isSaved ? "saved" : ""}`}
                  onClick={handleSaveToggle}
                  aria-label={isSaved ? "Remove from saved" : "Save property"}
                >
                  <Heart size={16} className={isSaved ? "filled" : ""} />
                </button>
                <button className="action-btn share-btn" onClick={handleShare} aria-label="Share property">
                  <Share2 size={16} />
                </button>
              </div>

              {/* View Details Button */}
              <button className="view-details-btn" onClick={handleViewDetails}>
                <Eye size={16} />
                <span>Quick View</span>
              </button>
            </div>
          </div>

          {/* Content Section */}
          <div className="content-section">
            {/* Price and Status */}
            <div className="price-section">
              <div className="price-container">
                <DollarSign size={18} className="price-icon" />
                <span className="price-main">{formatPrice(item.price)}</span>
                <span className="price-period">{item.type === "rent" ? "/month" : ""}</span>
              </div>
              <div className="status-indicators">
                <div className="trending-indicator">
                  <TrendingUp size={14} />
                  <span>Hot</span>
                </div>
                <div className="time-indicator">
                  <Calendar size={12} />
                  <span>{daysAgo}d ago</span>
                </div>
              </div>
            </div>

            {/* Title */}
            <h3 className="property-title">
              <Link to={`/${item.id}`}>{item.title}</Link>
            </h3>

            {/* Location */}
            <div className="location">
              <MapPin size={14} />
              <span>{item.address}</span>
            </div>

            {/* Property Features */}
            <div className="property-features">
              <div className="feature">
                <Bed size={16} />
                <span>
                  {item.bedroom} bed{item.bedroom > 1 ? "s" : ""}
                </span>
              </div>
              <div className="feature">
                <Bath size={16} />
                <span>
                  {item.bathroom} bath{item.bathroom > 1 ? "s" : ""}
                </span>
              </div>
              <div className="feature">
                <Square size={16} />
                <span>{item.postDetail?.size || "1,200"} sqft</span>
              </div>
            </div>

            {/* Amenities Preview */}
            <div className="amenities-preview">
              <div className="amenity">
                <Wifi size={12} />
                <span>WiFi</span>
              </div>
              <div className="amenity">
                <Car size={12} />
                <span>Parking</span>
              </div>
              <div className="amenity">
                <Shield size={12} />
                <span>Security</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="card-actions">
              <button className={`compare-btn ${isInComparison ? "active" : ""}`} onClick={handleComparisonToggle}>
                <span className="compare-icon">{isInComparison ? "✓" : "+"}</span>
                <span>Compare</span>
              </button>

              <Link to={`/${item.id}`} className="contact-btn">
                <MessageSquare size={16} />
                <span>View Details</span>
                <ArrowRight size={14} className="arrow-icon" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Property Detail Modal */}
      {isModalOpen && (
        <PropertyDetailModal property={item} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}

export default Card
