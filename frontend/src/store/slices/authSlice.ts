import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/types/user'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  isAuthenticated: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.loading = false
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    clearUser: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.loading = false
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
})

export const { setUser, setToken, setLoading, clearUser, updateUserProfile } = authSlice.actions
export default authSlice.reducer
