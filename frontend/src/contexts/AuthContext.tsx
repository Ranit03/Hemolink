import React, { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

import { RootState } from '@/store'
import { setUser, clearUser, setLoading } from '@/store/slices/authSlice'
import { authService } from '@/services/authService'
import { User } from '@/types/user'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: 'PATIENT' | 'DONOR' | 'HEALTHCARE_PROVIDER'
  dateOfBirth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch()
  const { user, loading } = useSelector((state: RootState) => state.auth)
  const [initialized, setInitialized] = useState(false)

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token')

      if (token) {
        try {
          dispatch(setLoading(true))
          const userData = await authService.getCurrentUser()
          dispatch(setUser(userData))
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          localStorage.removeItem('token')
          dispatch(clearUser())
        } finally {
          dispatch(setLoading(false))
        }
      } else {
        dispatch(setLoading(false))
      }

      setInitialized(true)
    }

    initializeAuth()
  }, [dispatch])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      dispatch(setLoading(true))
      const response = await authService.login(email, password)

      localStorage.setItem('token', response.token)
      dispatch(setUser(response.user))

      toast.success('Login successful!')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      dispatch(setLoading(true))
      const response = await authService.register(userData)

      localStorage.setItem('token', response.token)
      dispatch(setUser(response.user))

      toast.success('Registration successful!')
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Registration failed'
      toast.error(message)
      throw error
    } finally {
      dispatch(setLoading(false))
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch(clearUser())
      toast.info('Logged out successfully')
    }
  }

  const updateUser = (userData: Partial<User>): void => {
    if (user) {
      dispatch(setUser({ ...user, ...userData }))
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authService.getCurrentUser()
      dispatch(setUser(userData))
    } catch (error) {
      console.error('Failed to refresh user:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading: loading || !initialized,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
