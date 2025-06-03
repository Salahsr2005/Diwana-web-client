"use client"

import { useState, useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { icon } from "leaflet"
import "./location-picker.scss"
import { Search, MapPin, Navigation, Target, X, Loader } from "lucide-react"

// Fix for default markers
const ICON = icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const USER_ICON = icon({
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

function LocationMarker({ position, onLocationSelect, draggable = true }) {
  const [markerPosition, setMarkerPosition] = useState(position)

  useEffect(() => {
    setMarkerPosition(position)
  }, [position])

  const eventHandlers = {
    dragend(e) {
      const marker = e.target
      const newPosition = marker.getLatLng()
      const newPos = [newPosition.lat, newPosition.lng]
      setMarkerPosition(newPos)

      // Reverse geocode to get address
      reverseGeocode(newPosition.lat, newPosition.lng).then((address) => {
        onLocationSelect({
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          address: address || `${newPosition.lat.toFixed(6)}, ${newPosition.lng.toFixed(6)}`,
        })
      })
    },
  }

  useMapEvents({
    click(e) {
      const newPosition = [e.latlng.lat, e.latlng.lng]
      setMarkerPosition(newPosition)

      // Reverse geocode to get address
      reverseGeocode(e.latlng.lat, e.latlng.lng).then((address) => {
        onLocationSelect({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
          address: address || `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`,
        })
      })
    },
  })

  return markerPosition ? (
    <Marker position={markerPosition} icon={ICON} draggable={draggable} eventHandlers={eventHandlers} />
  ) : null
}

function UserLocationMarker({ position }) {
  return position ? <Marker position={position} icon={USER_ICON} /> : null
}

// Reverse geocoding function
const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
    )
    const data = await response.json()
    return data.display_name || null
  } catch (error) {
    console.error("Reverse geocoding error:", error)
    return null
  }
}

function LocationPicker({ onLocationSelect, initialLocation, initialAddress, className = "" }) {
  const [selectedLocation, setSelectedLocation] = useState(
    initialLocation ? [initialLocation.latitude, initialLocation.longitude] : null,
  )
  const [userLocation, setUserLocation] = useState(null)
  const [searchQuery, setSearchQuery] = useState(initialAddress || "")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [mapCenter, setMapCenter] = useState([40.7128, -74.006]) // Default to NYC
  const [mapZoom, setMapZoom] = useState(13)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [mapKey, setMapKey] = useState(0) // Force map re-render
  const searchTimeoutRef = useRef(null)

  // Get user's current location
  const getCurrentLocation = () => {
    setIsGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = [position.coords.latitude, position.coords.longitude]
          setUserLocation(userPos)
          setMapCenter(userPos)
          setMapZoom(15)
          setMapKey((prev) => prev + 1) // Force map re-render
          setIsGettingLocation(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setIsGettingLocation(false)
          alert("Unable to get your location. Please search for an address or click on the map.")
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
      )
    } else {
      setIsGettingLocation(false)
      alert("Geolocation is not supported by this browser.")
    }
  }

  // Search for locations using Nominatim API
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&limit=5&addressdetails=1`,
      )
      const data = await response.json()

      const results = data.map((item) => ({
        id: item.place_id,
        display_name: item.display_name,
        lat: Number.parseFloat(item.lat),
        lon: Number.parseFloat(item.lon),
        address: item.display_name,
      }))

      setSearchResults(results)
      setShowSearchResults(true)
    } catch (error) {
      console.error("Search error:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(value)
    }, 500)
  }

  // Handle search result selection
  const handleSearchResultSelect = (result) => {
    const newLocation = [result.lat, result.lon]
    setSelectedLocation(newLocation)
    setMapCenter(newLocation)
    setMapZoom(16)
    setSearchQuery(result.display_name)
    setShowSearchResults(false)
    setMapKey((prev) => prev + 1) // Force map re-render

    onLocationSelect({
      latitude: result.lat,
      longitude: result.lon,
      address: result.display_name,
    })
  }

  // Handle location selection from map
  const handleLocationSelect = (location) => {
    setSelectedLocation([location.latitude, location.longitude])
    setSearchQuery(location.address)
    onLocationSelect(location)
  }

  // Clear search and selection
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
    setSelectedLocation(null)
    onLocationSelect(null)
  }

  // Initialize map center based on initial location
  useEffect(() => {
    if (initialLocation) {
      setMapCenter([initialLocation.latitude, initialLocation.longitude])
      setMapZoom(16)
      setMapKey((prev) => prev + 1) // Force map re-render
    }
  }, [initialLocation])

  return (
    <div className={`location-picker ${className}`}>
      <div className="location-picker-header">
        <h3>📍 Select Property Location</h3>
        <p>Search for an address or click on the map to set the exact location</p>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search for an address, city, or landmark..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button onClick={clearSearch} className="clear-search-btn">
              <X size={16} />
            </button>
          )}
          {isSearching && (
            <div className="search-loading-icon">
              <Loader size={16} className="spin" />
            </div>
          )}
        </div>

        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="get-location-btn"
          title="Use my current location"
        >
          {isGettingLocation ? <Loader size={16} className="spin" /> : <Navigation size={16} />}
          <span>{isGettingLocation ? "Getting location..." : "Use my location"}</span>
        </button>

        {/* Search Results */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="search-results">
            {searchResults.map((result) => (
              <button key={result.id} onClick={() => handleSearchResultSelect(result)} className="search-result-item">
                <MapPin size={16} />
                <span>{result.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {showSearchResults && searchResults.length === 0 && !isSearching && searchQuery.length > 2 && (
          <div className="no-results">
            <p>No results found for {searchQuery}</p>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div className="map-container">
        <MapContainer key={mapKey} center={mapCenter} zoom={mapZoom} scrollWheelZoom={true} className="location-map">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* User Location Marker */}
          <UserLocationMarker position={userLocation} />

          {/* Selected Location Marker */}
          <LocationMarker position={selectedLocation} onLocationSelect={handleLocationSelect} draggable={true} />
        </MapContainer>

        {/* Map Instructions */}
        <div className="map-instructions">
          <div className="instruction-item">
            <Target size={16} />
            <span>Click on the map to set location</span>
          </div>
          <div className="instruction-item">
            <span>🔵</span>
            <span>Your current location</span>
          </div>
          <div className="instruction-item">
            <span>📍</span>
            <span>Selected property location (draggable)</span>
          </div>
        </div>
      </div>

      {/* Selected Location Info */}
      {selectedLocation && (
        <div className="selected-location-info">
          <h4>📍 Selected Location</h4>
          <div className="location-details">
            <div className="coordinate">
              <strong>Latitude:</strong> {selectedLocation[0].toFixed(6)}
            </div>
            <div className="coordinate">
              <strong>Longitude:</strong> {selectedLocation[1].toFixed(6)}
            </div>
            {searchQuery && (
              <div className="address">
                <strong>Address:</strong> {searchQuery}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationPicker
