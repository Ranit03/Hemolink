import React from 'react'
import { Navigate } from 'react-router-dom'
import { useDonorAuth } from '../contexts/DonorAuthContext'
import { Heart } from 'lucide-react'

interface ProtectedDonorRouteProps {
  children: React.ReactNode
}

const ProtectedDonorRoute: React.FC<ProtectedDonorRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useDonorAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 md:pt-24 gradient-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/donor-login" replace />
  }

  return <>{children}</>
}

export default ProtectedDonorRoute
