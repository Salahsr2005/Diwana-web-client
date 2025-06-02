"use client"

import { useState, useEffect, useRef } from "react"
import "./property-search.scss"
import { Search, MapPin, X, Home, DollarSign, ChevronDown } from "lucide-react"

const PropertySearchBar = ({ initialValues = {}, onSearch, userLocation }) => {
  const [searchQuery, setSearchQuery] = useState(initialValues.city || "")
  const [type, setType] = useState(initialValues.type || "buy")
  const [priceRange, setPriceRange] = useState({
    min: initialValues.minPrice || "",
    max: initialValues.maxPrice || "",
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const searchRef = useRef(null)

  // Load recent searches from localStorage
  useEffect(() => {
    const storedSearches = localStorage.getItem("recentSearches")
    if (storedSearches) {
      setRecentSearches(JSON.parse(storedSearches))
    }
  }, [])

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Mock location suggestions - in a real app, this would call an API
  const fetchLocationSuggestions = (query) => {
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      if (query.length > 0) {
        const mockSuggestions = [
          { id: 1, name: `${query} City Center`, type: "city" },
          { id: 2, name: `${query} Downtown`, type: "neighborhood" },
          { id: 3, name: `${query} Heights`, type: "neighborhood" },
          { id: 4, name: `${query} Park Area`, type: "district" },
          { id: 5, name: `${query} Metropolitan Area`, type: "region" },
        ]
        setSuggestions(mockSuggestions)
      } else {
        setSuggestions([])
      }
      setIsLoading(false)
    }, 300)
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)

    if (value.length > 2) {
      fetchLocationSuggestions(value)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)

    // Save to recent searches
    const updatedSearches = [
      { id: Date.now(), text: suggestion.name, type: suggestion.type },
      ...recentSearches.filter((item) => item.text !== suggestion.name).slice(0, 4),
    ]
    setRecentSearches(updatedSearches)
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
  }

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search.text)
    setShowSuggestions(false)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  const handleUseMyLocation = () => {
    if (userLocation) {
      // In a real app, you would reverse geocode the coordinates to get the location name
      setSearchQuery("Current Location")
      setShowSuggestions(false)
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you would reverse geocode the coordinates to get the location name
          setSearchQuery("Current Location")
          setShowSuggestions(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please check your browser settings.")
        },
      )
    } else {
      alert("Geolocation is not supported by your browser")
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Save search to recent searches if not already there
    if (searchQuery && !recentSearches.some((item) => item.text === searchQuery)) {
      const updatedSearches = [{ id: Date.now(), text: searchQuery, type: "custom" }, ...recentSearches.slice(0, 4)]
      setRecentSearches(updatedSearches)
      localStorage.setItem("recentSearches", JSON.stringify(updatedSearches))
    }

    onSearch({
      city: searchQuery,
      type,
      minPrice: priceRange.min,
      maxPrice: priceRange.max,
    })
  }

  return (
    <div className="property-search-bar">
      <div className="search-tabs">
        <button className={`tab-btn ${type === "buy" ? "active" : ""}`} onClick={() => setType("buy")}>
          Buy
        </button>
        <button className={`tab-btn ${type === "rent" ? "active" : ""}`} onClick={() => setType("rent")}>
          Rent
        </button>
      </div>

      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-fields">
          {/* Location Search */}
          <div className="search-field location-field" ref={searchRef}>
            <div className="field-icon">
              <MapPin size={20} />
            </div>
            <div className="field-input">
              <label htmlFor="location-search">Location</label>
              <input
                id="location-search"
                type="text"
                placeholder="Enter city, neighborhood, or address"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowSuggestions(true)}
              />
              {searchQuery && (
                <button type="button" className="clear-btn" onClick={handleClearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Location Suggestions Dropdown */}
            {showSuggestions && (
              <div className="suggestions-dropdown">
                {isLoading ? (
                  <div className="suggestions-loading">
                    <div className="loading-spinner"></div>
                    <span>Loading suggestions...</span>
                  </div>
                ) : (
                  <>
                    {/* Use My Location Option */}
                    <div className="suggestion-section">
                      <button type="button" className="location-suggestion use-location" onClick={handleUseMyLocation}>
                        <div className="suggestion-icon">
                          <div className="location-dot"></div>
                        </div>
                        <div className="suggestion-text">
                          <span>Use my current location</span>
                        </div>
                      </button>
                    </div>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div className="suggestion-section">
                        <div className="suggestion-header">Recent Searches</div>
                        {recentSearches.map((search) => (
                          <button
                            key={search.id}
                            type="button"
                            className="location-suggestion"
                            onClick={() => handleRecentSearchClick(search)}
                          >
                            <div className="suggestion-icon">
                              <MapPin size={16} />
                            </div>
                            <div className="suggestion-text">
                              <span>{search.text}</span>
                              <span className="suggestion-type">{search.type}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Location Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="suggestion-section">
                        <div className="suggestion-header">Suggestions</div>
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            className="location-suggestion"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            <div className="suggestion-icon">
                              <MapPin size={16} />
                            </div>
                            <div className="suggestion-text">
                              <span>{suggestion.name}</span>
                              <span className="suggestion-type">{suggestion.type}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {!isLoading && searchQuery.length > 2 && suggestions.length === 0 && (
                      <div className="no-suggestions">No locations found for {searchQuery}</div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Property Type */}
          <div className="search-field property-type-field">
            <div className="field-icon">
              <Home size={20} />
            </div>
            <div className="field-input">
              <label htmlFor="property-type">Property Type</label>
              <div className="select-wrapper">
                <select id="property-type" defaultValue="">
                  <option value="">Any</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="land">Land</option>
                </select>
                <ChevronDown size={16} className="select-icon" />
              </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="search-field price-field">
            <div className="field-icon">
              <DollarSign size={20} />
            </div>
            <div className="field-input">
              <label htmlFor="price-min">Price Range</label>
              <div className="price-inputs">
                <input
                  id="price-min"
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                />
                <span className="price-separator">-</span>
                <input
                  id="price-max"
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Button */}
        <button type="submit" className="search-button">
          <Search size={20} />
          <span>Search</span>
        </button>
      </form>
    </div>
  )
}

export default PropertySearchBar
