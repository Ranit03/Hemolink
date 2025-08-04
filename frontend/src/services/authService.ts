import axios from 'axios'
import { User } from '@/types/user'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

interface LoginResponse {
  user: User
  token: string
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

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email, password })
    return response.data.data
  },

  async register(userData: RegisterData): Promise<LoginResponse> {
    const response = await api.post('/auth/register', userData)
    return response.data.data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me')
    return response.data.data.user
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    })
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword })
  },

  async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token })
  },

  async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification')
  },
}

export default authService
