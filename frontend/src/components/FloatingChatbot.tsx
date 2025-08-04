import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Minimize2, Maximize2, Bot } from 'lucide-react'
import Chatbot from './Chatbot'
import { cn } from '../utils/cn'

interface FloatingChatbotProps {
  className?: string
}

const FloatingChatbot: React.FC<FloatingChatbotProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)

  const toggleChatbot = () => {
    setIsOpen(!isOpen)
    setShowTooltip(false) // Hide tooltip when user interacts with chatbot
    if (!isOpen) {
      setIsMinimized(false)
    }
  }

  const closeChatbot = () => {
    setIsOpen(false)
    setIsMinimized(false)
    setShowTooltip(false) // Hide tooltip when user closes chatbot
  }

  const minimizeChatbot = () => {
    setIsMinimized(!isMinimized)
  }

  // Auto-hide tooltip after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 5000) // Hide after 5 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className={cn(
              "mb-4 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden",
              isMinimized ? "w-80 h-16" : "w-80 h-96"
            )}
          >
            {isMinimized ? (
              // Minimized state
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">HemoLink AI Assistant</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={minimizeChatbot}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={closeChatbot}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Full chatbot
              <Chatbot 
                isFloating={true} 
                isOpen={true} 
                onClose={closeChatbot}
                onMinimize={minimizeChatbot}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={toggleChatbot}
        className={cn(
          "w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group",
          isOpen && "rotate-45"
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, rotate: 90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -90 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              {/* Notification dot */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 2 }}
            className="absolute right-16 bottom-2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none"
          >
            Need help? Chat with AI Assistant
            <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-0 h-0 border-l-4 border-l-gray-900 border-t-4 border-t-transparent border-b-4 border-b-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default FloatingChatbot
