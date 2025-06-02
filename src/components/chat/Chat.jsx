"use client"

import { useContext, useEffect, useRef, useState } from "react"
import "./chat.scss"
import { AuthContext } from "../../context/AuthContext"
import { SocketContext } from "../../context/SocketContext"
import apiRequest from "../../lib/apiRequest"
import { format } from "timeago.js"
import { useNotificationStore } from "../../lib/notificationStore"
import {
  Search,
  Send,
  X,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Paperclip,
  ImageIcon,
  Mic,
  Circle,
  CheckCheck,
  Check,
} from "lucide-react"
import toast from "react-hot-toast"

function Chat({ chats }) {
  const [chat, setChat] = useState(null)
  const [message, setMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [messageStatus, setMessageStatus] = useState({})

  const { currentUser } = useContext(AuthContext)
  const { socket, onlineUsers, isConnected } = useContext(SocketContext)

  const messageEndRef = useRef()
  const messageContainerRef = useRef()
  const typingTimeoutRef = useRef()

  const decrease = useNotificationStore((state) => state.decrease)

  // Auto scroll to bottom
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chat?.messages])

  // Socket event listeners
  useEffect(() => {
    if (!socket || !chat) return

    const handleGetMessage = (data) => {
      if (chat.id === data.chatId) {
        setChat((prev) => ({
          ...prev,
          messages: [...prev.messages, data],
        }))
        markAsRead()

        // Show notification sound/vibration
        if ("vibrate" in navigator) {
          navigator.vibrate(200)
        }
      }
    }

    const handleUserTyping = (data) => {
      if (chat.receiver.id === data.userId) {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          if (data.isTyping) {
            newSet.add(data.userId)
          } else {
            newSet.delete(data.userId)
          }
          return newSet
        })

        // Clear typing indicator after 3 seconds
        if (data.isTyping) {
          setTimeout(() => {
            setTypingUsers((prev) => {
              const newSet = new Set(prev)
              newSet.delete(data.userId)
              return newSet
            })
          }, 3000)
        }
      }
    }

    const handleMessageDelivered = (data) => {
      setMessageStatus((prev) => ({
        ...prev,
        [data.messageId]: "delivered",
      }))
    }

    const handleMessageRead = (data) => {
      setMessageStatus((prev) => ({
        ...prev,
        [data.messageId]: "read",
      }))
    }

    socket.on("getMessage", handleGetMessage)
    socket.on("userTyping", handleUserTyping)
    socket.on("messageDelivered", handleMessageDelivered)
    socket.on("messageRead", handleMessageRead)

    return () => {
      socket.off("getMessage", handleGetMessage)
      socket.off("userTyping", handleUserTyping)
      socket.off("messageDelivered", handleMessageDelivered)
      socket.off("messageRead", handleMessageRead)
    }
  }, [socket, chat])

  const handleOpenChat = async (id, receiver) => {
    try {
      const res = await apiRequest("/chats/" + id)
      if (!res.data.seenBy.includes(currentUser.id)) {
        decrease()
      }
      setChat({ ...res.data, receiver })
      markAsRead()
    } catch (err) {
      console.log(err)
      toast.error("Failed to load chat")
    }
  }

  const markAsRead = async () => {
    if (!chat) return
    try {
      await apiRequest.put("/chats/read/" + chat.id)
    } catch (err) {
      console.log(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!message.trim() || !isConnected) return

    const tempId = Date.now().toString()
    const tempMessage = {
      id: tempId,
      text: message.trim(),
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      status: "sending",
    }

    // Optimistically add message
    setChat((prev) => ({
      ...prev,
      messages: [...prev.messages, tempMessage],
    }))
    setMessage("")

    try {
      const res = await apiRequest.post("/messages/" + chat.id, {
        text: message.trim(),
      })

      // Replace temp message with real one
      setChat((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) => (msg.id === tempId ? { ...res.data, status: "sent" } : msg)),
      }))

      // Emit to socket
      socket.emit("sendMessage", {
        receiverId: chat.receiver.id,
        data: { ...res.data, chatId: chat.id },
      })

      setMessageStatus((prev) => ({
        ...prev,
        [res.data.id]: "sent",
      }))
    } catch (err) {
      console.log(err)
      toast.error("Failed to send message")

      // Mark message as failed
      setChat((prev) => ({
        ...prev,
        messages: prev.messages.map((msg) => (msg.id === tempId ? { ...msg, status: "failed" } : msg)),
      }))
    }
  }

  const handleTyping = (value) => {
    if (!socket || !chat) return

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Emit typing start
    socket.emit("typing", {
      receiverId: chat.receiver.id,
      isTyping: value.length > 0,
    })

    // Set timeout to stop typing indicator
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          receiverId: chat.receiver.id,
          isTyping: false,
        })
      }, 1000)
    }
  }

  const isUserOnline = (userId) => {
    return onlineUsers.some((user) => user.userId === userId)
  }

  const getMessageStatus = (message) => {
    if (message.userId !== currentUser.id) return null

    const status = messageStatus[message.id] || message.status
    switch (status) {
      case "sending":
        return <Circle size={12} className="status-sending" />
      case "sent":
        return <Check size={12} className="status-sent" />
      case "delivered":
        return <CheckCheck size={12} className="status-delivered" />
      case "read":
        return <CheckCheck size={12} className="status-read" />
      case "failed":
        return <X size={12} className="status-failed" />
      default:
        return <Check size={12} className="status-sent" />
    }
  }

  const filteredChats = chats?.filter((c) => c.receiver.username.toLowerCase().includes(searchTerm.toLowerCase())) || []

  return (
    <div className="modern-chat-container">
      {/* Connection Status */}
      {!isConnected && (
        <div className="connection-status offline">
          <Circle size={8} />
          <span>Connecting...</span>
        </div>
      )}

      <div className="chat-sidebar">
        <div className="sidebar-header">
          <div className="header-content">
            <h2>Messages</h2>
            <div className="connection-indicator">
              <Circle size={8} className={isConnected ? "online" : "offline"} />
              <span>{isConnected ? "Online" : "Offline"}</span>
            </div>
          </div>

          <div className="search-container">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="conversations-list">
          {filteredChats.map((c) => (
            <div
              className={`conversation-item ${chat?.id === c.id ? "active" : ""} ${
                !c.seenBy.includes(currentUser.id) ? "unread" : ""
              }`}
              key={c.id}
              onClick={() => handleOpenChat(c.id, c.receiver)}
            >
              <div className="avatar-container">
                <img src={c.receiver.avatar || "/noavatar.jpg"} alt="" />
                <div className={`status-dot ${isUserOnline(c.receiver.id) ? "online" : "offline"}`}></div>
              </div>

              <div className="conversation-content">
                <div className="conversation-header">
                  <span className="username">{c.receiver.username}</span>
                  <span className="timestamp">{format(c.updatedAt)}</span>
                </div>
                <div className="last-message-container">
                  <p className="last-message">{c.lastMessage}</p>
                  {!c.seenBy.includes(currentUser.id) && (
                    <div className="unread-badge">
                      <span>1</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredChats.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No conversations</h3>
              <p>Start a conversation from a property listing</p>
            </div>
          )}
        </div>
      </div>

      {chat ? (
        <div className="chat-main">
          <div className="chat-header">
            <div className="chat-user-info">
              <div className="avatar-container">
                <img src={chat.receiver.avatar || "/noavatar.jpg"} alt="" />
                <div className={`status-dot ${isUserOnline(chat.receiver.id) ? "online" : "offline"}`}></div>
              </div>
              <div className="user-details">
                <h3>{chat.receiver.username}</h3>
                <span className="status">
                  {typingUsers.has(chat.receiver.id)
                    ? "Typing..."
                    : isUserOnline(chat.receiver.id)
                      ? "Active now"
                      : "Last seen recently"}
                </span>
              </div>
            </div>

            <div className="chat-actions">
              <button className="action-btn" title="Voice call">
                <Phone size={18} />
              </button>
              <button className="action-btn" title="Video call">
                <Video size={18} />
              </button>
              <button className="action-btn" title="More options">
                <MoreVertical size={18} />
              </button>
              <button className="close-btn" onClick={() => setChat(null)} title="Close chat">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="chat-messages" ref={messageContainerRef}>
            {chat.messages.map((msg) => (
              <div key={msg.id} className={`message ${msg.userId === currentUser.id ? "own" : "other"}`}>
                <div className="message-bubble">
                  <p>{msg.text}</p>
                  <div className="message-footer">
                    <span className="message-time">{format(msg.createdAt)}</span>
                    {msg.userId === currentUser.id && <div className="message-status">{getMessageStatus(msg)}</div>}
                  </div>
                </div>
              </div>
            ))}

            {typingUsers.has(chat.receiver.id) && (
              <div className="message other">
                <div className="typing-indicator">
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef}></div>
          </div>

          <form onSubmit={handleSubmit} className="chat-input-form">
            <div className="input-container">
              <div className="input-actions-left">
                <button type="button" className="input-action" title="Attach file">
                  <Paperclip size={18} />
                </button>
                <button type="button" className="input-action" title="Send image">
                  <ImageIcon size={18} />
                </button>
              </div>

              <div className="input-wrapper">
                <textarea
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    handleTyping(e.target.value)
                  }}
                  placeholder="Type your message..."
                  rows="1"
                  disabled={!isConnected}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <button type="button" className="input-action emoji-btn" title="Add emoji">
                  <Smile size={18} />
                </button>
              </div>

              <div className="input-actions-right">
                {message.trim() ? (
                  <button
                    type="submit"
                    className="send-btn"
                    disabled={!message.trim() || !isConnected}
                    title="Send message"
                  >
                    <Send size={18} />
                  </button>
                ) : (
                  <button type="button" className="voice-btn" title="Voice message">
                    <Mic size={18} />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="chat-placeholder">
          <div className="placeholder-content">
            <div className="placeholder-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose from your existing conversations or start a new one from a property listing</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Chat
