"use client"

import { useState } from "react"
import "./newPostPage.scss"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import apiRequest from "../../lib/apiRequest"
import UploadWidget from "../../components/uploadWidget/UploadWidget"
import { useNavigate } from "react-router-dom"
import { Home, MapPin, DollarSign, Bed, Bath, Square, Upload, CheckCircle, AlertCircle, Loader } from "lucide-react"
import LocationPicker from "../../components/location-picker/LocationPicker"

function NewPostPage() {
  const [value, setValue] = useState("")
  const [images, setImages] = useState([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    address: "",
    city: "",
    bedroom: "",
    bathroom: "",
    type: "rent",
    property: "apartment",
    latitude: "",
    longitude: "",
    utilities: "owner",
    pet: "allowed",
    income: "",
    size: "",
    school: "",
    bus: "",
    restaurant: "",
  })

  const navigate = useNavigate()

  const steps = [
    { id: 1, title: "Basic Info", icon: Home },
    { id: 2, title: "Details", icon: Square },
    { id: 3, title: "Location", icon: MapPin },
    { id: 4, title: "Images", icon: Upload },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const res = await apiRequest.post("/posts", {
        postData: {
          title: formData.title,
          price: Number.parseInt(formData.price),
          address: formData.address,
          city: formData.city,
          bedroom: Number.parseInt(formData.bedroom),
          bathroom: Number.parseInt(formData.bathroom),
          type: formData.type,
          property: formData.property,
          latitude: formData.latitude,
          longitude: formData.longitude,
          images: images,
        },
        postDetail: {
          desc: value,
          utilities: formData.utilities,
          pet: formData.pet,
          income: formData.income,
          size: Number.parseInt(formData.size),
          school: Number.parseInt(formData.school),
          bus: Number.parseInt(formData.bus),
          restaurant: Number.parseInt(formData.restaurant),
        },
      })
      navigate("/" + res.data.id)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || "Failed to create property listing")
    } finally {
      setIsLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        return formData.title && formData.price && formData.type && formData.property
      case 2:
        return formData.bedroom && formData.bathroom && formData.size
      case 3:
        return formData.address && formData.city && formData.latitude && formData.longitude
      case 4:
        return images.length > 0
      default:
        return false
    }
  }

  // Handle location selection from map
  const handleLocationSelect = (location) => {
    if (location) {
      setFormData((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address || prev.address,
        city: location.address ? extractCity(location.address) : prev.city,
      }))
    }
  }

  // Extract city from full address
  const extractCity = (address) => {
    if (!address) return ""

    // Try to extract city from address
    // This is a simple implementation - could be improved with more sophisticated parsing
    const parts = address.split(",").map((part) => part.trim())

    // Usually city is the second-to-last or third-to-last part
    if (parts.length >= 3) {
      return parts[parts.length - 3] || parts[parts.length - 2]
    } else if (parts.length === 2) {
      return parts[0]
    }

    return ""
  }

  return (
    <div className="new-post-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Create New Property Listing</h1>
          <p>Fill in the details below to create your property listing</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`step ${currentStep >= step.id ? "active" : ""} ${currentStep > step.id ? "completed" : ""}`}
              onClick={() => {
                // Allow clicking on completed steps to navigate back
                if (currentStep > step.id) {
                  setCurrentStep(step.id)
                }
              }}
            >
              <div className="step-icon">
                {currentStep > step.id ? <CheckCircle size={20} /> : <step.icon size={20} />}
              </div>
              <span className="step-title">{step.title}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="property-form">
        <div className="form-container">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="form-step" data-step="1">
              <div className="step-header">
                <Home size={24} />
                <h2>Basic Information</h2>
                <p>Tell us about your property</p>
              </div>

              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">
                    <Home size={18} />
                    Property Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter a descriptive title for your property"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">
                    <DollarSign size={18} />
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    placeholder="Enter price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">
                    <Home size={18} />
                    Listing Type
                  </label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="rent">For Rent</option>
                    <option value="buy">For Sale</option>
                  </select>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="property">
                    <Square size={18} />
                    Property Type
                  </label>
                  <div className="property-type-grid">
                    {["apartment", "house", "condo", "land"].map((type) => (
                      <label key={type} className="property-type-option">
                        <input
                          type="radio"
                          name="property"
                          value={type}
                          checked={formData.property === type}
                          onChange={handleInputChange}
                        />
                        <span className="option-content">
                          <Home size={20} />
                          <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="form-step" data-step="2">
              <div className="step-header">
                <Square size={24} />
                <h2>Property Details</h2>
                <p>Provide specific details about your property</p>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="bedroom">
                    <Bed size={18} />
                    Bedrooms
                  </label>
                  <input
                    id="bedroom"
                    name="bedroom"
                    type="number"
                    min="1"
                    placeholder="Number of bedrooms"
                    value={formData.bedroom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bathroom">
                    <Bath size={18} />
                    Bathrooms
                  </label>
                  <input
                    id="bathroom"
                    name="bathroom"
                    type="number"
                    min="1"
                    placeholder="Number of bathrooms"
                    value={formData.bathroom}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="size">
                    <Square size={18} />
                    Size (sqft)
                  </label>
                  <input
                    id="size"
                    name="size"
                    type="number"
                    min="0"
                    placeholder="Total size in square feet"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="utilities">Utilities Policy</label>
                  <select name="utilities" value={formData.utilities} onChange={handleInputChange}>
                    <option value="owner">Owner is responsible</option>
                    <option value="tenant">Tenant is responsible</option>
                    <option value="shared">Shared</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="pet">Pet Policy</label>
                  <select name="pet" value={formData.pet} onChange={handleInputChange}>
                    <option value="allowed">Pets Allowed</option>
                    <option value="not-allowed">No Pets</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="income">Income Policy</label>
                  <input
                    id="income"
                    name="income"
                    type="text"
                    placeholder="e.g., 3x rent required"
                    value={formData.income}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description">Description</label>
                  <div className="quill-container">
                    <ReactQuill
                      theme="snow"
                      value={value}
                      onChange={setValue}
                      placeholder="Describe your property in detail..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="form-step" data-step="3">
              <div className="step-header">
                <MapPin size={24} />
                <h2>Location Details</h2>
                <p>Where is your property located?</p>
              </div>

              <div className="location-section">
                <div className="map-wrapper">
                  <LocationPicker
                    onLocationSelect={handleLocationSelect}
                    initialLocation={
                      formData.latitude && formData.longitude
                        ? { latitude: formData.latitude, longitude: formData.longitude }
                        : null
                    }
                    initialAddress={formData.address}
                  />
                </div>

                <div className="location-form">
                  <div className="form-group">
                    <label htmlFor="address">
                      <MapPin size={18} />
                      Full Address
                    </label>
                    <input
                      id="address"
                      name="address"
                      type="text"
                      placeholder="Enter the complete address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="City name"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="latitude">Latitude</label>
                    <input
                      id="latitude"
                      name="latitude"
                      type="text"
                      placeholder="e.g., 40.7128"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="longitude">Longitude</label>
                    <input
                      id="longitude"
                      name="longitude"
                      type="text"
                      placeholder="e.g., -74.0060"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="location-tip">
                    <div className="tip-icon">💡</div>
                    <p>
                      Click on the map to set the exact location of your property or search for an address using the
                      search bar.
                    </p>
                  </div>
                </div>

                <div className="nearby-places">
                  <h3>Nearby Places</h3>
                  <p>Enter the distance to nearby amenities (in meters)</p>

                  <div className="nearby-grid">
                    <div className="form-group">
                      <label htmlFor="school">School Distance</label>
                      <input
                        id="school"
                        name="school"
                        type="number"
                        min="0"
                        placeholder="Distance to nearest school"
                        value={formData.school}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="bus">Bus Stop Distance</label>
                      <input
                        id="bus"
                        name="bus"
                        type="number"
                        min="0"
                        placeholder="Distance to nearest bus stop"
                        value={formData.bus}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="restaurant">Restaurant Distance</label>
                      <input
                        id="restaurant"
                        name="restaurant"
                        type="number"
                        min="0"
                        placeholder="Distance to nearest restaurant"
                        value={formData.restaurant}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Images */}
          {currentStep === 4 && (
            <div className="form-step" data-step="4">
              <div className="step-header">
                <Upload size={24} />
                <h2>Property Images</h2>
                <p>Upload high-quality images of your property</p>
              </div>

              <div className="image-upload-section">
                <div className="upload-area">
                  <UploadWidget
                    uwConfig={{
                      multiple: true,
                      cloudName: "lamadev",
                      uploadPreset: "estate",
                      folder: "posts",
                    }}
                    setState={setImages}
                  />
                </div>

                {images.length > 0 && (
                  <div className="image-preview-grid">
                    {images.map((image, index) => (
                      <div key={index} className="image-preview">
                        <img src={image || "/placeholder.svg"} alt={`Property ${index + 1}`} />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                        {index === 0 && <div className="primary-badge">Primary</div>}
                      </div>
                    ))}
                  </div>
                )}

                <div className="upload-tips">
                  <h4>Photo Tips</h4>
                  <ul>
                    <li>Upload at least 5 high-quality photos</li>
                    <li>Include exterior and interior shots</li>
                    <li>Show key features and amenities</li>
                    <li>Use good lighting and clear angles</li>
                    <li>The first image will be used as the primary photo</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            {currentStep > 1 && (
              <button type="button" className="nav-btn prev-btn" onClick={prevStep}>
                Previous
              </button>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                className="nav-btn next-btn"
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
              >
                Next Step
              </button>
            ) : (
              <button type="submit" className="submit-btn" disabled={isLoading || !isStepValid(4)}>
                {isLoading ? (
                  <>
                    <Loader className="spinner" size={18} />
                    Creating Listing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    Create Listing
                  </>
                )}
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default NewPostPage
