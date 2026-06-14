import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../../api/auth'
import { message } from 'antd'

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authApi.login(credentials)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Login failed')
  }
})

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await authApi.register(formData)
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Registration failed')
  }
})

export const restoreSession = createAsyncThunk('auth/restore', async (_, { rejectWithValue }) => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')
  if (token && user) {
    return { access_token: token, user: JSON.parse(user) }
  }
  return rejectWithValue('No session')
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    loading: true,
    error: null,
  },
  reducers: {
    logout(state) {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => { state.loading = true })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.token = action.payload.access_token
        state.user = action.payload.user
        state.loading = false
      })
      .addCase(restoreSession.rejected, (state) => { state.loading = false })
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.token = action.payload.access_token
        state.user = action.payload.user
        state.loading = false
        message.success('Welcome back!')
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.token = action.payload.access_token
        state.user = action.payload.user
        state.loading = false
        message.success('Account created successfully!')
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
