import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.scss"
import { AuthContextProvider } from "./context/AuthContext.jsx"
import { SocketContextProvider } from "./context/SocketContext.jsx"
import { ThemeProvider } from "./context/themeContext.jsx"
import { ComparisonProvider } from "./context/ComparisonContext.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthContextProvider>
        <SocketContextProvider>
          <ComparisonProvider>
            <App />
          </ComparisonProvider>
        </SocketContextProvider>
      </AuthContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
