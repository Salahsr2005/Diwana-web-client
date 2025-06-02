"use client"

import { handleImageError } from "../../lib/placeholderUtils"
// import { useEffect, useRef, useState } from "react" // Removed as not used in merged code
import "./property-map.scss"
// import mapboxgl from "mapbox-gl" // Removed as not used in merged code
// import "mapbox-gl/dist/mapbox-gl.css" // Removed as not used in merged code
import {
  Maximize2,
  Minimize2,
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
  AlertCircle,
  Loader,
} from "lucide-react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { icon } from "leaflet"
import { useState, useEffect } from "react"
import Pin from "../pin/Pin"

// Fix for default markers
const ICON = icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

// Replace with your Mapbox access token
// mapboxgl.accessToken = "pk.eyJ1Ijoic2FsYWgwNSIsImEiOiJjbWJjcWxpNnYxcG42MmxzNnRwZ3VpdnF6In0.IBK4dh0Q9ybfobOwkY9aww" // Removed as not used in merged code

const PropertyMap = ({
  items,
  properties = [],
  userLocation,
  selectedProperty,
  onPropertySelect,
  onBoundsChange,
  onMapLoaded,
}) => {
  // const mapContainer = useRef(null) // Removed as not used in merged code
  // const map = useRef(null) // Removed as not used in merged code
  // const markersRef = useRef({}) // Removed as not used in merged code
  // const popupsRef = useRef({}) // Removed as not used in merged code
  // const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/streets-v12") // Removed as not used in merged code
  const [isFullscreen, setIsFullscreen] = useState(false)
  // const [showStyleSelector, setShowStyleSelector] = useState(false) // Removed as not used in merged code
  const [activePropertyCard, setActivePropertyCard] = useState(null)
  const [showOwnerModal, setShowOwnerModal] = useState(false)
  const [selectedOwner, setSelectedOwner] = useState(null)
  // const [mapLoaded, setMapLoaded] = useState(false) // Removed as not used in merged code
  const [hoveredProperty, setHoveredProperty] = useState(null)
  const [propertyTooltip, setPropertyTooltip] = useState({ show: false, x: 0, y: 0, property: null })
  const [mapError, setMapError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [validItems, setValidItems] = useState([])
  const [mapReady, setMapReady] = useState(false)

  // const mapStyles = [ // Removed as not used in merged code
  //   { id: "streets-v12", name: "Streets", url: "mapbox://styles/mapbox/streets-v12" }, // Removed as not used in merged code
  //   { id: "satellite-v9", name: "Satellite", url: "mapbox://styles/mapbox/satellite-v9" }, // Removed as not used in merged code
  //   { id: "light-v11", name: "Light", url: "mapbox://styles/mapbox/light-v11" }, // Removed as not used in merged code
  //   { id: "dark-v11", name: "Dark", url: "mapbox://styles/mapbox/dark-v11" }, // Removed as not used in merged code
  // ] // Removed as not used in merged code

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

  // Initialize map
  // useEffect(() => { // Removed as not used in merged code
  //   if (map.current) return // Removed as not used in merged code

  //   let center = [-1.90269, 52.4797] // Default center (UK) // Removed as not used in merged code
  //   let zoom = 7 // Removed as not used in merged code

  //   // Only use user location if valid coordinates exist // Removed as not used in merged code
  //   if (userLocation && isValidCoordinate(userLocation.latitude, userLocation.longitude)) { // Removed as not used in merged code
  //     center = [userLocation.longitude, userLocation.latitude] // Removed as not used in merged code
  //     zoom = 12 // Removed as not used in merged code
  //   } // Removed as not used in merged code
  //   // Otherwise check if we have a valid property to center on // Removed as not used in merged code
  //   else if (properties.length > 0) { // Removed as not used in merged code
  //     const validProperty = properties.find((p) => isValidCoordinate(p.latitude, p.longitude)) // Removed as not used in merged code

  //     if (validProperty) { // Removed as not used in merged code
  //       center = [validProperty.longitude, validProperty.latitude] // Removed as not used in merged code
  //       zoom = 14 // Removed as not used in merged code
  //     } // Removed as not used in merged code
  //   } // Removed as not used in merged code

  //   try { // Removed as not used in merged code
  //     map.current = new mapboxgl.Map({ // Removed as not used in merged code
  //       container: mapContainer.current, // Removed as not used in merged code
  //       style: mapStyle, // Removed as not used in merged code
  //       center: center, // Removed as not used in merged code
  //       zoom: zoom, // Removed as not used in merged code
  //       attributionControl: false, // Removed as not used in merged code
  //     }) // Removed as not used in merged code

  //     // Add controls // Removed as not used in merged code
  //     map.current.addControl(new mapboxgl.NavigationControl(), "top-right") // Removed as not used in merged code
  //     map.current.addControl(new mapboxgl.FullscreenControl(), "top-right") // Removed as not used in merged code

  //     const geolocate = new mapboxgl.GeolocateControl({ // Removed as not used in merged code
  //       positionOptions: { enableHighAccuracy: true }, // Removed as not used in merged code
  //       trackUserLocation: true, // Removed as not used in merged code
  //       showUserHeading: true, // Removed as not used in merged code
  //     }) // Removed as not used in merged code
  //     map.current.addControl(geolocate, "top-right") // Removed as not used in merged code

  //     // Map load event // Removed as not used in merged code
  //     map.current.on("load", () => { // Removed as not used in merged code
  //       setMapLoaded(true) // Removed as not used in merged code
  //       onMapLoaded && onMapLoaded() // Removed as not used in merged code

  //       // Add property markers source // Removed as not used in merged code
  //       map.current.addSource("properties", { // Removed as not used in merged code
  //         type: "geojson", // Removed as not used in merged code
  //         data: { // Removed as not used in merged code
  //           type: "FeatureCollection", // Removed as not used in merged code
  //           features: [], // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //         cluster: true, // Removed as not used in merged code
  //         clusterMaxZoom: 14, // Removed as not used in merged code
  //         clusterRadius: 50, // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Add cluster layers // Removed as not used in merged code
  //       map.current.addLayer({ // Removed as not used in merged code
  //         id: "clusters", // Removed as not used in merged code
  //         type: "circle", // Removed as not used in merged code
  //         source: "properties", // Removed as not used in merged code
  //         filter: ["has", "point_count"], // Removed as not used in merged code
  //         paint: { // Removed as not used in merged code
  //           "circle-color": ["step", ["get", "point_count"], "#3B82F6", 10, "#F59E0B", 30, "#EF4444"], // Removed as not used in merged code
  //           "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40], // Removed as not used in merged code
  //           "circle-stroke-width": 2, // Removed as not used in merged code
  //           "circle-stroke-color": "#ffffff", // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       map.current.addLayer({ // Removed as not used in merged code
  //         id: "cluster-count", // Removed as not used in merged code
  //         type: "symbol", // Removed as not used in merged code
  //         source: "properties", // Removed as not used in merged code
  //         filter: ["has", "point_count"], // Removed as not used in merged code
  //         layout: { // Removed as not used in merged code
  //           "text-field": "{point_count_abbreviated}", // Removed as not used in merged code
  //           "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], // Removed as not used in merged code
  //           "text-size": 12, // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //         paint: { // Removed as not used in merged code
  //           "text-color": "#ffffff", // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Add unclustered point layer // Removed as not used in merged code
  //       map.current.addLayer({ // Removed as not used in merged code
  //         id: "unclustered-point", // Removed as not used in merged code
  //         type: "circle", // Removed as not used in merged code
  //         source: "properties", // Removed as not used in merged code
  //         filter: ["!", ["has", "point_count"]], // Removed as not used in merged code
  //         paint: { // Removed as not used in merged code
  //           "circle-color": ["case", ["==", ["get", "type"], "rent"], "#10B981", "#3B82F6"], // Removed as not used in merged code
  //           "circle-radius": ["case", ["boolean", ["feature-state", "hover"], false], 12, 8], // Removed as not used in merged code
  //           "circle-stroke-width": 2, // Removed as not used in merged code
  //           "circle-stroke-color": "#ffffff", // Removed as not used in merged code
  //           "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.8], // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Add property price labels // Removed as not used in merged code
  //       map.current.addLayer({ // Removed as not used in merged code
  //         id: "property-labels", // Removed as not used in merged code
  //         type: "symbol", // Removed as not used in merged code
  //         source: "properties", // Removed as not used in merged code
  //         filter: ["!", ["has", "point_count"]], // Removed as not used in merged code
  //         layout: { // Removed as not used in merged code
  //           "text-field": ["concat", "$", ["get", "priceFormatted"]], // Removed as not used in merged code
  //           "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], // Removed as not used in merged code
  //           "text-size": 10, // Removed as not used in merged code
  //           "text-offset": [0, -2], // Removed as not used in merged code
  //           "text-anchor": "bottom", // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //         paint: { // Removed as not used in merged code
  //           "text-color": "#1F2937", // Removed as not used in merged code
  //           "text-halo-color": "#ffffff", // Removed as not used in merged code
  //           "text-halo-width": 1, // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Click events // Removed as not used in merged code
  //       map.current.on("click", "clusters", (e) => { // Removed as not used in merged code
  //         const features = map.current.queryRenderedFeatures(e.point, { // Removed as not used in merged code
  //           layers: ["clusters"], // Removed as not used in merged code
  //         }) // Removed as not used in merged code
  //         const clusterId = features[0].properties.cluster_id // Removed as not used in merged code
  //         map.current.getSource("properties").getClusterExpansionZoom(clusterId, (err, zoom) => { // Removed as not used in merged code
  //           if (err) return // Removed as not used in merged code
  //           map.current.easeTo({ // Removed as not used in merged code
  //             center: features[0].geometry.coordinates, // Removed as not used in merged code
  //             zoom: zoom, // Removed as not used in merged code
  //           }) // Removed as not used in merged code
  //         }) // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       map.current.on("click", "unclustered-point", (e) => { // Removed as not used in merged code
  //         const property = JSON.parse(e.features[0].properties.data) // Removed as not used in merged code
  //         const coordinates = e.features[0].geometry.coordinates.slice() // Removed as not used in merged code

  //         setActivePropertyCard(property) // Removed as not used in merged code

  //         while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) { // Removed as not used in merged code
  //           coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360 // Removed as not used in merged code
  //         } // Removed as not used in merged code

  //         map.current.flyTo({ // Removed as not used in merged code
  //           center: coordinates, // Removed as not used in merged code
  //           zoom: 15, // Removed as not used in merged code
  //         }) // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Hover events for property details // Removed as not used in merged code
  //       map.current.on("mouseenter", "unclustered-point", (e) => { // Removed as not used in merged code
  //         map.current.getCanvas().style.cursor = "pointer" // Removed as not used in merged code

  //         const property = JSON.parse(e.features[0].properties.data) // Removed as not used in merged code
  //         const coordinates = e.point // Removed as not used in merged code

  //         setPropertyTooltip({ // Removed as not used in merged code
  //           show: true, // Removed as not used in merged code
  //           x: coordinates.x, // Removed as not used in merged code
  //           y: coordinates.y, // Removed as not used in merged code
  //           property: property, // Removed as not used in merged code
  //         }) // Removed as not used in merged code

  //         // Update feature state for hover effect // Removed as not used in merged code
  //         if (hoveredProperty) { // Removed as not used in merged code
  //           map.current.setFeatureState({ source: "properties", id: hoveredProperty }, { hover: false }) // Removed as not used in merged code
  //         } // Removed as not used in merged code

  //         setHoveredProperty(e.features[0].id) // Removed as not used in merged code
  //         map.current.setFeatureState({ source: "properties", id: e.features[0].id }, { hover: true }) // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       map.current.on("mouseleave", "unclustered-point", () => { // Removed as not used in merged code
  //         map.current.getCanvas().style.cursor = "" // Removed as not used in merged code

  //         setPropertyTooltip({ show: false, x: 0, y: 0, property: null }) // Removed as not used in merged code

  //         if (hoveredProperty) { // Removed as not used in merged code
  //           map.current.setFeatureState({ source: "properties", id: hoveredProperty }, { hover: false }) // Removed as not used in merged code
  //         } // Removed as not used in merged code
  //         setHoveredProperty(null) // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Mouse move for tooltip positioning // Removed as not used in merged code
  //       map.current.on("mousemove", "unclustered-point", (e) => { // Removed as not used in merged code
  //         setPropertyTooltip((prev) => ({ // Removed as not used in merged code
  //           ...prev, // Removed as not used in merged code
  //           x: e.point.x, // Removed as not used in merged code
  //           y: e.point.y, // Removed as not used in merged code
  //         })) // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Bounds change event // Removed as not used in merged code
  //       map.current.on("moveend", () => { // Removed as not used in merged code
  //         const bounds = map.current.getBounds() // Removed as not used in merged code
  //         onBoundsChange && // Removed as not used in merged code
  //           onBoundsChange({ // Removed as not used in merged code
  //             north: bounds.getNorth(), // Removed as not used in merged code
  //             south: bounds.getSouth(), // Removed as not used in merged code
  //             east: bounds.getEast(), // Removed as not used in merged code
  //             west: bounds.getWest(), // Removed as not used in merged code
  //           }) // Removed as not used in merged code
  //       }) // Removed as not used in merged code
  //     }) // Removed as not used in merged code
  //   } catch (error) { // Removed as not used in merged code
  //     console.error("Error initializing map:", error) // Removed as not used in merged code
  //     setMapError(error.message) // Removed as not used in merged code
  //   } // Removed as not used in merged code

  //   return () => { // Removed as not used in merged code
  //     if (map.current) { // Removed as not used in merged code
  //       map.current.remove() // Removed as not used in merged code
  //       map.current = null // Removed as not used in merged code
  //     } // Removed as not used in merged code
  //   } // Removed as not used in merged code
  // }, []) // Removed as not used in merged code

  // Helper function to validate coordinates
  const isValidCoordinate = (lat, lng) => {
    return (
      lat !== null &&
      lng !== null &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      isFinite(lat) &&
      isFinite(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    )
  }

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setMapReady(true)
      if (onMapLoaded) onMapLoaded()
    }, 1000)

    return () => clearTimeout(timer)
  }, [onMapLoaded])

  const handlePropertyClick = (property) => {
    if (onPropertySelect) {
      onPropertySelect(property)
    }
  }

  // Update properties on map
  // useEffect(() => { // Removed as not used in merged code
  //   if (!map.current || !mapLoaded) return // Removed as not used in merged code

  //   try { // Removed as not used in merged code
  //     // Filter out properties with invalid coordinates // Removed as not used in merged code
  //     const validProperties = properties.filter((property) => isValidCoordinate(property.latitude, property.longitude)) // Removed as not used in merged code

  //     const geojsonData = { // Removed as not used in merged code
  //       type: "FeatureCollection", // Removed as not used in merged code
  //       features: validProperties.map((property, index) => ({ // Removed as not used in merged code
  //         type: "Feature", // Removed as not used in merged code
  //         id: index, // Removed as not used in merged code
  //         properties: { // Removed as not used in merged code
  //           id: property.id, // Removed as not used in merged code
  //           price: property.price, // Removed as not used in merged code
  //           priceFormatted: formatPrice(property.price), // Removed as not used in merged code
  //           type: property.type, // Removed as not used in merged code
  //           data: JSON.stringify(property), // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //         geometry: { // Removed as not used in merged code
  //           type: "Point", // Removed as not used in merged code
  //           coordinates: [property.longitude, property.latitude], // Removed as not used in merged code
  //         }, // Removed as not used in merged code
  //       })), // Removed as not used in merged code
  //     } // Removed as not used in merged code

  //     map.current.getSource("properties").setData(geojsonData) // Removed as not used in merged code

  //     // Fit map to properties if we have valid ones // Removed as not used in merged code
  //     if (validProperties.length > 0) { // Removed as not used in merged code
  //       const bounds = new mapboxgl.LngLatBounds() // Removed as not used in merged code
  //       let hasValidBounds = false // Removed as not used in merged code

  //       validProperties.forEach((property) => { // Removed as not used in merged code
  //         if (isValidCoordinate(property.latitude, property.longitude)) { // Removed as not used in merged code
  //           bounds.extend([property.longitude, property.latitude]) // Removed as not used in merged code
  //           hasValidBounds = true // Removed as not used in merged code
  //         } // Removed as not used in merged code
  //       }) // Removed as not used in merged code

  //       // Add user location to bounds if available and valid // Removed as not used in merged code
  //       if (userLocation && isValidCoordinate(userLocation.latitude, userLocation.longitude)) { // Removed as not used in merged code
  //         bounds.extend([userLocation.longitude, userLocation.latitude]) // Removed as not used in merged code
  //         hasValidBounds = true // Removed as not used in merged code
  //       } // Removed as not used in merged code

  //       if (hasValidBounds && !bounds.isEmpty()) { // Removed as not used in merged code
  //         map.current.fitBounds(bounds, { // Removed as not used in merged code
  //           padding: 50, // Removed as not used in merged code
  //           maxZoom: 15, // Removed as not used in merged code
  //         }) // Removed as not used in merged code
  //       } // Removed as not used in merged code
  //     } // Removed as not used in merged code
  //   } catch (error) { // Removed as not used in merged code
  //     console.error("Error updating properties on map:", error) // Removed as not used in merged code
  //     setMapError(error.message) // Removed as not used in merged code
  //   } // Removed as not used in merged code
  // }, [properties, mapLoaded]) // Removed as not used in merged code

  // Add user location marker
  // useEffect(() => { // Removed as not used in merged code
  //   if (!map.current || !mapLoaded || !userLocation) return // Removed as not used in merged code

  //   // Validate user location coordinates // Removed as not used in merged code
  //   if (!isValidCoordinate(userLocation.latitude, userLocation.longitude)) { // Removed as not used in merged code
  //     console.warn("Invalid user location coordinates:", userLocation) // Removed as not used in merged code
  //     return // Removed as not used in merged code
  //   } // Removed as not used in merged code

  //   try { // Removed as not used in merged code
  //     const existingMarker = markersRef.current["user-location"] // Removed as not used in merged code
  //     if (existingMarker) { // Removed as not used in merged code
  //       existingMarker.remove() // Removed as not used in merged code
  //     } // Removed as not used in merged code

  //     const el = document.createElement("div") // Removed as not used in merged code
  //     el.className = "user-location-marker" // Removed as not used in merged code
  //     el.innerHTML = ` // Removed as not used in merged code
  //       <div class="user-location-dot"> // Removed as not used in merged code
  //         <div class="user-location-pulse"></div> // Removed as not used in merged code
  //       </div> // Removed as not used in merged code
  //     ` // Removed as not used in merged code

  //     const marker = new mapboxgl.Marker(el) // Removed as not used in merged code
  //       .setLngLat([userLocation.longitude, userLocation.latitude]) // Removed as not used in merged code
  //       .addTo(map.current) // Removed as not used in merged code

  //     markersRef.current["user-location"] = marker // Removed as not used in merged code
  //   } catch (error) { // Removed as not used in merged code
  //     console.error("Error adding user location marker:", error) // Removed as not used in merged code
  //   } // Removed as not used in merged code
  // }, [userLocation, mapLoaded]) // Removed as not used in merged code

  // Handle selected property
  // useEffect(() => { // Removed as not used in merged code
  //   if (!map.current || !selectedProperty) return // Removed as not used in merged code

  //   // Validate selected property coordinates // Removed as not used in merged code
  //   if (!isValidCoordinate(selectedProperty.latitude, selectedProperty.longitude)) { // Removed as not used in merged code
  //     console.warn("Invalid selected property coordinates:", selectedProperty) // Removed as not used in merged code
  //     return // Removed as not used in merged code
  //   } // Removed as not used in merged code

  //   try { // Removed as not used in merged code
  //     map.current.flyTo({ // Removed as not used in merged code
  //       center: [selectedProperty.longitude, selectedProperty.latitude], // Removed as not used in merged code
  //       zoom: 16, // Removed as not used in merged code
  //       duration: 1000, // Removed as not used in merged code
  //     }) // Removed as not used in merged code

  //     setActivePropertyCard(selectedProperty) // Removed as not used in merged code
  //   } catch (error) { // Removed as not used in merged code
  //     console.error("Error handling selected property:", error) // Removed as not used in merged code
  //   } // Removed as not used in merged code
  // }, [selectedProperty]) // Removed as not used in merged code

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return "0"

    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M`
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)}K`
    }
    return price.toLocaleString()
  }

  // const handleStyleChange = (styleUrl) => { // Removed as not used in merged code
  //   if (!map.current) return // Removed as not used in merged code

  //   setMapStyle(styleUrl) // Removed as not used in merged code
  //   map.current.setStyle(styleUrl) // Removed as not used in merged code
  //   setShowStyleSelector(false) // Removed as not used in merged code

  //   // Re-add sources and layers after style change // Removed as not used in merged code
  //   map.current.once("styledata", () => { // Removed as not used in merged code
  //     if (map.current.getSource("properties")) return // Removed as not used in merged code

  //     // Re-add property markers source // Removed as not used in merged code
  //     map.current.addSource("properties", { // Removed as not used in merged code
  //       type: "geojson", // Removed as not used in merged code
  //       data: { // Removed as not used in merged code
  //         type: "FeatureCollection", // Removed as not used in merged code
  //         features: [], // Removed as not used in merged code
  //       }, // Removed as not used in merged code
  //       cluster: true, // Removed as not used in merged code
  //       clusterMaxZoom: 14, // Removed as not used in merged code
  //       clusterRadius: 50, // Removed as not used in merged code
  //     }) // Removed as not used in merged code

  //     // Re-add all the layers // Removed as not used in merged code
  //     map.current.addLayer({ // Removed as not used in merged code
  //       id: "clusters", // Removed as not used in merged code
  //       type: "circle", // Removed as not used in merged code
  //       source: "properties", // Removed as not used in merged code
  //       filter: ["has", "point_count"], // Removed as not used in merged code
  //       paint: { // Removed as not used in merged code
  //         "circle-color": ["step", ["get", "point_count"], "#3B82F6", 10, "#F59E0B", 30, "#EF4444"], // Removed as not used in merged code
  //         "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 30, 40], // Removed as not used in merged code
  //         "circle-stroke-width": 2, // Removed as not used in merged code
  //         "circle-stroke-color": "#ffffff", // Removed as not used in merged code
  //       }, // Removed as not used in merged code
  //     }) // Removed as not used in merged code

  //     map.current.addLayer({ // Removed as not used in merged code
  //       id: "cluster-count", // Removed as not used in merged code
  //       type: "symbol", // Removed as not used in merged code
  //       source: "properties", // Removed as not used in merged code
  //       filter: ["has", "point_count"], // Removed as not used in merged code
  //       layout: { // Removed as not used in merged code
  //         "text-field": "{point_count_abbreviated}", // Removed as not used in merged code
  //         "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], // Removed as not used in merged code
  //         "text-size": 12, // Removed as not used in merged code
  //       }, // Removed as not used in merged code
  //       paint: { // Removed as not used in merged code
  //         "text-color": "#ffffff", // Removed as not used in merged code
  //       }, // Removed as not used in merged code
  //     }) // Removed as not used in merged code

  //     map.current.addLayer({ // Removed as not used in merged code
  //       id: "unclustered-point", // Removed as not used in merged code
  //       type: "circle", // Removed as not used in merged code
  //       source: "properties", // Removed as not used in merged code
  //       filter: ["!", ["has", "point_count"]], // Removed as not used in merged code
  //       paint: { // Removed as not used in merged code
  //         "circle-color": ["case", ["==", ["get", "type"], "rent"], "#10B981", "#3B82F6"], // Removed as not used in merged code
  //         "circle-radius": ["case", ["boolean", ["feature-state", "hover"], false], 12, 8], // Removed as not used in merged code
  //         "circle-stroke-width": 2, // Removed as not used in merged code
  //         "circle-stroke-color": "#ffffff", // Removed as not used in merged code
  //         "circle-opacity": ["case", ["boolean", ["feature-state", "hover"], false], 1, 0.8], // Removed as not used in merged code
  //       }, // Removed as not used in merged code
  //     }) // Removed as not used in merged code

  //     map.current.addLayer({ // Removed as not used in merged code
  //       id: "property-labels", // Removed as not used in merged code
  //       type: "symbol", // Removed as not used in merged code
  //       source: "properties", // Removed as not used in merged code
  //       filter: ["!", ["has", "point_count"]], // Removed as not used in merged code
  //       layout: { // Removed as not used in merged code
  //         "text-field": ["concat", "$", ["get", "priceFormatted"]], // Removed as not used in merged code
  //         "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"], // Removed as not used in merged code
  //         "text-size": 10, // Removed as not used in merged code
  //         "text-offset": [0, -2], // Removed as not used in merged code
  //         "text-anchor": "bottom", // Removed as not used in merged code
  //       }, // Removed as not used in merged code
  //       paint: { // Removed as not used in merged code
  //         "text-color": "#1F2937", // Removed as not used in merged code
  //         "text-halo-color": "#ffffff", // Removed as not used in merged code
  //         "text-halo-width": 1, // Removed as not used in merged code
  //       }, // Removed as not used in merged code
  //     }) // Removed as not used in merged code
  //   }) // Removed as not used in merged code
  // } // Removed as not used in merged code

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

  // Validate coordinates function
  // const isValidCoordinate = (lat, lng) => { // Removed as not used in merged code
  //   return ( // Removed as not used in merged code
  //     lat !== null && // Removed as not used in merged code
  //     lng !== null && // Removed as not used in merged code
  //     !isNaN(lat) && // Removed as not used in merged code
  //     !isNaN(lng) && // Removed as not used in merged code
  //     isFinite(lat) && // Removed as not used in merged code
  //     isFinite(lng) && // Removed as not used in merged code
  //     lat >= -90 && // Removed as not used in merged code
  //     lat <= 90 && // Removed as not used in merged code
  //     lng >= -180 && // Removed as not used in merged code
  //     lng <= 180 // Removed as not used in merged code
  //   ) // Removed as not used in merged code
  // } // Removed as not used in merged code

  // Process and validate items
  useEffect(() => {
    if (!items || !Array.isArray(items)) {
      setValidItems([])
      setIsLoading(false)
      return
    }

    try {
      const filtered = items.filter((item) => {
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
    } catch (error) {
      console.error("Error processing map items:", error)
      setMapError("Failed to process property locations")
      setValidItems([])
    } finally {
      setIsLoading(false)
    }
  }, [items])

  // Calculate map center and bounds
  const getMapCenter = () => {
    if (validItems.length === 0) {
      // Default to a central location if no valid items
      return [40.7128, -74.006] // New York City
    }

    if (validItems.length === 1) {
      return [Number.parseFloat(validItems[0].latitude), Number.parseFloat(validItems[0].longitude)]
    }

    // Calculate center of all valid items
    const latSum = validItems.reduce((sum, item) => sum + Number.parseFloat(item.latitude), 0)
    const lngSum = validItems.reduce((sum, item) => sum + Number.parseFloat(item.longitude), 0)

    return [latSum / validItems.length, lngSum / validItems.length]
  }

  const mapCenter = getMapCenter()

  if (isLoading) {
    return (
      <div className="property-map-container">
        <div className="map-loading">
          <Loader size={32} className="loading-spinner" />
          <p>Loading map...</p>
        </div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="property-map-container">
        <div className="map-error">
          <AlertCircle size={32} />
          <h3>Map Error</h3>
          <p>{mapError}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (validItems.length === 0) {
    return (
      <div className="property-map-container">
        <div className="map-empty">
          <MapPin size={32} />
          <h3>No Properties to Display</h3>
          <p>No properties with valid locations found in this area.</p>
        </div>
      </div>
    )
  }

  // If there's a map error, show error state
  // if (mapError) { // Removed as this logic is now handled by react-leaflet implementation
  //   return ( // Removed as this logic is now handled by react-leaflet implementation
  //     <div className="map-error-container"> // Removed as this logic is now handled by react-leaflet implementation
  //       <div className="map-error-content"> // Removed as this logic is now handled by react-leaflet implementation
  //         <Info size={48} /> // Removed as this logic is now handled by react-leaflet implementation
  //         <h3>Map Error</h3> // Removed as this logic is now handled by react-leaflet implementation
  //         <p>{mapError}</p> // Removed as this logic is now handled by react-leaflet implementation
  //         <p>Please try refreshing the page or check your connection.</p> // Removed as this logic is now handled by react-leaflet implementation
  //       </div> // Removed as this logic is now handled by react-leaflet implementation
  //     </div> // Removed as this logic is now handled by react-leaflet implementation
  //   ) // Removed as this logic is now handled by react-leaflet implementation
  // } // Removed as this logic is now handled by react-leaflet implementation

  return (
    <div className={`enhanced-property-map ${isFullscreen ? "fullscreen" : ""}`}>
      {/* <div ref={mapContainer} className="map-container" /> // Removed as not used in merged code */}
      <div className="property-map-container">
        <div className="map-header">
          <div className="map-info">
            <MapPin size={16} />
            <span>{validItems.length} properties found</span>
          </div>
        </div>

        <MapContainer
          center={mapCenter}
          zoom={validItems.length === 1 ? 15 : 11}
          scrollWheelZoom={false}
          className="property-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {validItems.map((item) => {
            const lat = Number.parseFloat(item.latitude)
            const lng = Number.parseFloat(item.longitude)

            return (
              <Marker key={item.id} position={[lat, lng]} icon={ICON}>
                <Popup>
                  <Pin item={item} />
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* Property Tooltip */}
      {propertyTooltip.show && propertyTooltip.property && (
        <div
          className="property-tooltip"
          style={{
            left: propertyTooltip.x + 10,
            top: propertyTooltip.y - 10,
            transform: "translateY(-100%)",
          }}
        >
          <div className="tooltip-content">
            <div className="property-image">
              <img
                src={propertyTooltip.property.images?.[0] || "https://via.placeholder.com/120x80?text=Property"}
                alt={propertyTooltip.property.title}
                onError={handleImageError}
              />
              <div className="property-type">{propertyTooltip.property.type === "rent" ? "For Rent" : "For Sale"}</div>
            </div>
            <div className="property-info">
              <h4>{propertyTooltip.property.title}</h4>
              <p className="price">
                ${propertyTooltip.property.price?.toLocaleString() || "0"}
                {propertyTooltip.property.type === "rent" && "/month"}
              </p>
              <div className="property-features">
                <span>
                  <Bed size={12} /> {propertyTooltip.property.bedroom || 0}
                </span>
                <span>
                  <Bath size={12} /> {propertyTooltip.property.bathroom || 0}
                </span>
              </div>
              <div className="owner-info">
                <img
                  src="https://via.placeholder.com/24x24?text=Owner"
                  alt="Owner"
                  className="owner-avatar"
                  onError={handleImageError}
                />
                <span>John Smith</span>
                <div className="owner-rating">
                  <Star size={12} fill="currentColor" />
                  <span>4.8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="map-controls">
        {/* <div className="control-group"> // Removed as not used in merged code
          <button // Removed as not used in merged code
            className={`control-btn ${showStyleSelector ? "active" : ""}`} // Removed as not used in merged code
            onClick={() => setShowStyleSelector(!showStyleSelector)} // Removed as not used in merged code
            title="Map Style" // Removed as not used in merged code
          > // Removed as not used in merged code
            <Layers size={18} /> // Removed as not used in merged code
          </button> // Removed as not used in merged code

          {showStyleSelector && ( // Removed as not used in merged code
            <div className="style-selector"> // Removed as not used in merged code
              {mapStyles.map((style) => ( // Removed as not used in merged code
                <button // Removed as not used in merged code
                  key={style.id} // Removed as not used in merged code
                  className={`style-option ${mapStyle === style.url ? "active" : ""}`} // Removed as not used in merged code
                  onClick={() => handleStyleChange(style.url)} // Removed as not used in merged code
                > // Removed as not used in merged code
                  {style.name} // Removed as not used in merged code
                </button> // Removed as not used in merged code
              ))} // Removed as not used in merged code
            </div> // Removed as not used in merged code
          )} // Removed as not used in merged code
        </div> */}

        {/* <div className="control-group"> // Removed as not used in merged code
          <button className="control-btn" onClick={() => map.current?.zoomIn()} title="Zoom In"> // Removed as not used in merged code
            <Plus size={18} /> // Removed as not used in merged code
          </button> // Removed as not used in merged code
          <button className="control-btn" onClick={() => map.current?.zoomOut()} title="Zoom Out"> // Removed as not used in merged code
            <Minus size={18} /> // Removed as not used in merged code
          </button> // Removed as not used in merged code
        </div> */}

        <div className="control-group">
          <button
            className="control-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
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
        <div className="legend-item">
          <div className="legend-marker user-location"></div>
          <span>Your Location</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker property-rent"></div>
          <span>For Rent</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker property-sale"></div>
          <span>For Sale</span>
        </div>
        <div className="legend-item">
          <div className="legend-marker cluster"></div>
          <span>Property Clusters</span>
        </div>
      </div>
    </div>
  )
}

export default PropertyMap
