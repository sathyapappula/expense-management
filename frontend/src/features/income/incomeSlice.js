import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { incomeApi } from '../../api/income'
import { message } from 'antd'

export const fetchIncome = createAsyncThunk('income/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await incomeApi.list(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to load income')
  }
})

export const createIncome = createAsyncThunk('income/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await incomeApi.create(payload)
    message.success('Income added successfully')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to create income')
  }
})

export const updateIncome = createAsyncThunk('income/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await incomeApi.update(id, payload)
    message.success('Income updated successfully')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to update income')
  }
})

export const deleteIncome = createAsyncThunk('income/delete', async (id, { rejectWithValue }) => {
  try {
    await incomeApi.delete(id)
    message.success('Income deleted')
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to delete income')
  }
})

const incomeSlice = createSlice({
  name: 'income',
  initialState: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.pending, (state) => { state.loading = true })
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.page_size = action.payload.page_size
        state.total_pages = action.payload.total_pages
      })
      .addCase(fetchIncome.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export default incomeSlice.reducer
