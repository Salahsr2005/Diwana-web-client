"use client"

import { ChevronDown, SortAsc } from "lucide-react"
import "./property-sorter.scss"

const PropertySorter = ({ value, onChange }) => {
  const sortOptions = [
    { value: "recommended", label: "Recommended" },
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "distance", label: "Distance" },
  ]

  return (
    <div className="property-sorter">
      <div className="sorter-icon">
        <SortAsc size={16} />
      </div>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="sort-select">
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="dropdown-icon" />
    </div>
  )
}

export default PropertySorter
