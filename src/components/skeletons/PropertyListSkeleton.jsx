"use client"

import "./property-list-skeleton.scss"

const PropertyListSkeleton = ({ count = 6, viewMode = "grid" }) => {
  return (
    <div className={`property-skeleton-container ${viewMode}`}>
      {[...Array(count)].map((_, index) => (
        <div key={index} className={`property-skeleton ${viewMode}`}>
          <div className="skeleton-image">
            <div className="skeleton-shimmer"></div>
          </div>
          <div className="skeleton-content">
            <div className="skeleton-line price"></div>
            <div className="skeleton-line title"></div>
            <div className="skeleton-line location"></div>
            <div className="skeleton-features">
              <div className="skeleton-feature"></div>
              <div className="skeleton-feature"></div>
              <div className="skeleton-feature"></div>
            </div>
            <div className="skeleton-actions">
              <div className="skeleton-button"></div>
              <div className="skeleton-button primary"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PropertyListSkeleton
