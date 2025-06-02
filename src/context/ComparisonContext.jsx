"use client"

import { createContext, useContext, useState } from "react"

const ComparisonContext = createContext()

export function ComparisonProvider({ children }) {
  const [comparisonList, setComparisonList] = useState([])
  const [isComparisonOpen, setIsComparisonOpen] = useState(false)

  const addToComparison = (property) => {
    if (comparisonList.length >= 3) {
      return false // Maximum 3 properties for comparison
    }

    if (!comparisonList.some((item) => item.id === property.id)) {
      setComparisonList((prev) => [...prev, property])
      return true
    }
    return false
  }

  const removeFromComparison = (propertyId) => {
    setComparisonList((prev) => prev.filter((item) => item.id !== propertyId))
  }

  const clearComparison = () => {
    setComparisonList([])
  }

  const toggleComparisonView = () => {
    setIsComparisonOpen((prev) => !prev)
  }

  return (
    <ComparisonContext.Provider
      value={{
        comparisonList,
        isComparisonOpen,
        addToComparison,
        removeFromComparison,
        clearComparison,
        toggleComparisonView,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  )
}

export const useComparison = () => useContext(ComparisonContext)
