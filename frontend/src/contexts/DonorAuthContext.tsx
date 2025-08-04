import React, { createContext, useContext, useState, useEffect } from 'react'

interface Donor {
  id: string
  name: string
  email: string
  bloodType: string
  location: string
  phone: string
}

interface AuthContextType {
  donor: Donor | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}

const DonorAuthContext = createContext<AuthContextType | undefined>(undefined)

export const useDonorAuth = () => {
  const context = useContext(DonorAuthContext)
  if (context === undefined) {
    throw new Error('useDonorAuth must be used within a DonorAuthProvider')
  }
  return context
}

interface DonorAuthProviderProps {
  children: React.ReactNode
}

export const DonorAuthProvider: React.FC<DonorAuthProviderProps> = ({ children }) => {
  const [donor, setDonor] = useState<Donor | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const savedDonor = localStorage.getItem('donorAuth')
    if (savedDonor) {
      try {
        const donorData = JSON.parse(savedDonor)
        setDonor(donorData)
      } catch (error) {
        console.error('Error parsing saved donor data:', error)
        localStorage.removeItem('donorAuth')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/donor/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        const donorData = result.data
        setDonor(donorData)
        localStorage.setItem('donorAuth', JSON.stringify(donorData))
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setDonor(null)
    localStorage.removeItem('donorAuth')
  }

  const value: AuthContextType = {
    donor,
    login,
    logout,
    isLoading,
    isAuthenticated: !!donor,
  }

  return (
    <DonorAuthContext.Provider value={value}>
      {children}
    </DonorAuthContext.Provider>
  )
}

export default DonorAuthContext
