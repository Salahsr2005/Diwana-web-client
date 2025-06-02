"use client"

import { useState, useEffect } from "react"
import "./searchBar.scss"
import { Link } from "react-router-dom"
import {
  Search,
  MapPin,
  DollarSign,
  Home,
  Filter,
  X,
  Bed,
  Bath,
  Car,
  Wifi,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react"

const types = ["buy", "rent"]

const propertyTypes = [
  { value: "apartment", label: "Apartment", icon: "🏢" },
  { value: "house", label: "House", icon: "🏠" },
  { value: "condo", label: "Condo", icon: "🏘️" },
  { value: "villa", label: "Villa", icon: "🏖️" },
  { value: "studio", label: "Studio", icon: "🏠" },
]

const amenities = [
  { value: "wifi", label: "WiFi", icon: Wifi },
  { value: "parking", label: "Parking", icon: Car },
  { value: "security", label: "Security", icon: Shield },
  { value: "gym", label: "Gym", icon: TrendingUp },
  { value: "pool", label: "Pool", icon: "🏊" },
  { value: "garden", label: "Garden", icon: "🌳" },
]

function SearchBar() {
  const [query, setQuery] = useState({
    type: "buy",
    city: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
    amenities: [],
  })

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [locationPermission, setLocationPermission] = useState("prompt")

  useEffect(() => {
    // Check if geolocation is supported
    if ("geolocation" in navigator) {
      // Check current permission status
      if ("permissions" in navigator) {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
          setLocationPermission(result.state)
          if (result.state === "granted") {
            getCurrentLocation()
          }
        })
      }
    }
  }, [])

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          setLocationPermission("granted")
        },
        (error) => {
          console.error("Error getting location:", error)
          setLocationPermission("denied")
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      )
    }
  }

  const requestLocation = () => {
    getCurrentLocation()
  }

  const switchType = (val) => {
    setQuery((prev) => ({ ...prev, type: val }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setQuery((prev) => ({ ...prev, [name]: value }))
  }

  const handleAmenityToggle = (amenity) => {
    setQuery((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const clearFilters = () => {
    setQuery({
      type: "buy",
      city: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      propertyType: "",
      amenities: [],
    })
  }

  const buildSearchUrl = () => {
    const params = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (value && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.append(key, value.join(","))
          }
        } else {
          params.append(key, value)
        }
      }
    })

    // Add user location if available
    if (userLocation) {
      params.append("userLat", userLocation.latitude)
      params.append("userLng", userLocation.longitude)
    }

    return `/list?${params.toString()}`
  }

  return (
    <div className="modern-search-bar">
      {/* Main Search Container */}
      <div className="search-container">
        {/* Property Type Toggle */}
        <div className="type-selector">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => switchType(type)}
              className={`type-btn ${query.type === type ? "active" : ""}`}
            >
              <Home size={16} />
              {type === "buy" ? "Buy" : "Rent"}
            </button>
          ))}
        </div>

        {/* Main Search Form */}
        <div className="search-form">
          {/* Location Input */}
          <div className="search-field location-field">
            <MapPin size={18} className="field-icon" />
            <input
              type="text"
              name="city"
              placeholder="Enter city or neighborhood"
              value={query.city}
              onChange={handleChange}
              className="search-input"
            />
            {locationPermission !== "granted" && (
              <button type="button" className="location-btn" onClick={requestLocation} title="Use my current location">
                <MapPin size={16} />
              </button>
            )}
            {userLocation && (
              <div className="location-indicator">
                <div className="location-dot"></div>
              </div>
            )}
          </div>

          {/* Price Range */}
          <div className="search-field price-field">
            <DollarSign size={18} className="field-icon" />
            <input
              type="number"
              name="minPrice"
              placeholder="Min Price"
              value={query.minPrice}
              onChange={handleChange}
              className="search-input"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              name="maxPrice"
              placeholder="Max Price"
              value={query.maxPrice}
              onChange={handleChange}
              className="search-input"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            type="button"
            className={`filter-toggle ${showAdvanced ? "active" : ""}`}
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter size={18} />
            Filters
            {(query.bedrooms || query.bathrooms || query.propertyType || query.amenities.length > 0) && (
              <span className="filter-count">
                {[query.bedrooms, query.bathrooms, query.propertyType, ...query.amenities].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Search Button */}
          <Link to={buildSearchUrl()} className="search-btn">
            <Search size={20} />
            <span>Search</span>
          </Link>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="advanced-filters">
          <div className="filters-header">
            <h3>Advanced Filters</h3>
            <div className="filter-actions">
              <button onClick={clearFilters} className="clear-btn">
                <X size={16} />
                Clear All
              </button>
              <button onClick={() => setShowAdvanced(false)} className="close-btn">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="filters-content">
            {/* Bedrooms & Bathrooms */}
            <div className="filter-group">
              <label>Bedrooms & Bathrooms</label>
              <div className="room-selectors">
                <div className="room-field">
                  <Bed size={16} />
                  <select name="bedrooms" value={query.bedrooms} onChange={handleChange}>
                    <option value="">Any beds</option>
                    <option value="1">1+ bed</option>
                    <option value="2">2+ beds</option>
                    <option value="3">3+ beds</option>
                    <option value="4">4+ beds</option>
                    <option value="5">5+ beds</option>
                  </select>
                </div>
                <div className="room-field">
                  <Bath size={16} />
                  <select name="bathrooms" value={query.bathrooms} onChange={handleChange}>
                    <option value="">Any baths</option>
                    <option value="1">1+ bath</option>
                    <option value="2">2+ baths</option>
                    <option value="3">3+ baths</option>
                    <option value="4">4+ baths</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Property Type */}
            <div className="filter-group">
              <label>Property Type</label>
              <div className="property-types">
                {propertyTypes.map((type) => (
                  <button
                    key={type.value}
                    className={`property-type-btn ${query.propertyType === type.value ? "active" : ""}`}
                    onClick={() =>
                      setQuery((prev) => ({
                        ...prev,
                        propertyType: prev.propertyType === type.value ? "" : type.value,
                      }))
                    }
                  >
                    <span className="type-icon">{type.icon}</span>
                    <span>{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="filter-group">
              <label>Amenities</label>
              <div className="amenities-grid">
                {amenities.map((amenity) => (
                  <button
                    key={amenity.value}
                    className={`amenity-btn ${query.amenities.includes(amenity.value) ? "active" : ""}`}
                    onClick={() => handleAmenityToggle(amenity.value)}
                  >
                    {typeof amenity.icon === "string" ? (
                      <span className="amenity-emoji">{amenity.icon}</span>
                    ) : (
                      <amenity.icon size={16} />
                    )}
                    <span>{amenity.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="filters-footer">
            <Link to={buildSearchUrl()} className="apply-filters-btn">
              <Search size={18} />
              Apply Filters & Search
            </Link>
          </div>
        </div>
      )}

      {/* Active Filters Tags */}
      {(query.city ||
        query.minPrice ||
        query.maxPrice ||
        query.bedrooms ||
        query.bathrooms ||
        query.propertyType ||
        query.amenities.length > 0) && (
        <div className="active-filters">
          {query.city && (
            <span className="filter-tag">
              <MapPin size={14} />
              {query.city}
              <button onClick={() => setQuery((prev) => ({ ...prev, city: "" }))}>
                <X size={12} />
              </button>
            </span>
          )}
          {(query.minPrice || query.maxPrice) && (
            <span className="filter-tag">
              <DollarSign size={14} />
              {query.minPrice && `$${query.minPrice}`}
              {query.minPrice && query.maxPrice && " - "}
              {query.maxPrice && `$${query.maxPrice}`}
              <button onClick={() => setQuery((prev) => ({ ...prev, minPrice: "", maxPrice: "" }))}>
                <X size={12} />
              </button>
            </span>
          )}
          {query.bedrooms && (
            <span className="filter-tag">
              <Bed size={14} />
              {query.bedrooms}+ beds
              <button onClick={() => setQuery((prev) => ({ ...prev, bedrooms: "" }))}>
                <X size={12} />
              </button>
            </span>
          )}
          {query.bathrooms && (
            <span className="filter-tag">
              <Bath size={14} />
              {query.bathrooms}+ baths
              <button onClick={() => setQuery((prev) => ({ ...prev, bathrooms: "" }))}>
                <X size={12} />
              </button>
            </span>
          )}
          {query.propertyType && (
            <span className="filter-tag">
              <Home size={14} />
              {propertyTypes.find((t) => t.value === query.propertyType)?.label}
              <button onClick={() => setQuery((prev) => ({ ...prev, propertyType: "" }))}>
                <X size={12} />
              </button>
            </span>
          )}
          {query.amenities.map((amenity) => (
            <span key={amenity} className="filter-tag">
              <Star size={14} />
              {amenities.find((a) => a.value === amenity)?.label}
              <button onClick={() => handleAmenityToggle(amenity)}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
