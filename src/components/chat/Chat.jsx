"use client"

import { useContext, useEffect, useRef, useState } from "react"
import "./chat.scss"
import { AuthContext } from "../../context/AuthContext"
import apiRequest from "../../lib/apiRequest"
import { toast } from "react-hot-toast"
import { MessageCircle, Send, Phone, Video, MoreVertical, Search, Paperclip, Smile } from "lucide-react"

function Chat({ chats }) {
  const { currentUser } = useContext(AuthContext)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [currentChat, setCurrentChat] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredChats, setFilteredChats] = useState(chats || [])

  const scrollRef = useRef()
  const messageInputRef = useRef()

  // Filter chats based on search term
  useEffect(() => {
    if (!chats) {
      setFilteredChats([])
      return
    }

    if (!searchTerm.trim()) {
      setFilteredChats(chats)
    } else {
      const filtered = chats.filter((chat) => {
        const recipient = getRecipient(chat)
        return recipient?.username?.toLowerCase().includes(searchTerm.toLowerCase())
      })
      setFilteredChats(filtered)
    }
  }, [chats, searchTerm])

  // Get messages for current chat
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChat) {
        setMessages([])
        return
      }

      setLoading(true)
      try {
        const res = await apiRequest.get(`/messages/${currentChat.id}`)
        setMessages(res.data || [])
      } catch (err) {
        console.error("Failed to load messages:", err)
        toast.error("Failed to load messages")
        setMessages([])
      } finally {
        setLoading(false)
      }
    }
    getMessages()
  }, [currentChat])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !currentChat || sendingMessage) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSendingMessage(true)

    // Add optimistic message
    const tempMessage = {
      id: `temp-${Date.now()}`,
      text: messageText,
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      sending: true,
    }

    setMessages((prev) => [...prev, tempMessage])

    try {
      const res = await apiRequest.post("/messages", {
        text: messageText,
        chatId: currentChat.id,
      })

      // Replace temp message with real message
      setMessages((prev) => prev.map((msg) => (msg.id === tempMessage.id ? { ...res.data, sending: false } : msg)))

      // Update chat list with last message
      if (chats) {
        const updatedChats = chats.map((chat) =>
          chat.id === currentChat.id ? { ...chat, lastMessage: messageText } : chat,
        )
        // This would need to be passed up to parent component
      }
    } catch (err) {
      console.error("Failed to send message:", err)
      toast.error("Failed to send message")

      // Remove failed message and restore text
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id))
      setNewMessage(messageText)
    } finally {
      setSendingMessage(false)
    }
  }

  const getRecipient = (chat) => {
    if (!chat) return null
    return chat.receiver || chat.user || { username: "Unknown User", avatar: "/noavatar.jpg" }
  }

  const formatTime = (timestamp) => {
    try {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return ""
    }
  }

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp)
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      if (date.toDateString() === today.toDateString()) {
        return "Today"
      } else if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday"
      } else {
        return date.toLocaleDateString()
      }
    } catch {
      return ""
    }
  }

  const groupMessagesByDate = () => {
    const groups = {}
    messages.forEach((message) => {
      const date = formatDate(message.createdAt)
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(message)
    })
    return groups
  }

  const handleChatSelect = (chat) => {
    setCurrentChat(chat)
    setMessages([])
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="chat">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>
            <MessageCircle size={20} />
            Messages
          </h2>
        </div>

        <div className="chat-search">
          <div className="search-input-wrapper">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="chat-list">
          {filteredChats && filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const recipient = getRecipient(chat)
              const isActive = currentChat?.id === chat.id

              return (
                <div
                  key={chat.id}
                  className={`chat-item ${isActive ? "active" : ""}`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <div className="chat-avatar">
                    <img
                      src={recipient?.avatar || "/noavatar.jpg"}
                      alt={recipient?.username || "User"}
                      onError={(e) => {
                        e.target.src = "/noavatar.jpg"
                      }}
                    />
                    <div className="online-status"></div>
                  </div>
                  <div className="chat-info">
                    <div className="chat-name">{recipient?.username || "Unknown User"}</div>
                    <div className="chat-preview">{chat.lastMessage || "Start a conversation"}</div>
                  </div>
                  <div className="chat-meta">
                    {chat.updatedAt && <div className="chat-time">{formatTime(chat.updatedAt)}</div>}
                    {chat.unreadCount > 0 && <div className="unread-badge">{chat.unreadCount}</div>}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="no-chats">
              <MessageCircle size={48} />
              <h3>No conversations yet</h3>
              <p>Start chatting with property owners!</p>
            </div>
          )}
        </div>
      </div>

      <div className="chat-main">
        {currentChat ? (
          <>
            <div className="chat-header">
              <div className="recipient-info">
                <div className="recipient-avatar">
                  <img
                    src={getRecipient(currentChat)?.avatar || "/noavatar.jpg"}
                    alt="Recipient"
                    onError={(e) => {
                      e.target.src = "/noavatar.jpg"
                    }}
                  />
                  <div className="online-status active"></div>
                </div>
                <div className="recipient-details">
                  <h3>{getRecipient(currentChat)?.username || "Unknown User"}</h3>
                  <span className="status">Active now</span>
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
              </div>
            </div>

            <div className="chat-messages">
              {loading ? (
                <div className="loading-messages">
                  <div className="loading-spinner"></div>
                  <p>Loading messages...</p>
                </div>
              ) : messages.length > 0 ? (
                Object.entries(groupMessagesByDate()).map(([date, dateMessages]) => (
                  <div key={date} className="message-group">
                    <div className="date-divider">
                      <span>{date}</span>
                    </div>
                    {dateMessages.map((message, index) => (
                      <div
                        key={message.id || index}
                        className={`message ${message.userId === currentUser.id ? "own" : ""}`}
                        ref={index === dateMessages.length - 1 ? scrollRef : null}
                      >
                        <div className="message-content">
                          <p>{message.text}</p>
                          <div className="message-meta">
                            <span className="message-time">{formatTime(message.createdAt)}</span>
                            {message.userId === currentUser.id && (
                              <span className="message-status">{message.sending ? "⏳" : "✓"}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <div className="no-messages">
                  <MessageCircle size={48} />
                  <h3>No messages yet</h3>
                  <p>Send a message to start the conversation!</p>
                </div>
              )}
            </div>

            <div className="chat-input">
              <div className="input-actions">
                <button className="action-btn" title="Attach file">
                  <Paperclip size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="message-form">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    ref={messageInputRef}
                    disabled={sendingMessage}
                  />
                  <button className="emoji-btn" type="button" title="Add emoji">
                    <Smile size={18} />
                  </button>
                </div>
                <button
                  type="submit"
                  className="send-btn"
                  disabled={!newMessage.trim() || sendingMessage}
                  title="Send message"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <MessageCircle size={64} />
              <h3>Select a conversation</h3>
              <p>Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
