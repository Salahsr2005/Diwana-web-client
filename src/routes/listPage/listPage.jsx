"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { Await, useLoaderData, useSearchParams, useNavigate } from "react-router-dom"
import "./listPage.scss"
import Card from "../../components/card/Card"
import PropertySearchBar from "../../components/property-search/PropertySearchBar"
import PropertyMap from "../../components/property-map/PropertyMap"
import PropertyFilters from "../../components/property-filters/PropertyFilters"
import PropertySorter from "../../components/property-sorter/PropertySorter"
import PropertyListSkeleton from "../../components/skeletons/PropertyListSkeleton"

function ListPage() {
  const data = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState(() => {
    return window.innerWidth < 768 ? "grid" : "split"
  })
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "recommended")
  const [showFilters, setShowFilters] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [filteredProperties, setFilteredProperties] = useState([])
  const [allProperties, setAllProperties] = useState([])
  const [mapBounds, setMapBounds] = useState(null)
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [savedSearches, setSavedSearches] = useState([])
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})
  const [searchQuery, setSearchQuery] = useState(searchParams.get("city") || "")
  const filtersRef = useRef(null)

  // Get user location from URL params or browser
  useEffect(() => {
    const userLat = searchParams.get("userLat")
    const userLng = searchParams.get("userLng")

    if (userLat && userLng) {
      setUserLocation({
        latitude: Number.parseFloat(userLat),
        longitude: Number.parseFloat(userLng),
      })
    } else {
      // Try to get user location if not in URL
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            }
            setUserLocation(location)

            // Update URL with user location
            const newParams = new URLSearchParams(searchParams)
            newParams.set("userLat", location.latitude)
            newParams.set("userLng", location.longitude)
            setSearchParams(newParams)
          },
          (error) => {
            console.error("Error getting user location:", error)
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
        )
      }
    }
  }, [])

  // Parse filters from URL params
  useEffect(() => {
    const filters = {}
    for (const [key, value] of searchParams.entries()) {
      if (["type", "minPrice", "maxPrice", "bedrooms", "bathrooms", "propertyType", "amenities"].includes(key)) {
        filters[key] = key === "amenities" ? value.split(",") : value
      }
    }
    setActiveFilters(filters)
    setSearchQuery(searchParams.get("city") || "")
  }, [searchParams])

  // Handle sorting and filtering
  const handleSortChange = (value) => {
    setSortBy(value)
    const newParams = new URLSearchParams(searchParams)
    newParams.set("sort", value)
    setSearchParams(newParams)
  }

  const handleFilterChange = (filters) => {
    setActiveFilters(filters)
    const newParams = new URLSearchParams(searchParams)

    // Update URL with filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        if (Array.isArray(value)) {
          if (value.length > 0) {
            newParams.set(key, value.join(","))
          } else {
            newParams.delete(key)
          }
        } else {
          newParams.set(key, value)
        }
      } else {
        newParams.delete(key)
      }
    })

    setSearchParams(newParams)
  }

  const handleSearchSubmit = (searchData) => {
    const newParams = new URLSearchParams(searchParams)

    // Update search parameters
    if (searchData.city) {
      newParams.set("city", searchData.city)
      setSearchQuery(searchData.city)
    }
    if (searchData.type) newParams.set("type", searchData.type)
    if (searchData.minPrice) newParams.set("minPrice", searchData.minPrice)
    if (searchData.maxPrice) newParams.set("maxPrice", searchData.maxPrice)

    setSearchParams(newParams)
  }

  const handleMapBoundsChange = (bounds) => {
    setMapBounds(bounds)
  }

  const handlePropertyHover = (property) => {
    setSelectedProperty(property)
  }

  const handlePropertyClick = (property) => {
    navigate(`/${property.id}`)
  }

  const handleSaveSearch = () => {
    const currentSearch = {
      id: Date.now(),
      name: `Search ${savedSearches.length + 1}`,
      params: Object.fromEntries(searchParams),
      date: new Date().toISOString(),
    }

    const updatedSearches = [...savedSearches, currentSearch]
    setSavedSearches(updatedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches))
  }

  const handleApplySavedSearch = (search) => {
    setSearchParams(new URLSearchParams(search.params))
    setShowSavedSearches(false)
  }

  const handleDeleteSavedSearch = (id) => {
    const updatedSearches = savedSearches.filter((search) => search.id !== id)
    setSavedSearches(updatedSearches)
    localStorage.setItem("savedSearches", JSON.stringify(updatedSearches))
  }

  // Load saved searches from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem("savedSearches")
    if (storedSearches) {
      setSavedSearches(JSON.parse(storedSearches))
    }
  }, [])

  // Handle scroll behavior for sticky filters
  useEffect(() => {
    const handleScroll = () => {
      if (filtersRef.current) {
        const { top } = filtersRef.current.getBoundingClientRect()
        if (top <= 0) {
          filtersRef.current.classList.add("sticky")
        } else {
          filtersRef.current.classList.remove("sticky")
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Handle responsive view mode changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && viewMode === "split") {
        setViewMode("grid")
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [viewMode])

  return (
    <div className="real-estate-search-page">
      {/* Search Bar */}
      <div className="search-container">
        <PropertySearchBar
          initialValues={Object.fromEntries(searchParams)}
          onSearch={handleSearchSubmit}
          userLocation={userLocation}
        />
      </div>

      {/* Main Content */}
      <div className={`search-content ${viewMode} ${isSidebarCollapsed ? "collapsed-sidebar" : ""}`}>
        {/* Sidebar with Filters and Listings */}
        <div className={`search-sidebar ${showFilters ? "show-filters" : ""}`}>
          {/* Filters Section */}
          <div className="filters-section" ref={filtersRef}>
            <div className="filters-header">
              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                >
                  <span className="icon">⊞</span>
                </button>
                <button
                  className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  title="List View"
                >
                  <span className="icon">☰</span>
                </button>
                <button
                  className={`view-btn ${viewMode === "map" ? "active" : ""}`}
                  onClick={() => setViewMode("map")}
                  title="Map View"
                >
                  <span className="icon">🗺️</span>
                </button>
                {window.innerWidth >= 768 && (
                  <button
                    className={`view-btn ${viewMode === "split" ? "active" : ""}`}
                    onClick={() => setViewMode("split")}
                    title="Split View"
                  >
                    <div className="split-icon">
                      <div></div>
                      <div></div>
                    </div>
                  </button>
                )}
              </div>

              <div className="filters-actions">
                <PropertySorter value={sortBy} onChange={handleSortChange} />

                <button
                  className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <span className="icon">🎛️</span>
                  <span>Filters</span>
                  {Object.keys(activeFilters).length > 0 && (
                    <span className="filter-count">{Object.keys(activeFilters).length}</span>
                  )}
                </button>

                <div className="saved-search-container">
                  <button
                    className="save-search-btn"
                    onClick={() => setShowSavedSearches(!showSavedSearches)}
                    title="Saved Searches"
                  >
                    <span className="icon">🔖</span>
                  </button>

                  {showSavedSearches && (
                    <div className="saved-searches-dropdown">
                      <div className="saved-searches-header">
                        <h4>Saved Searches</h4>
                        <button onClick={() => setShowSavedSearches(false)}>
                          <span className="icon">✕</span>
                        </button>
                      </div>

                      {savedSearches.length === 0 ? (
                        <div className="no-saved-searches">
                          <p>No saved searches yet</p>
                          <button className="save-current-btn" onClick={handleSaveSearch}>
                            Save Current Search
                          </button>
                        </div>
                      ) : (
                        <>
                          <ul className="saved-searches-list">
                            {savedSearches.map((search) => (
                              <li key={search.id}>
                                <button className="saved-search-item" onClick={() => handleApplySavedSearch(search)}>
                                  <div>
                                    <span className="search-name">{search.name}</span>
                                    <span className="search-date">{new Date(search.date).toLocaleDateString()}</span>
                                  </div>
                                </button>
                                <button
                                  className="delete-search-btn"
                                  onClick={() => handleDeleteSavedSearch(search.id)}
                                >
                                  <span className="icon">✕</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                          <div className="saved-searches-footer">
                            <button className="save-current-btn" onClick={handleSaveSearch}>
                              Save Current Search
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="share-btn"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Property Search Results",
                        url: window.location.href,
                      })
                    } else {
                      navigator.clipboard.writeText(window.location.href)
                      alert("Search URL copied to clipboard!")
                    }
                  }}
                  title="Share Search"
                >
                  <span className="icon">📤</span>
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="filters-panel">
                <PropertyFilters
                  initialValues={activeFilters}
                  onChange={handleFilterChange}
                  onClose={() => setShowFilters(false)}
                />
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="results-summary">
            <Suspense fallback={<span>Loading...</span>}>
              <Await resolve={data.postResponse}>
                {(postResponse) => {
                  // Store all properties for map usage
                  setAllProperties(postResponse.data)

                  return (
                    <div className="results-count">
                      <strong>{postResponse.data.length}</strong> properties found
                      {searchQuery && (
                        <>
                          {" in "}
                          <span className="location-highlight">
                            <span className="icon">📍</span>
                            {searchQuery}
                          </span>
                        </>
                      )}
                    </div>
                  )
                }}
              </Await>
            </Suspense>

            {viewMode === "split" && (
              <button
                className="collapse-sidebar-btn"
                onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                {isSidebarCollapsed ? "▶" : "◀"}
              </button>
            )}
          </div>

          {/* Properties Listing */}
          {(viewMode === "grid" || viewMode === "list" || viewMode === "split") && (
            <div className={`properties-container ${viewMode}`}>
              <Suspense fallback={<PropertyListSkeleton count={6} viewMode={viewMode} />}>
                <Await
                  resolve={data.postResponse}
                  errorElement={
                    <div className="error-state">
                      <h3>Error loading properties</h3>
                      <p>Please try again later</p>
                    </div>
                  }
                >
                  {(postResponse) => {
                    // Apply filters and sorting
                    let properties = [...postResponse.data]

                    // Filter by search query if provided
                    if (searchQuery) {
                      properties = properties.filter(
                        (property) =>
                          property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          property.city?.toLowerCase().includes(searchQuery.toLowerCase()),
                      )
                    }

                    // Filter by map bounds if in map or split view and map is loaded
                    if ((viewMode === "map" || viewMode === "split") && isMapLoaded && mapBounds) {
                      properties = properties.filter((property) => {
                        return (
                          property.latitude >= mapBounds.south &&
                          property.latitude <= mapBounds.north &&
                          property.longitude >= mapBounds.west &&
                          property.longitude <= mapBounds.east
                        )
                      })
                    }

                    // Apply sorting
                    switch (sortBy) {
                      case "price-low":
                        properties.sort((a, b) => a.price - b.price)
                        break
                      case "price-high":
                        properties.sort((a, b) => b.price - a.price)
                        break
                      case "newest":
                        properties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        break
                      case "oldest":
                        properties.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                        break
                      case "distance":
                        if (userLocation) {
                          properties.sort((a, b) => {
                            const distA = calculateDistance(
                              userLocation.latitude,
                              userLocation.longitude,
                              a.latitude,
                              a.longitude,
                            )
                            const distB = calculateDistance(
                              userLocation.latitude,
                              userLocation.longitude,
                              b.latitude,
                              b.longitude,
                            )
                            return distA - distB
                          })
                        }
                        break
                      default: // recommended
                        // Could implement a more complex recommendation algorithm here
                        break
                    }

                    // Update filtered properties for map
                    setFilteredProperties(properties)

                    return properties.length > 0 ? (
                      <div className={`properties-grid ${viewMode}`}>
                        {properties.map((property) => (
                          <Card
                            key={property.id}
                            item={property}
                            viewMode={viewMode}
                            onMouseEnter={() => handlePropertyHover(property)}
                            onMouseLeave={() => handlePropertyHover(null)}
                            isHighlighted={selectedProperty && selectedProperty.id === property.id}
                            userLocation={userLocation}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="no-results">
                        <div className="no-results-content">
                          <span className="icon">ℹ️</span>
                          <h3>No properties found</h3>
                          <p>
                            {searchQuery
                              ? `No properties found for "${searchQuery}"`
                              : "Try adjusting your search filters"}
                          </p>
                          <button
                            className="clear-filters-btn"
                            onClick={() => {
                              setSearchParams(new URLSearchParams())
                              setActiveFilters({})
                              setSearchQuery("")
                            }}
                          >
                            Clear All Filters
                          </button>
                        </div>
                      </div>
                    )
                  }}
                </Await>
              </Suspense>
            </div>
          )}
        </div>

        {/* Map Section */}
        {(viewMode === "map" || viewMode === "split") && (
          <div className="map-container">
            <Suspense
              fallback={
                <div className="map-loading">
                  <div className="loading-spinner">🔄</div>
                  <p>Loading map...</p>
                </div>
              }
            >
              <Await
                resolve={data.postResponse}
                errorElement={
                  <div className="map-error">
                    <h3>Error loading map</h3>
                    <p>Please try again later</p>
                  </div>
                }
              >
                {(postResponse) => (
                  <PropertyMap
                    items={filteredProperties.length > 0 ? filteredProperties : []}
                    properties={postResponse.data}
                    userLocation={userLocation}
                    selectedProperty={selectedProperty}
                    onPropertySelect={handlePropertyClick}
                    onBoundsChange={handleMapBoundsChange}
                    onMapLoaded={() => setIsMapLoaded(true)}
                    searchQuery={searchQuery}
                    showUserLocation={true}
                  />
                )}
              </Await>
            </Suspense>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to calculate distance between coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default ListPage
