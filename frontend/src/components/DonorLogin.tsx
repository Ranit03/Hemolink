import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useDonorAuth } from '../contexts/DonorAuthContext'

interface DonorLoginProps {
  onSuccess?: () => void
}

const DonorLogin: React.FC<DonorLoginProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useDonorAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const success = await login(email, password)
      if (success) {
        onSuccess?.()
        navigate('/donor-dashboard')
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } catch (error) {
      setError('Login failed. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Demo credentials helper
  const demoCredentials = [
    { name: 'Jane Smith', email: 'jane.smith@email.com', password: 'jane123' },
    { name: 'Amit Patel', email: 'amit.patel@email.com', password: 'amit123' },
    { name: 'Sunita Reddy', email: 'sunita.reddy@email.com', password: 'sunita123' }
  ]

  const fillDemoCredentials = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 gradient-bg flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white text-center">
            <Heart className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Donor Login</h2>
            <p className="text-red-100">Access your personal dashboard</p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Login to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-4">Demo Credentials:</h3>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    onClick={() => fillDemoCredentials(cred.email, cred.password)}
                    className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                  >
                    <div className="font-medium text-gray-900">{cred.name}</div>
                    <div className="text-gray-600">{cred.email}</div>
                    <div className="text-gray-500">Password: {cred.password}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Back Link */}
            <div className="mt-6 text-center">
              <a
                href="/demo"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to Demo Page
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DonorLogin
