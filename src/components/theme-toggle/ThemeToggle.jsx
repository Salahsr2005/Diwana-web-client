"use client"

import { useTheme } from "../../context/themeContext"
import { Moon, Sun } from "lucide-react"
import "./theme-toggle.scss"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
      {theme === "light" ? <Moon className="icon" /> : <Sun className="icon" />}
    </button>
  )
}
