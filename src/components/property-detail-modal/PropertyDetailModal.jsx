"use client"

import { useState, useEffect } from "react"
import "./property-detail-modal.scss"
import {
  X,
  MapPin,
  Bed,
  Bath,
  Square,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  TrendingUp,
  Wifi,
  Car,
  Shield,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react"
import Map from "../map/Map"

export default function PropertyDetailModal({ property, isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev === property.images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? property.images.length - 1 : prev - 1))
  }

  const formatPrice = (price) => {
    return `$${price.toLocaleString()}`
  }

  const amenities = [
    { icon: Wifi, label: "High-Speed WiFi", available: true },
    { icon: Car, label: "Parking Space", available: true },
    { icon: Shield, label: "24/7 Security", available: true },
    { icon: Play, label: "Entertainment System", available: false },
  ]

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "location", label: "Location" },
  ]

  return (
    <div className="property-modal-overlay" onClick={onClose}>
      <div className="property-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-content">
            <div className="property-type-badge">
              <span className={property.type}>{property.type === "rent" ? "For Rent" : "For Sale"}</span>
            </div>
            <h2>{property.title}</h2>
            <div className="location">
              <MapPin size={16} />
              <span>{property.address}</span>
            </div>
          </div>
          <div className="header-actions">
            <button className={`action-btn ${isSaved ? "saved" : ""}`} onClick={() => setIsSaved(!isSaved)}>
              <Heart size={18} className={isSaved ? "filled" : ""} />
            </button>
            <button className="action-btn">
              <Share2 size={18} />
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Image Gallery */}
          <div className="image-gallery">
            <div className="main-image">
              <img src={property.images[currentImageIndex] || "/placeholder.svg"} alt={property.title} />
              <div className="image-navigation">
                <button className="nav-btn prev" onClick={prevImage}>
                  <ChevronLeft size={20} />
                </button>
                <button className="nav-btn next" onClick={nextImage}>
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="image-counter">
                {currentImageIndex + 1} / {property.images.length}
              </div>
            </div>
            <div className="image-thumbnails">
              {property.images.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${index === currentImageIndex ? "active" : ""}`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <img src={image || "/placeholder.svg"} alt={`View ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Property Info */}
          <div className="property-info">
            {/* Price and Stats */}
            <div className="price-stats">
              <div className="price-section">
                <span className="price">{formatPrice(property.price)}</span>
                <span className="period">{property.type === "rent" ? "/month" : ""}</span>
                <div className="trending">
                  <TrendingUp size={14} />
                  <span>+5.2% this month</span>
                </div>
              </div>
              <div className="property-stats">
                <div className="stat">
                  <Bed size={18} />
                  <span>{property.bedroom} Bedrooms</span>
                </div>
                <div className="stat">
                  <Bath size={18} />
                  <span>{property.bathroom} Bathrooms</span>
                </div>
                <div className="stat">
                  <Square size={18} />
                  <span>{property.size || "1,200"} sqft</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="info-tabs">
              <div className="tab-buttons">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="tab-content">
                {activeTab === "overview" && (
                  <div className="overview-content">
                    <div className="description">
                      <h4>Description</h4>
                      <p>
                        This stunning {property.type === "rent" ? "rental" : ""} property offers modern living with
                        exceptional amenities. Located in a prime area with easy access to transportation, shopping, and
                        entertainment. The spacious layout features {property.bedroom} bedrooms and {property.bathroom}{" "}
                        bathrooms, perfect for comfortable living.
                      </p>
                    </div>
                    <div className="property-details">
                      <h4>Property Details</h4>
                      <div className="details-grid">
                        <div className="detail-item">
                          <span className="label">Property Type:</span>
                          <span className="value">Apartment</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Year Built:</span>
                          <span className="value">2020</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Parking:</span>
                          <span className="value">1 Space</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Pet Policy:</span>
                          <span className="value">Pets Allowed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "amenities" && (
                  <div className="amenities-content">
                    <h4>Available Amenities</h4>
                    <div className="amenities-grid">
                      {amenities.map((amenity, index) => (
                        <div key={index} className={`amenity-item ${amenity.available ? "available" : "unavailable"}`}>
                          <amenity.icon size={20} />
                          <span>{amenity.label}</span>
                          {amenity.available && <span className="check">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "location" && (
                  <div className="location-content">
                    <h4>Location & Nearby</h4>
                    <div className="map-container">
                      <Map items={[property]} />
                    </div>
                    <div className="nearby-places">
                      <div className="place">
                        <span className="distance">0.2 mi</span>
                        <span className="name">Central Park</span>
                      </div>
                      <div className="place">
                        <span className="distance">0.5 mi</span>
                        <span className="name">Metro Station</span>
                      </div>
                      <div className="place">
                        <span className="distance">0.8 mi</span>
                        <span className="name">Shopping Mall</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <div className="contact-info">
            <div className="agent-info">
              <img src="/noavatar.jpg" alt="Agent" />
              <div>
                <span className="agent-name">John Smith</span>
                <span className="agent-title">Real Estate Agent</span>
              </div>
            </div>
          </div>
          <div className="action-buttons">
            <button className="contact-btn phone">
              <Phone size={18} />
              <span>Call Now</span>
            </button>
            <button className="contact-btn message">
              <MessageSquare size={18} />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
