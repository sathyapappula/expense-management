import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { dashboardApi } from '../../api/dashboard'

export const fetchDashboard = createAsyncThunk('dashboard/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await dashboardApi.get()
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to load dashboard')
  }
})

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState: { data: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => { state.loading = true; state.error = null })
      .addCase(fetchDashboard.fulfilled, (state, action) => { state.data = action.payload; state.loading = false })
      .addCase(fetchDashboard.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export default dashboardSlice.reducer
