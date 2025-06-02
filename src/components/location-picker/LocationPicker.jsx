"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import "./location-picker.scss"
import { Search, MapPin, X, Layers, Navigation, Crosshair, Info } from "lucide-react"

// Replace with your actual Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoic2FsYWgwNSIsImEiOiJjbWJjcWxpNnYxcG42MmxzNnRwZ3VpdnF6In0.IBK4dh0Q9ybfobOwkY9aww"

function LocationPicker({ onLocationSelect, initialLocation = null, initialAddress = "" }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const marker = useRef(null)
  const geocoder = useRef(null)

  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedLocation, setSelectedLocation] = useState(initialLocation || null)
  const [address, setAddress] = useState(initialAddress || "")
  const [isSearching, setIsSearching] = useState(false)
  const [mapStyle, setMapStyle] = useState("streets-v12")
  const [showTooltip, setShowTooltip] = useState(false)

  // Default center (London)
  const defaultCenter = [-0.1278, 51.5074]
  const defaultZoom = 13

  // Initialize map
  useEffect(() => {
    if (map.current) return // Initialize map only once

    try {
      // Use initial location or default
      const center = initialLocation
        ? [Number(initialLocation.longitude), Number(initialLocation.latitude)]
        : defaultCenter

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: `mapbox://styles/mapbox/${mapStyle}`,
        center: center,
        zoom: defaultZoom,
        attributionControl: false,
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")
      map.current.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
          showUserHeading: true,
        }),
        "top-right",
      )

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")

      // Set up marker if initial location exists
      if (initialLocation) {
        const lngLat = [Number(initialLocation.longitude), Number(initialLocation.latitude)]
        addMarker(lngLat)
        setSelectedLocation({
          latitude: lngLat[1],
          longitude: lngLat[0],
        })
      }

      // Map click handler
      map.current.on("click", (e) => {
        const lngLat = [e.lngLat.lng, e.lngLat.lat]
        addMarker(lngLat)
        setSelectedLocation({
          latitude: lngLat[1],
          longitude: lngLat[0],
        })

        // Get address from coordinates (reverse geocoding)
        reverseGeocode(lngLat)

        // Notify parent component
        onLocationSelect({
          latitude: lngLat[1],
          longitude: lngLat[0],
          address: address,
        })
      })

      // Set map loaded state when ready
      map.current.on("load", () => {
        setMapLoaded(true)

        // Show tooltip after map loads
        setTimeout(() => {
          setShowTooltip(true)

          // Hide tooltip after 5 seconds
          setTimeout(() => {
            setShowTooltip(false)
          }, 5000)
        }, 1000)
      })
    } catch (error) {
      console.error("Error initializing map:", error)
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map style when changed
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`)
    }
  }, [mapStyle, mapLoaded])

  // Add or update marker
  const addMarker = (lngLat) => {
    // Remove existing marker if any
    if (marker.current) {
      marker.current.remove()
    }

    // Create marker element
    const el = document.createElement("div")
    el.className = "location-marker"

    // Create pulse animation element
    const pulse = document.createElement("div")
    pulse.className = "pulse"
    el.appendChild(pulse)

    // Create pin element
    const pin = document.createElement("div")
    pin.className = "pin"
    el.appendChild(pin)

    // Create new marker
    marker.current = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat(lngLat)
      .addTo(map.current)

    // Handle marker drag end
    marker.current.on("dragend", () => {
      const lngLat = marker.current.getLngLat()
      setSelectedLocation({
        latitude: lngLat.lat,
        longitude: lngLat.lng,
      })

      // Get address from coordinates
      reverseGeocode([lngLat.lng, lngLat.lat])

      // Notify parent component
      onLocationSelect({
        latitude: lngLat.lat,
        longitude: lngLat.lng,
        address: address,
      })
    })
  }

  // Search for locations using Mapbox Geocoding API
  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`
      const params = new URLSearchParams({
        access_token: mapboxgl.accessToken,
        limit: 5,
        types: "address,place,neighborhood,locality,district",
      })

      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()

      if (data.features) {
        setSearchResults(data.features)
      }
    } catch (error) {
      console.error("Error searching for location:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Reverse geocode to get address from coordinates
  const reverseGeocode = async (lngLat) => {
    try {
      const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat[0]},${lngLat[1]}.json`
      const params = new URLSearchParams({
        access_token: mapboxgl.accessToken,
        limit: 1,
      })

      const response = await fetch(`${endpoint}?${params}`)
      const data = await response.json()

      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        setAddress(feature.place_name)

        // Notify parent component with updated address
        onLocationSelect({
          latitude: lngLat[1],
          longitude: lngLat[0],
          address: feature.place_name,
        })
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error)
    }
  }

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)

    // Debounce search requests
    if (geocoder.current) {
      clearTimeout(geocoder.current)
    }

    geocoder.current = setTimeout(() => {
      searchLocation(query)
    }, 300)
  }

  // Handle search result selection
  const handleResultSelect = (result) => {
    const coordinates = result.center

    // Fly to location
    map.current.flyTo({
      center: coordinates,
      zoom: 15,
      essential: true,
    })

    // Add marker
    addMarker(coordinates)

    // Update state
    setSelectedLocation({
      latitude: coordinates[1],
      longitude: coordinates[0],
    })
    setAddress(result.place_name)
    setSearchResults([])
    setSearchQuery("")

    // Notify parent component
    onLocationSelect({
      latitude: coordinates[1],
      longitude: coordinates[0],
      address: result.place_name,
    })
  }

  // Clear search and results
  const clearSearch = () => {
    setSearchQuery("")
    setSearchResults([])
  }

  // Center map on current location
  const centerOnCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          // Fly to location
          map.current.flyTo({
            center: [longitude, latitude],
            zoom: 15,
            essential: true,
          })

          // Add marker
          addMarker([longitude, latitude])

          // Update state
          setSelectedLocation({
            latitude,
            longitude,
          })

          // Get address from coordinates
          reverseGeocode([longitude, latitude])
        },
        (error) => {
          console.error("Error getting current location:", error)
        },
      )
    }
  }

  // Reset map view
  const resetMapView = () => {
    if (selectedLocation) {
      map.current.flyTo({
        center: [selectedLocation.longitude, selectedLocation.latitude],
        zoom: 15,
        essential: true,
      })
    } else {
      map.current.flyTo({
        center: defaultCenter,
        zoom: defaultZoom,
        essential: true,
      })
    }
  }

  // Toggle map style
  const toggleMapStyle = () => {
    const styles = ["streets-v12", "satellite-streets-v12", "light-v11", "dark-v11"]
    const currentIndex = styles.indexOf(mapStyle)
    const nextIndex = (currentIndex + 1) % styles.length
    setMapStyle(styles[nextIndex])
  }

  return (
    <div className="location-picker">
      <div className="map-container">
        <div ref={mapContainer} className="map" />

        {/* Search Bar */}
        <div className="search-container">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search for a location..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button className="clear-search" onClick={clearSearch}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((result) => (
                <div key={result.id} className="search-result-item" onClick={() => handleResultSelect(result)}>
                  <MapPin size={16} />
                  <span>{result.place_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Controls */}
        <div className="map-controls">
          <button className="map-control-btn" onClick={toggleMapStyle} title="Change map style">
            <Layers size={18} />
          </button>
          <button className="map-control-btn" onClick={centerOnCurrentLocation} title="Use my location">
            <Navigation size={18} />
          </button>
          <button className="map-control-btn" onClick={resetMapView} title="Reset view">
            <Crosshair size={18} />
          </button>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="selected-location">
            <div className="location-header">
              <MapPin size={16} />
              <h4>Selected Location</h4>
            </div>
            <div className="location-details">
              <p className="location-address">{address || "Address not available"}</p>
              <div className="coordinates">
                <span>Lat: {selectedLocation.latitude.toFixed(6)}</span>
                <span>Lng: {selectedLocation.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tooltip */}
        {showTooltip && (
          <div className="map-tooltip">
            <Info size={16} />
            <span>Click on the map to set a location or search for an address</span>
          </div>
        )}

        {/* Loading Overlay */}
        {!mapLoaded && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Loading map...</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LocationPicker
