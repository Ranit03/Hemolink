import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, X, Minimize2, Maximize2 } from 'lucide-react'
import { cn } from '../utils/cn'
import chatbotService from '../services/chatbotService'

export interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
  type?: 'text' | 'options' | 'appointment' | 'donor'
  options?: string[]
  metadata?: any
}

interface ChatbotProps {
  isFloating?: boolean
  isOpen?: boolean
  onClose?: () => void
  onMinimize?: () => void
  className?: string
}

const Chatbot: React.FC<ChatbotProps> = ({ 
  isFloating = false, 
  isOpen = true, 
  onClose, 
  onMinimize,
  className 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your HemoLink AI assistant. I'm here to help you with:\n\n🩸 Thalassemia FAQs\n🥗 Diet & Care Guidance\n📅 Booking Appointments\n🤝 Live Donor Support\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'options',
      options: ['Thalassemia FAQs', 'Diet & Care', 'Book Appointment', 'Donor Support']
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = generateBotResponse(text.trim())
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleOptionClick = (option: string) => {
    handleSendMessage(option)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSendMessage(inputText)
  }

  const handleMinimize = () => {
    setIsMinimized(!isMinimized)
    onMinimize?.()
  }

  const generateBotResponse = (userInput: string): Message => {
    const response = chatbotService.generateResponse(userInput)

    return {
      id: Date.now().toString(),
      text: response.text,
      sender: 'bot',
      timestamp: new Date(),
      type: response.type || 'text',
      options: response.options,
      metadata: response.metadata
    }
  }

  const chatContent = (
    <div className={cn(
      "flex flex-col h-full bg-white",
      isFloating ? "rounded-lg shadow-2xl border border-gray-200" : "rounded-xl shadow-lg border border-gray-100"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-4 border-b border-gray-100",
        isFloating ? "rounded-t-lg" : "rounded-t-xl",
        "bg-gradient-to-r from-blue-600 to-blue-700 text-white"
      )}>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold">HemoLink AI Assistant</h3>
            <p className="text-xs text-blue-100">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isFloating && (
            <>
              <button
                onClick={handleMinimize}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
            <AnimatePresence>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} onOptionClick={handleOptionClick} />
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-2"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )

  if (isFloating) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50 w-80", className)}>
        {isOpen && chatContent}
      </div>
    )
  }

  return (
    <div className={cn("w-full h-full", className)}>
      {chatContent}
    </div>
  )
}

interface MessageBubbleProps {
  message: Message
  onOptionClick: (option: string) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onOptionClick }) => {
  const isBot = message.sender === 'bot'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex",
        isBot ? "justify-start" : "justify-end"
      )}
    >
      <div className={cn(
        "flex items-start space-x-2 max-w-xs lg:max-w-md",
        isBot ? "flex-row" : "flex-row-reverse space-x-reverse"
      )}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isBot ? "bg-blue-100" : "bg-gray-100"
        )}>
          {isBot ? (
            <Bot className="w-4 h-4 text-blue-600" />
          ) : (
            <User className="w-4 h-4 text-gray-600" />
          )}
        </div>

        <div className="space-y-2">
          <div className={cn(
            "px-3 py-2 rounded-lg",
            isBot
              ? "bg-gray-100 text-gray-900"
              : "bg-blue-600 text-white"
          )}>
            <p className="text-sm whitespace-pre-line">{message.text}</p>
          </div>

          {message.options && (
            <div className="flex flex-wrap gap-2">
              {message.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => onOptionClick(option)}
                  className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default Chatbot
