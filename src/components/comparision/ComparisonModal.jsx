"use client"

import { useComparison } from "../../context/ComparisonContext"
import "./comparison-modal.scss"
import { Link } from "react-router-dom"

export default function ComparisonModal() {
  const { comparisonList, isComparisonOpen, toggleComparisonView, removeFromComparison, clearComparison } =
    useComparison()

  if (!isComparisonOpen) return null

  return (
    <div className="comparison-modal">
      <div className="comparison-content">
        <div className="comparison-header">
          <h2>Property Comparison</h2>
          <div className="header-actions">
            <button className="clear-btn" onClick={clearComparison}>
              Clear All
            </button>
            <button className="close-btn" onClick={toggleComparisonView}>
              ✕
            </button>
          </div>
        </div>

        {comparisonList.length === 0 ? (
          <div className="empty-comparison">
            <p>No properties selected for comparison</p>
            <Link to="/list" className="browse-btn" onClick={toggleComparisonView}>
              Browse Properties
            </Link>
          </div>
        ) : (
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th className="feature-header">Features</th>
                  {comparisonList.map((property) => (
                    <th key={property.id} className="property-header">
                      <div className="property-column">
                        <img src={property.images[0] || "/placeholder.svg"} alt={property.title} />
                        <button
                          className="remove-btn"
                          onClick={() => removeFromComparison(property.id)}
                          aria-label="Remove from comparison"
                        >
                          ✕
                        </button>
                        <h3>{property.title}</h3>
                        <Link to={`/${property.id}`} className="view-btn" onClick={toggleComparisonView}>
                          View Property
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="feature-cell">
                    <span className="icon">💰</span>
                    <span>Price</span>
                  </td>
                  {comparisonList.map((property) => (
                    <td key={property.id} className="property-cell">
                      <span className="highlight">${property.price.toLocaleString()}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-cell">
                    <span className="icon">🏠</span>
                    <span>Type</span>
                  </td>
                  {comparisonList.map((property) => (
                    <td key={property.id} className="property-cell">
                      <span className="badge">{property.type === "rent" ? "For Rent" : "For Sale"}</span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-cell">
                    <span className="icon">📍</span>
                    <span>Location</span>
                  </td>
                  {comparisonList.map((property) => (
                    <td key={property.id} className="property-cell">
                      {property.address}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-cell">
                    <span className="icon">🛏️</span>
                    <span>Bedrooms</span>
                  </td>
                  {comparisonList.map((property) => (
                    <td key={property.id} className="property-cell">
                      {property.bedroom}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-cell">
                    <span className="icon">🚿</span>
                    <span>Bathrooms</span>
                  </td>
                  {comparisonList.map((property) => (
                    <td key={property.id} className="property-cell">
                      {property.bathroom}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="feature-cell">
                    <span className="icon">📏</span>
                    <span>Size</span>
                  </td>
                  {comparisonList.map((property) => (
                    <td key={property.id} className="property-cell">
                      {property.postDetail?.size || "N/A"} sqft
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
