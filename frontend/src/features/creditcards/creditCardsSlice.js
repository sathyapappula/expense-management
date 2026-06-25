import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { creditCardsApi } from '../../api/creditCards'
import { message } from 'antd'

export const fetchCards     = createAsyncThunk('cc/fetchCards',   async (_, { rejectWithValue }) => { try { return (await creditCardsApi.listCards()).data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const createCard     = createAsyncThunk('cc/createCard',   async (data, { rejectWithValue }) => { try { const r = await creditCardsApi.createCard(data); message.success('Card added'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const updateCard     = createAsyncThunk('cc/updateCard',   async ({ id, ...data }, { rejectWithValue }) => { try { const r = await creditCardsApi.updateCard(id, data); message.success('Card updated'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const deleteCard     = createAsyncThunk('cc/deleteCard',   async (id, { rejectWithValue }) => { try { await creditCardsApi.deleteCard(id); message.success('Card deleted'); return id } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const fetchBills     = createAsyncThunk('cc/fetchBills',   async (cardId, { rejectWithValue }) => { try { return (await creditCardsApi.listBills(cardId)).data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const addBill        = createAsyncThunk('cc/addBill',      async (data, { rejectWithValue }) => { try { const r = await creditCardsApi.addBill(data); message.success('Bill added'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const deleteBill     = createAsyncThunk('cc/deleteBill',   async (id, { rejectWithValue }) => { try { await creditCardsApi.deleteBill(id); message.success('Bill deleted'); return id } catch (e) { return rejectWithValue(e.response?.data?.detail) } })
export const payBill        = createAsyncThunk('cc/payBill',      async ({ id, ...data }, { rejectWithValue }) => { try { const r = await creditCardsApi.payBill(id, data); message.success('Bill paid! Expense recorded.'); return r.data } catch (e) { return rejectWithValue(e.response?.data?.detail) } })

const ccSlice = createSlice({
  name: 'cc',
  initialState: { cards: [], bills: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    const pending  = (s) => { s.loading = true }
    const rejected = (s, a) => { s.loading = false; s.error = a.payload }
    builder
      .addCase(fetchCards.pending, pending)
      .addCase(fetchCards.fulfilled, (s, a) => { s.loading = false; s.cards = a.payload.items })
      .addCase(fetchCards.rejected, rejected)
      .addCase(createCard.fulfilled, (s, a) => { s.cards.unshift(a.payload) })
      .addCase(updateCard.fulfilled, (s, a) => { const i = s.cards.findIndex(x => x.id === a.payload.id); if (i >= 0) s.cards[i] = a.payload })
      .addCase(deleteCard.fulfilled, (s, a) => { s.cards = s.cards.filter(x => x.id !== a.payload) })
      .addCase(fetchBills.pending, pending)
      .addCase(fetchBills.fulfilled, (s, a) => { s.loading = false; s.bills = a.payload.items })
      .addCase(fetchBills.rejected, rejected)
      .addCase(addBill.fulfilled, (s, a) => { s.bills.unshift(a.payload) })
      .addCase(deleteBill.fulfilled, (s, a) => { s.bills = s.bills.filter(x => x.id !== a.payload) })
      .addCase(payBill.fulfilled, (s, a) => { const i = s.bills.findIndex(x => x.id === a.payload.id); if (i >= 0) s.bills[i] = a.payload })
  },
})

export default ccSlice.reducer
