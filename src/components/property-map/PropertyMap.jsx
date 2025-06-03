"use client"

import { handleImageError } from "../../lib/placeholderUtils"
import { useEffect, useState, useRef } from "react"
import "./property-map.scss"
import {
  MapPin,
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  X,
  Phone,
  Mail,
  MessageCircle,
  Star,
  Calendar,
  Eye,
  Heart,
  Share2,
  Navigation,
  Search,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { icon } from "leaflet"
import Pin from "../pin/Pin"

// Fix for default markers
const PROPERTY_ICON = icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const USER_LOCATION_ICON = icon({
  iconUrl:
    "data:image/svg+xml;base64," +
    btoa(`
    <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
      <circle cx="15" cy="15" r="12" fill="#3b82f6" stroke="white" strokeWidth="3"/>
      <circle cx="15" cy="15" r="4" fill="white"/>
    </svg>
  `),
  iconSize: [30, 30],
  iconAnchor: [15, 15],
})

// Component to update map view
function MapController({ center, zoom, bounds }) {
  const map = useMap()

  useEffect(() => {
    if (bounds && bounds.length === 4) {
      // bounds format: [south, west, north, east]
      const leafletBounds = [
        [bounds[0], bounds[1]], // southwest
        [bounds[2], bounds[3]], // northeast
      ]
      map.fitBounds(leafletBounds, { padding: [20, 20] })
    } else if (center && center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 13)
    }
  }, [center, zoom, bounds, map])

  return null
}

const PropertyMap = ({
  items = [],
  properties = [],
  userLocation,
  selectedProperty,
  onPropertySelect,
  onBoundsChange,
  onMapLoaded,
  searchQuery = "",
  showUserLocation = true,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activePropertyCard, setActivePropertyCard] = useState(null)
  const [mapError, setMapError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [validItems, setValidItems] = useState([])
  const [mapReady, setMapReady] = useState(false)
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]) // Default to NYC
  const [mapZoom, setMapZoom] = useState(10)
  const [mapBounds, setMapBounds] = useState(null)
  const [nearbyProperties, setNearbyProperties] = useState([])
  const [showNearbyMessage, setShowNearbyMessage] = useState(false)
  const [mapKey, setMapKey] = useState(0)
  const mapRef = useRef()

  // Helper function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    const latitude = Number.parseFloat(lat)
    const longitude = Number.parseFloat(lng)

    return (
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      isFinite(latitude) &&
      isFinite(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180
    )
  }

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Get nearby properties when no search results
  const getNearbyProperties = (userLat, userLng, allProperties, radius = 50) => {
    if (!userLat || !userLng || !allProperties) return []

    return allProperties
      .filter((property) => {
        const lat = Number.parseFloat(property.latitude)
        const lng = Number.parseFloat(property.longitude)

        if (!isValidCoordinate(lat, lng)) return false

        const distance = calculateDistance(userLat, userLng, lat, lng)
        return distance <= radius
      })
      .sort((a, b) => {
        const distA = calculateDistance(userLat, userLng, Number.parseFloat(a.latitude), Number.parseFloat(a.longitude))
        const distB = calculateDistance(userLat, userLng, Number.parseFloat(b.latitude), Number.parseFloat(b.longitude))
        return distA - distB
      })
      .slice(0, 20) // Limit to 20 nearby properties
  }

  // Calculate bounds for multiple properties
  const calculateBounds = (properties) => {
    if (!properties || properties.length === 0) return null

    let minLat = Number.POSITIVE_INFINITY,
      maxLat = Number.NEGATIVE_INFINITY
    let minLng = Number.POSITIVE_INFINITY,
      maxLng = Number.NEGATIVE_INFINITY

    properties.forEach((property) => {
      const lat = Number.parseFloat(property.latitude)
      const lng = Number.parseFloat(property.longitude)

      if (isValidCoordinate(lat, lng)) {
        minLat = Math.min(minLat, lat)
        maxLat = Math.max(maxLat, lat)
        minLng = Math.min(minLng, lng)
        maxLng = Math.max(maxLng, lng)
      }
    })

    if (minLat === Number.POSITIVE_INFINITY) return null

    // Add padding
    const latPadding = (maxLat - minLat) * 0.1
    const lngPadding = (maxLng - minLng) * 0.1

    return [
      minLat - latPadding, // south
      minLng - lngPadding, // west
      maxLat + latPadding, // north
      maxLng + lngPadding, // east
    ]
  }

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapReady(true)
      if (onMapLoaded) onMapLoaded()
    }, 1000)

    return () => clearTimeout(timer)
  }, [onMapLoaded])

  // Process and validate items
  useEffect(() => {
    const itemsToProcess = items.length > 0 ? items : properties

    if (!itemsToProcess || !Array.isArray(itemsToProcess)) {
      setValidItems([])
      setNearbyProperties([])
      setIsLoading(false)
      return
    }

    try {
      const filtered = itemsToProcess.filter((item) => {
        const lat = Number.parseFloat(item.latitude)
        const lng = Number.parseFloat(item.longitude)

        if (!isValidCoordinate(lat, lng)) {
          console.warn(`Invalid coordinates for property ${item.id}:`, { lat, lng })
          return false
        }

        return true
      })

      setValidItems(filtered)
      setMapError(null)

      // Update map center and bounds based on results
      if (filtered.length > 0) {
        // If we have search results, center on them
        if (filtered.length === 1) {
          const lat = Number.parseFloat(filtered[0].latitude)
          const lng = Number.parseFloat(filtered[0].longitude)
          setMapCenter([lat, lng])
          setMapZoom(15)
          setMapBounds(null)
        } else {
          // Calculate bounds for multiple properties
          const bounds = calculateBounds(filtered)
          if (bounds) {
            setMapBounds(bounds)
            setMapCenter([(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2])
            setMapZoom(12)
          }
        }
        setShowNearbyMessage(false)
        setNearbyProperties([])
      } else if (userLocation && showUserLocation) {
        // No search results, show user location with nearby properties
        setMapCenter([userLocation.latitude, userLocation.longitude])
        setMapZoom(13)
        setMapBounds(null)

        // Get all properties for nearby search
        const allProperties = properties.length > 0 ? properties : items
        const nearby = getNearbyProperties(userLocation.latitude, userLocation.longitude, allProperties)
        setNearbyProperties(nearby)
        setShowNearbyMessage(true)
      } else {
        // No results and no user location, show default view
        setMapCenter([40.7128, -74.006])
        setMapZoom(10)
        setMapBounds(null)
        setNearbyProperties([])
        setShowNearbyMessage(false)
      }

      // Force map re-render
      setMapKey((prev) => prev + 1)
    } catch (error) {
      console.error("Error processing map items:", error)
      setMapError("Failed to process property locations")
      setValidItems([])
      setNearbyProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [items, properties, userLocation, showUserLocation])

  const handlePropertyClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property)
    }
  }

  const handleGoToUserLocation = () => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude])
      setMapZoom(15)
      setMapBounds(null)
      setMapKey((prev) => prev + 1)
    }
  }

  if (isLoading) {
    return (
      <div className="property-map-container">
        <div className="map-loading">
          <div className="loading-spinner">🔄</div>
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="property-map-container">
        <div className="map-error">
          <span>⚠️</span>
          <h3>Map Error</h3>
          <p>{mapError}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0"

    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`
    }
    return price.toLocaleString()
  }

  const handlePropertyCardClick = () => {
    if (activePropertyCard && onPropertySelect) {
      onPropertySelect(activePropertyCard)
    }
  }

  const handleOwnerClick = (property) => {
    const ownerData = getOwnerData(property.id)
    setSelectedOwner(ownerData)
    setShowOwnerModal(true)
  }

  const handleSendMessage = () => {
    // In a real app, this would open a messaging interface
    alert("Message functionality would be implemented here")
  }

  // Mock owner data - in real app, this would come from API
  const getOwnerData = (propertyId) => ({
    id: propertyId,
    name: "John Smith",
    avatar: "https://via.placeholder.com/60x60?text=Owner",
    rating: 4.8,
    reviewCount: 127,
    responseTime: "Usually responds within 2 hours",
    phone: "+1 (555) 123-4567",
    email: "john.smith@email.com",
    verified: true,
    joinDate: "2020-03-15",
    totalProperties: 12,
    bio: "Experienced real estate professional with over 10 years in the industry. Specializing in luxury properties and investment opportunities.",
  })

  // Properties to display (search results or nearby properties)
  const propertiesToShow = validItems.length > 0 ? validItems : nearbyProperties
  const totalProperties = propertiesToShow.length

  return (
    <div className={`enhanced-property-map ${isFullscreen ? "fullscreen" : ""}`}>
      <div className="property-map-container">
        <div className="map-header">
          <div className="map-info">
            <span>📍</span>
            {showNearbyMessage ? (
              <span>
                {searchQuery ? `No results for "${searchQuery}". ` : ""}
                Showing {totalProperties} nearby properties
              </span>
            ) : (
              <span>{totalProperties} properties found</span>
            )}
          </div>
          <div className="map-controls">
            {userLocation && (
              <button className="control-btn location-btn" onClick={handleGoToUserLocation} title="Go to my location">
                <Navigation size={16} />
              </button>
            )}
            <button
              className="control-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </div>
        </div>

        {showNearbyMessage && (
          <div className="nearby-message">
            <div className="nearby-content">
              <Search size={16} />
              <span>
                {searchQuery
                  ? `No exact matches for "${searchQuery}". Showing nearby properties instead.`
                  : "Showing properties near your location."}
              </span>
            </div>
          </div>
        )}

        <MapContainer
          key={mapKey}
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="property-map"
          ref={mapRef}
        >
          <MapController center={mapCenter} zoom={mapZoom} bounds={mapBounds} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User location marker */}
          {userLocation && showUserLocation && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={USER_LOCATION_ICON}>
              <Popup>
                <div className="user-location-popup">
                  <h4>📍 Your Location</h4>
                  <p>You are here</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Property markers */}
          {propertiesToShow.map((item) => {
            const lat = Number.parseFloat(item.latitude)
            const lng = Number.parseFloat(item.longitude)

            if (!isValidCoordinate(lat, lng)) return null

            return (
              <Marker key={item.id} position={[lat, lng]} icon={PROPERTY_ICON}>
                <Popup>
                  <Pin item={item} />
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Property Card */}
      {activePropertyCard && (
        <div className="property-card-overlay">
          <div className="enhanced-property-card">
            <button className="close-card-btn" onClick={() => setActivePropertyCard(null)}>
              <X size={16} />
            </button>

            <div className="card-image">
              <img
                src={activePropertyCard.images?.[0] || "https://via.placeholder.com/120x80?text=Property"}
                alt={activePropertyCard.title}
                onError={handleImageError}
              />
              <div className="property-badges">
                <div className="property-type-badge">
                  <Home size={12} />
                  {activePropertyCard.type === "rent" ? "For Rent" : "For Sale"}
                </div>
                <div className="views-badge">
                  <Eye size={12} />
                  <span>127 views</span>
                </div>
              </div>
              <div className="card-actions">
                <button className="action-btn">
                  <Heart size={16} />
                </button>
                <button className="action-btn">
                  <Share2 size={16} />
                </button>
              </div>
            </div>

            <div className="card-content">
              <div className="price-section">
                <div className="price">
                  <DollarSign size={16} />${activePropertyCard.price?.toLocaleString() || "0"}
                  {activePropertyCard.type === "rent" && <span>/month</span>}
                </div>
                <div className="price-trend">
                  <span className="trend-up">+5.2%</span>
                </div>
              </div>

              <h3 className="property-title">{activePropertyCard.title}</h3>

              <div className="location">
                <MapPin size={14} />
                <span>{activePropertyCard.address}</span>
              </div>

              <div className="property-features">
                <div className="feature">
                  <Bed size={14} />
                  <span>{activePropertyCard.bedroom || 0} beds</span>
                </div>
                <div className="feature">
                  <Bath size={14} />
                  <span>{activePropertyCard.bathroom || 0} baths</span>
                </div>
                <div className="feature">
                  <Square size={14} />
                  <span>{activePropertyCard.postDetail?.size || "1,200"} sqft</span>
                </div>
              </div>

              {/* Owner Information */}
              <div className="owner-section">
                <div className="owner-info" onClick={() => handleOwnerClick(activePropertyCard)}>
                  <img
                    src="https://via.placeholder.com/40x40?text=Owner"
                    alt="Owner"
                    className="owner-avatar"
                    onError={handleImageError}
                  />
                  <div className="owner-details">
                    <h4>John Smith</h4>
                    <div className="owner-rating">
                      <Star size={12} fill="currentColor" />
                      <span>4.8 (127 reviews)</span>
                    </div>
                    <p>Usually responds within 2 hours</p>
                  </div>
                  <div className="verified-badge">
                    <span>✓ Verified</span>
                  </div>
                </div>
              </div>

              <div className="card-actions">
                <button className="contact-btn" onClick={() => handleOwnerClick(activePropertyCard)}>
                  <MessageCircle size={16} />
                  <span>Contact Owner</span>
                </button>
                <button className="view-details-btn" onClick={handlePropertyCardClick}>
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Owner Modal */}
      {showOwnerModal && selectedOwner && (
        <div className="owner-modal-overlay" onClick={() => setShowOwnerModal(false)}>
          <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowOwnerModal(false)}>
              <X size={20} />
            </button>

            <div className="owner-header">
              <img
                src={selectedOwner.avatar || "https://via.placeholder.com/60x60?text=Owner"}
                alt={selectedOwner.name}
                className="owner-avatar-large"
                onError={handleImageError}
              />
              <div className="owner-info">
                <div className="owner-name-section">
                  <h2>{selectedOwner.name}</h2>
                  {selectedOwner.verified && (
                    <div className="verified-badge">
                      <span>✓ Verified</span>
                    </div>
                  )}
                </div>
                <div className="owner-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < Math.floor(selectedOwner.rating) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <span>
                    {selectedOwner.rating} ({selectedOwner.reviewCount} reviews)
                  </span>
                </div>
                <p className="response-time">{selectedOwner.responseTime}</p>
              </div>
            </div>

            <div className="owner-stats">
              <div className="stat">
                <Calendar size={16} />
                <span>Joined {new Date(selectedOwner.joinDate).getFullYear()}</span>
              </div>
              <div className="stat">
                <Home size={16} />
                <span>{selectedOwner.totalProperties} properties</span>
              </div>
            </div>

            <div className="owner-bio">
              <h3>About</h3>
              <p>{selectedOwner.bio}</p>
            </div>

            <div className="contact-section">
              <h3>Contact Information</h3>
              <div className="contact-methods">
                <div className="contact-item">
                  <Phone size={16} />
                  <span>{selectedOwner.phone}</span>
                  <button className="contact-action-btn">Call</button>
                </div>
                <div className="contact-item">
                  <Mail size={16} />
                  <span>{selectedOwner.email}</span>
                  <button className="contact-action-btn">Email</button>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="message-btn primary" onClick={handleSendMessage}>
                <MessageCircle size={16} />
                Send Message
              </button>
              <button className="call-btn secondary">
                <Phone size={16} />
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Legend */}
      <div className="map-legend">
        {userLocation && showUserLocation && (
          <div className="legend-item">
            <div className="legend-marker user-location"></div>
            <span>Your Location</span>
          </div>
        )}
        <div className="legend-item">
          <div className="legend-marker property-rent"></div>
          <span>For Rent</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker property-sale"></div>
          <span>For Sale</span>
        </div>
      </div>

      {/* Empty State */}
      {totalProperties === 0 && !isLoading && (
        <div className="map-empty-state">
          <div className="empty-content">
            <MapPin size={48} />
            <h3>No Properties Found</h3>
            <p>{searchQuery ? `No properties found for "${searchQuery}"` : "No properties available in this area"}</p>
            {userLocation && (
              <button className="center-location-btn" onClick={handleGoToUserLocation}>
                <Navigation size={16} />
                Show My Location
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PropertyMap
