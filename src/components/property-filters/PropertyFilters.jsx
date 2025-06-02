"use client"

import { useState } from "react"
import "./property-filters.scss"
import {
  Home,
  DollarSign,
  Bed,
  Bath,
  Square,
  Car,
  Wifi,
  Shield,
  Zap,
  Waves,
  TreePine,
  Dumbbell,
  X,
  RotateCcw,
} from "lucide-react"

const PropertyFilters = ({ initialValues = {}, onChange, onClose }) => {
  const [filters, setFilters] = useState({
    propertyType: initialValues.propertyType || "",
    minPrice: initialValues.minPrice || "",
    maxPrice: initialValues.maxPrice || "",
    bedrooms: initialValues.bedrooms || "",
    bathrooms: initialValues.bathrooms || "",
    minSize: initialValues.minSize || "",
    maxSize: initialValues.maxSize || "",
    amenities: initialValues.amenities || [],
    features: initialValues.features || [],
    ...initialValues,
  })

  const propertyTypes = [
    { value: "house", label: "House", icon: Home },
    { value: "apartment", label: "Apartment", icon: Home },
    { value: "condo", label: "Condo", icon: Home },
    { value: "townhouse", label: "Townhouse", icon: Home },
    { value: "land", label: "Land", icon: Square },
  ]

  const priceRanges = [
    { min: "", max: "", label: "Any Price" },
    { min: "0", max: "100000", label: "Under $100K" },
    { min: "100000", max: "250000", label: "$100K - $250K" },
    { min: "250000", max: "500000", label: "$250K - $500K" },
    { min: "500000", max: "750000", label: "$500K - $750K" },
    { min: "750000", max: "1000000", label: "$750K - $1M" },
    { min: "1000000", max: "", label: "Over $1M" },
  ]

  const bedroomOptions = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
    { value: "5", label: "5+" },
  ]

  const bathroomOptions = [
    { value: "", label: "Any" },
    { value: "1", label: "1+" },
    { value: "2", label: "2+" },
    { value: "3", label: "3+" },
    { value: "4", label: "4+" },
  ]

  const amenitiesList = [
    { id: "parking", label: "Parking", icon: Car },
    { id: "wifi", label: "WiFi", icon: Wifi },
    { id: "security", label: "Security", icon: Shield },
    { id: "electricity", label: "Electricity", icon: Zap },
    { id: "pool", label: "Swimming Pool", icon: Waves },
    { id: "garden", label: "Garden", icon: TreePine },
    { id: "gym", label: "Gym", icon: Dumbbell },
  ]

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const handlePriceRangeSelect = (range) => {
    const newFilters = {
      ...filters,
      minPrice: range.min,
      maxPrice: range.max,
    }
    setFilters(newFilters)
  }

  const handleAmenityToggle = (amenityId) => {
    const currentAmenities = filters.amenities || []
    const newAmenities = currentAmenities.includes(amenityId)
      ? currentAmenities.filter((id) => id !== amenityId)
      : [...currentAmenities, amenityId]

    handleFilterChange("amenities", newAmenities)
  }

  const handleReset = () => {
    const resetFilters = {
      propertyType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      minSize: "",
      maxSize: "",
      amenities: [],
      features: [],
    }
    setFilters(resetFilters)
    onChange(resetFilters)
  }

  const handleApply = () => {
    onChange(filters)
    onClose && onClose()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "amenities" || key === "features") {
        if (Array.isArray(value) && value.length > 0) count++
      } else if (value && value !== "") {
        count++
      }
    })
    return count
  }

  return (
    <div className="property-filters">
      <div className="filters-header">
        <h3>Filters</h3>
        <div className="header-actions">
          {getActiveFiltersCount() > 0 && (
            <button className="reset-btn" onClick={handleReset}>
              <RotateCcw size={16} />
              Reset
            </button>
          )}
          {onClose && (
            <button className="close-btn" onClick={onClose}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="filters-content">
        {/* Property Type */}
        <div className="filter-section">
          <h4>Property Type</h4>
          <div className="property-type-grid">
            {propertyTypes.map((type) => (
              <button
                key={type.value}
                className={`property-type-btn ${filters.propertyType === type.value ? "active" : ""}`}
                onClick={() => handleFilterChange("propertyType", type.value)}
              >
                <type.icon size={20} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="filter-section">
          <h4>Price Range</h4>
          <div className="price-range-grid">
            {priceRanges.map((range, index) => (
              <button
                key={index}
                className={`price-range-btn ${
                  filters.minPrice === range.min && filters.maxPrice === range.max ? "active" : ""
                }`}
                onClick={() => handlePriceRangeSelect(range)}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* Custom Price Range */}
          <div className="custom-price-range">
            <div className="price-input-group">
              <label>Min Price</label>
              <div className="price-input">
                <DollarSign size={16} />
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
              </div>
            </div>
            <div className="price-input-group">
              <label>Max Price</label>
              <div className="price-input">
                <DollarSign size={16} />
                <input
                  type="number"
                  placeholder="No limit"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bedrooms & Bathrooms */}
        <div className="filter-section">
          <div className="filter-row">
            <div className="filter-group">
              <h4>
                <Bed size={18} />
                Bedrooms
              </h4>
              <div className="option-buttons">
                {bedroomOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`option-btn ${filters.bedrooms === option.value ? "active" : ""}`}
                    onClick={() => handleFilterChange("bedrooms", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>
                <Bath size={18} />
                Bathrooms
              </h4>
              <div className="option-buttons">
                {bathroomOptions.map((option) => (
                  <button
                    key={option.value}
                    className={`option-btn ${filters.bathrooms === option.value ? "active" : ""}`}
                    onClick={() => handleFilterChange("bathrooms", option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Size Range */}
        <div className="filter-section">
          <h4>
            <Square size={18} />
            Size (sqft)
          </h4>
          <div className="size-range">
            <div className="size-input-group">
              <label>Min Size</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minSize}
                onChange={(e) => handleFilterChange("minSize", e.target.value)}
              />
            </div>
            <div className="size-input-group">
              <label>Max Size</label>
              <input
                type="number"
                placeholder="No limit"
                value={filters.maxSize}
                onChange={(e) => handleFilterChange("maxSize", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="filter-section">
          <h4>Amenities</h4>
          <div className="amenities-grid">
            {amenitiesList.map((amenity) => (
              <button
                key={amenity.id}
                className={`amenity-btn ${filters.amenities?.includes(amenity.id) ? "active" : ""}`}
                onClick={() => handleAmenityToggle(amenity.id)}
              >
                <amenity.icon size={18} />
                <span>{amenity.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Button */}
      <div className="filters-footer">
        <button className="apply-btn" onClick={handleApply}>
          Apply Filters
          {getActiveFiltersCount() > 0 && <span className="filter-count">({getActiveFiltersCount()})</span>}
        </button>
      </div>
    </div>
  )
}

export default PropertyFilters
