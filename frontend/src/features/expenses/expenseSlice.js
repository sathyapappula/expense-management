import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { expenseApi } from '../../api/expenses'
import { message } from 'antd'

export const fetchExpenses = createAsyncThunk('expense/fetch', async (params, { rejectWithValue }) => {
  try {
    const { data } = await expenseApi.list(params)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to load expenses')
  }
})

export const createExpense = createAsyncThunk('expense/create', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await expenseApi.create(payload)
    message.success('Expense added successfully')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to add expense')
  }
})

export const updateExpense = createAsyncThunk('expense/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    const { data } = await expenseApi.update(id, payload)
    message.success('Expense updated')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to update expense')
  }
})

export const deleteExpense = createAsyncThunk('expense/delete', async (id, { rejectWithValue }) => {
  try {
    await expenseApi.delete(id)
    message.success('Expense deleted')
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to delete expense')
  }
})

const expenseSlice = createSlice({
  name: 'expense',
  initialState: { items: [], total: 0, page: 1, page_size: 20, total_pages: 1, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.loading = true })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.loading = false
        Object.assign(state, action.payload)
      })
      .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})

export default expenseSlice.reducer
