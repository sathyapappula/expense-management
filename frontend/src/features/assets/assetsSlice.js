import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { loansApi, investmentsApi } from '../../api/assets'
import { message } from 'antd'

// ── Loans ─────────────────────────────────────────────────────────
export const fetchLoans      = createAsyncThunk('assets/fetchLoans',      async (_, { rejectWithValue }) => { try { return (await loansApi.list()).data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const createLoan      = createAsyncThunk('assets/createLoan',      async (data, { rejectWithValue }) => { try { const r = await loansApi.create(data); message.success('Loan added'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const updateLoan      = createAsyncThunk('assets/updateLoan',      async ({ id, ...data }, { rejectWithValue }) => { try { const r = await loansApi.update(id, data); message.success('Loan updated'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const deleteLoan      = createAsyncThunk('assets/deleteLoan',      async (id, { rejectWithValue }) => { try { await loansApi.delete(id); message.success('Loan deleted'); return id } catch (e) { return rejectWithValue(e.response?.data?.detail) } })

// ── Investments ───────────────────────────────────────────────────
export const fetchInvestments  = createAsyncThunk('assets/fetchInvestments',  async (_, { rejectWithValue }) => { try { return (await investmentsApi.list()).data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const createInvestment  = createAsyncThunk('assets/createInvestment',  async (data, { rejectWithValue }) => { try { const r = await investmentsApi.create(data); message.success('Investment added'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const updateInvestment  = createAsyncThunk('assets/updateInvestment',  async ({ id, ...data }, { rejectWithValue }) => { try { const r = await investmentsApi.update(id, data); message.success('Investment updated'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const deleteInvestment  = createAsyncThunk('assets/deleteInvestment',  async (id, { rejectWithValue }) => { try { await investmentsApi.delete(id); message.success('Investment deleted'); return id } catch (e) { return rejectWithValue(e.response?.data?.detail) } })


const assetsSlice = createSlice({
  name: 'assets',
  initialState: {
    loans: [], investments: [], loading: false, error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const pending   = (state) => { state.loading = true }
    const rejected  = (state, a) => { state.loading = false; state.error = a.payload }

    builder
      // Loans
      .addCase(fetchLoans.pending, pending)
      .addCase(fetchLoans.fulfilled, (s, a) => { s.loading = false; s.loans = a.payload.items })
      .addCase(fetchLoans.rejected, rejected)
      .addCase(createLoan.fulfilled, (s, a) => { s.loans.unshift(a.payload) })
      .addCase(updateLoan.fulfilled, (s, a) => { const i = s.loans.findIndex(x => x.id === a.payload.id); if (i >= 0) s.loans[i] = a.payload })
      .addCase(deleteLoan.fulfilled, (s, a) => { s.loans = s.loans.filter(x => x.id !== a.payload) })
      // Investments
      .addCase(fetchInvestments.pending, pending)
      .addCase(fetchInvestments.fulfilled, (s, a) => { s.loading = false; s.investments = a.payload.items })
      .addCase(fetchInvestments.rejected, rejected)
      .addCase(createInvestment.fulfilled, (s, a) => { s.investments.unshift(a.payload) })
      .addCase(updateInvestment.fulfilled, (s, a) => { const i = s.investments.findIndex(x => x.id === a.payload.id); if (i >= 0) s.investments[i] = a.payload })
      .addCase(deleteInvestment.fulfilled, (s, a) => { s.investments = s.investments.filter(x => x.id !== a.payload) })
  },
})

export default assetsSlice.reducer
