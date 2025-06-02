/**
 * Utility function to generate a placeholder image URL or fallback to a component
 *
 * @param {number} width - Width of the placeholder
 * @param {number} height - Height of the placeholder
 * @param {string} text - Optional text for the placeholder
 * @returns {string} URL for the placeholder image
 */
export const getPlaceholderUrl = (width = 200, height = 200, text = "") => {
  // Try to use a public placeholder service
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`
}

/**
 * Utility function to handle image loading errors
 *
 * @param {Event} event - The error event from the img element
 */
export const handleImageError = (event) => {
  const target = event.target

  // Set a default background color
  target.style.background = "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"

  // Add placeholder text
  const text = document.createElement("span")
  text.innerText = "Image"
  text.style.color = "#ffffff"
  text.style.fontSize = "14px"
  text.style.fontWeight = "500"
  text.style.position = "absolute"
  text.style.top = "50%"
  text.style.left = "50%"
  text.style.transform = "translate(-50%, -50%)"

  // Clear the src to prevent further error attempts
  target.src = ""
  target.alt = "Placeholder"

  // Make sure the parent has position relative
  target.parentElement.style.position = "relative"
  target.parentElement.appendChild(text)
}
