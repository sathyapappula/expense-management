import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { budgetApi } from '../../api/budgets'
import { message } from 'antd'

export const fetchBudgets = createAsyncThunk('budget/fetch', async (params, { rejectWithValue }) => {
  try { const { data } = await budgetApi.list(params); return data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Failed') }
})
export const fetchBudgetByMonth = createAsyncThunk('budget/fetchByMonth', async ({ year, month }, { rejectWithValue }) => {
  try { const { data } = await budgetApi.getByMonth(year, month); return data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Failed') }
})
export const createBudget = createAsyncThunk('budget/create', async (payload, { rejectWithValue }) => {
  try { const { data } = await budgetApi.create(payload); message.success('Budget set'); return data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Failed') }
})
export const updateBudget = createAsyncThunk('budget/update', async ({ id, ...payload }, { rejectWithValue }) => {
  try { const { data } = await budgetApi.update(id, payload); message.success('Budget updated'); return data }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Failed') }
})
export const deleteBudget = createAsyncThunk('budget/delete', async (id, { rejectWithValue }) => {
  try { await budgetApi.delete(id); message.success('Budget deleted'); return id }
  catch (err) { return rejectWithValue(err.response?.data?.detail || 'Failed') }
})

const budgetSlice = createSlice({
  name: 'budget',
  initialState: { items: [], monthItems: [], total: 0, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => { state.loading = true })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchBudgetByMonth.fulfilled, (state, action) => { state.monthItems = action.payload })
      .addCase(fetchBudgets.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})
export default budgetSlice.reducer
