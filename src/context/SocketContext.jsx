"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { io } from "socket.io-client"
import { AuthContext } from "./AuthContext"

export const SocketContext = createContext()

export const SocketContextProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext)
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (currentUser) {
      // Use environment variable or fallback to localhost
      const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000"

      const newSocket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      newSocket.on("connect", () => {
        console.log("Connected to socket server")
        setIsConnected(true)
        newSocket.emit("newUser", currentUser.id)
      })

      newSocket.on("disconnect", () => {
        console.log("Disconnected from socket server")
        setIsConnected(false)
      })

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error)
        setIsConnected(false)
      })

      newSocket.on("getUsers", (users) => {
        setOnlineUsers(users)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
        setSocket(null)
        setIsConnected(false)
        setOnlineUsers([])
      }
    } else {
      if (socket) {
        socket.close()
        setSocket(null)
        setIsConnected(false)
        setOnlineUsers([])
      }
    }
  }, [currentUser, socket])

  const value = {
    socket,
    onlineUsers,
    isConnected,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}
