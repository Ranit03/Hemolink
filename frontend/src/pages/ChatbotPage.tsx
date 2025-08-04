import React from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Bot, Heart, Users, Calendar, HelpCircle } from 'lucide-react'
import Chatbot from '../components/Chatbot'

const ChatbotPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 md:pt-24 gradient-bg">
      <div className="max-container container-padding section-padding">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>AI Assistant</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-bold text-secondary-900 mb-6"
            >
              HemoLink AI
              <span className="block text-gradient">Assistant</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-secondary-600 leading-relaxed max-w-2xl mx-auto"
            >
              Your intelligent companion for Thalassemia care, providing instant support for FAQs, 
              diet guidance, appointment booking, and donor assistance.
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <FeatureCard
              icon={<HelpCircle className="w-6 h-6" />}
              title="Thalassemia FAQs"
              description="Get instant answers to common questions about Thalassemia"
              color="from-blue-500 to-blue-600"
            />
            <FeatureCard
              icon={<Heart className="w-6 h-6" />}
              title="Diet & Care"
              description="Personalized nutrition and care guidance for better health"
              color="from-green-500 to-green-600"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6" />}
              title="Book Appointments"
              description="Schedule transfusions, consultations, and lab tests easily"
              color="from-purple-500 to-purple-600"
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Donor Support"
              description="Find compatible donors and get emergency blood assistance"
              color="from-red-500 to-red-600"
            />
          </motion.div>

          {/* Main Chatbot Interface */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className="h-[600px]">
              <Chatbot isFloating={false} />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center"
          >
            <h3 className="text-2xl font-bold text-secondary-900 mb-6">Quick Actions</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <QuickActionButton
                text="Emergency Blood Request"
                variant="emergency"
                onClick={() => {
                  // This would trigger the chatbot with emergency message
                  console.log('Emergency request triggered')
                }}
              />
              <QuickActionButton
                text="Schedule Transfusion"
                variant="primary"
                onClick={() => {
                  console.log('Schedule transfusion triggered')
                }}
              />
              <QuickActionButton
                text="Find Donors"
                variant="secondary"
                onClick={() => {
                  console.log('Find donors triggered')
                }}
              />
              <QuickActionButton
                text="Diet Guidelines"
                variant="accent"
                onClick={() => {
                  console.log('Diet guidelines triggered')
                }}
              />
            </div>
          </motion.div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
          >
            <div className="text-center">
              <Bot className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-secondary-900 mb-4">How to Use the AI Assistant</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                <div className="space-y-3">
                  <h4 className="font-semibold text-secondary-800">💬 Natural Conversation</h4>
                  <p className="text-secondary-600">
                    Simply type your questions in natural language. The AI understands context and provides relevant responses.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-secondary-800">🎯 Quick Options</h4>
                  <p className="text-secondary-600">
                    Use the suggested buttons for faster navigation to common topics and actions.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-secondary-800">🚨 Emergency Support</h4>
                  <p className="text-secondary-600">
                    Type "emergency" or "urgent" for immediate assistance and emergency blood requests.
                  </p>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-secondary-800">📱 Always Available</h4>
                  <p className="text-secondary-600">
                    The AI assistant is available 24/7 to help with your Thalassemia care needs.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="text-center mt-12">
            <a
              href="/"
              className="btn btn-secondary btn-lg mr-4"
            >
              ← Back to Home
            </a>
            <a
              href="/dashboard"
              className="btn btn-primary btn-lg"
            >
              📊 View Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, color }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-secondary-900 mb-2">{title}</h3>
      <p className="text-secondary-600 text-sm">{description}</p>
    </div>
  )
}

interface QuickActionButtonProps {
  text: string
  variant: 'primary' | 'secondary' | 'accent' | 'emergency'
  onClick: () => void
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ text, variant, onClick }) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'emergency':
        return 'bg-red-600 hover:bg-red-700 text-white'
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white'
      case 'secondary':
        return 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
      case 'accent':
        return 'bg-green-600 hover:bg-green-700 text-white'
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white'
    }
  }

  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg ${getVariantClasses()}`}
    >
      {text}
    </button>
  )
}

export default ChatbotPage
