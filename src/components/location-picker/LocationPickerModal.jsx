"use client"

import { useState } from "react"
import { X, MapPin } from "lucide-react"
import LocationPicker from "./LocationPicker"
import "./location-picker-modal.scss"

// Modal wrapper for LocationPicker component
function LocationPickerModal({ isOpen, onClose, onLocationSelect, initialLocation = null, initialAddress = "" }) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)

  if (!isOpen) return null

  const handleLocationSelect = (location) => {
    setSelectedLocation(location)
  }

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
      onClose()
    }
  }

  const handleCancel = () => {
    setSelectedLocation(initialLocation)
    onClose()
  }

  return (
    <div className="location-picker-modal-overlay" onClick={handleCancel}>
      <div className="location-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-content">
            <MapPin size={20} />
            <h3>Select Property Location</h3>
            <p>Click on the map or search for an address to set the location</p>
          </div>
          <button className="close-btn" onClick={handleCancel}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={initialLocation}
            initialAddress={initialAddress}
          />
        </div>

        <div className="modal-footer">
          <div className="selected-info">
            {selectedLocation ? (
              <div className="location-info">
                <MapPin size={16} />
                <div>
                  <span className="address">{selectedLocation.address || "Address not available"}</span>
                  <span className="coordinates">
                    {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            ) : (
              <span className="no-location">No location selected</span>
            )}
          </div>
          <div className="action-buttons">
            <button className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={handleConfirm} disabled={!selectedLocation}>
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationPickerModal
