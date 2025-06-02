"use client"

import { useEffect, useRef, useState } from "react"
import "./map.scss"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Navigation, Layers, Maximize2 } from "lucide-react"

// Replace with your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoic2FsYWgwNSIsImEiOiJjbWJjcWxpNnYxcG42MmxzNnRwZ3VpdnF6In0.IBK4dh0Q9ybfobOwkY9aww"

function Map({ items, userLocation }) {
  const [mapError, setMapError] = useState(false)
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v12")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [userMarker, setUserMarker] = useState(null)

  const mapStyles = [
    { id: "streets-v12", name: "Streets", url: "mapbox://styles/mapbox/streets-v12" },
    { id: "satellite-v9", name: "Satellite", url: "mapbox://styles/mapbox/satellite-v9" },
    { id: "light-v11", name: "Light", url: "mapbox://styles/mapbox/light-v11" },
    { id: "dark-v11", name: "Dark", url: "mapbox://styles/mapbox/dark-v11" },
  ]

  // Simple map placeholder component
  const MapPlaceholder = () => (
    <div className="map-placeholder">
      <div className="map-placeholder-content">
        <span className="map-icon">🗺️</span>
        <h3>Map View</h3>
        <p>Interactive map will be displayed here</p>
        {items && items.length > 0 && (
          <div className="map-properties">
            <p>{items.length} properties in this area</p>
          </div>
        )}
      </div>
    </div>
  )

  useEffect(() => {
    if (map.current) return // Initialize map only once

    // Determine initial center and zoom
    let center, zoom

    if (userLocation) {
      center = [userLocation.longitude, userLocation.latitude]
      zoom = 12
    } else if (items.length === 1) {
      center = [items[0].longitude, items[0].latitude]
      zoom = 14
    } else {
      center = [-1.90269, 52.4797] // Default center (UK)
      zoom = 7
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: center,
        zoom: zoom,
        attributionControl: false,
      })

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), "top-right")

      // Add user location marker if available
      if (userLocation) {
        const userLocationEl = document.createElement("div")
        userLocationEl.className = "user-location-marker"
        userLocationEl.innerHTML = `
          <div class="user-marker-inner">
            <div class="user-marker-dot"></div>
            <div class="user-marker-pulse"></div>
          </div>
        `

        const userLocationMarker = new mapboxgl.Marker(userLocationEl)
          .setLngLat([userLocation.longitude, userLocation.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="user-location-popup">
                <div class="popup-header">
                  <div class="location-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                  <h3>Your Location</h3>
                </div>
                <p>Properties near you</p>
              </div>
            `),
          )
          .addTo(map.current)

        setUserMarker(userLocationMarker)
      }

      // Add property markers
      const bounds = new mapboxgl.LngLatBounds()

      // Include user location in bounds if available
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude])
      }

      items.forEach((item, index) => {
        // Create custom marker element
        const el = document.createElement("div")
        el.className = "custom-property-marker"

        // Calculate distance from user if location is available
        let distance = ""
        if (userLocation) {
          const dist = calculateDistance(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude)
          distance = dist < 1 ? `${Math.round(dist * 1000)}m` : `${dist.toFixed(1)}km`
        }

        el.innerHTML = `
          <div class="marker-content">
            <div class="marker-price">$${formatPrice(item.price)}</div>
            ${distance ? `<div class="marker-distance">${distance}</div>` : ""}
            <div class="marker-arrow"></div>
          </div>
        `

        // Add click handler for marker
        el.addEventListener("click", () => {
          // Zoom to property
          map.current.flyTo({
            center: [item.longitude, item.latitude],
            zoom: 16,
            duration: 1000,
          })
        })

        // Create popup content
        const popupContent = `
          <div class="property-popup">
            <div class="popup-image">
              <img src="${item.images?.[0] || "https://via.placeholder.com/200x120?text=Property"}" alt="${item.title}" onError={handleImageError} />
              <div class="popup-badge ${item.type}">${item.type === "rent" ? "For Rent" : "For Sale"}</div>
            </div>
            <div class="popup-content">
              <h3>${item.title}</h3>
              <div class="popup-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                ${item.address}
              </div>
              <div class="popup-features">
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg> ${item.bedroom} beds</span>
                <span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.683 3 4 3.683 4 4.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"></path></svg> ${item.bathroom} baths</span>
              </div>
              <div class="popup-price">$${item.price.toLocaleString()}${item.type === "rent" ? "/month" : ""}</div>
              ${distance ? `<div class="popup-distance">${distance} away</div>` : ""}
              <a href="/${item.id}" class="popup-link">View Details</a>
            </div>
          </div>
        `

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat([item.longitude, item.latitude])
          .setPopup(
            new mapboxgl.Popup({
              offset: 25,
              className: "property-popup-container",
            }).setHTML(popupContent),
          )
          .addTo(map.current)

        // Extend bounds to include this point
        bounds.extend([item.longitude, item.latitude])
      })

      // Fit map to bounds if multiple properties or user location
      if (items.length > 1 || userLocation) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        })
      }
    } catch (error) {
      console.error("Map initialization error:", error)
      setMapError(true)
    }

    // Clean up on unmount
    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [items, userLocation])

  // Update map style when changed
  useEffect(() => {
    if (map.current) {
      map.current.setStyle(mapStyle)
    }
  }, [mapStyle])

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`
    }
    return price.toLocaleString()
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const centerOnUser = () => {
    if (userLocation && map.current) {
      map.current.flyTo({
        center: [userLocation.longitude, userLocation.latitude],
        zoom: 14,
        duration: 1000,
      })
    }
  }

  return (
    <div className={`modern-map-container ${isFullscreen ? "fullscreen" : ""}`}>
      {/* Map Controls */}
      <div className="map-controls">
        {/* Style Selector */}
        <div className="style-selector">
          <button className="control-btn">
            <Layers size={18} />
          </button>
          <div className="style-dropdown">
            {mapStyles.map((style) => (
              <button
                key={style.id}
                className={`style-option ${mapStyle === style.url ? "active" : ""}`}
                onClick={() => setMapStyle(style.url)}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>

        {/* User Location Button */}
        {userLocation && (
          <button className="control-btn location-btn" onClick={centerOnUser}>
            <Navigation size={18} />
          </button>
        )}

        {/* Fullscreen Toggle */}
        <button className="control-btn" onClick={() => setIsFullscreen(!isFullscreen)}>
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Map Container */}
      {mapError ? <MapPlaceholder /> : <div ref={mapContainer} className="mapbox-container" />}

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-marker property-marker"></div>
          <span>Properties</span>
        </div>
        {userLocation && (
          <div className="legend-item">
            <div className="legend-marker user-marker"></div>
            <span>Your Location</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default Map
