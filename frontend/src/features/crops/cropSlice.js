import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cropsApi } from '../../api/crops'

export const fetchCrops       = createAsyncThunk('crops/list',          () => cropsApi.list().then(r => r.data))
export const fetchCrop        = createAsyncThunk('crops/get',           (id) => cropsApi.get(id).then(r => r.data))
export const createCrop       = createAsyncThunk('crops/create',        (data) => cropsApi.create(data).then(r => r.data))
export const updateCrop       = createAsyncThunk('crops/update',        ({ id, ...data }) => cropsApi.update(id, data).then(r => r.data))
export const deleteCrop       = createAsyncThunk('crops/delete',        (id) => cropsApi.remove(id).then(() => id))
export const addCropExpense   = createAsyncThunk('crops/addExpense',    ({ cropId, ...data }) => cropsApi.addExpense(cropId, data).then(r => r.data))
export const deleteCropExpense= createAsyncThunk('crops/deleteExpense', ({ cropId, expenseId }) => cropsApi.deleteExpense(cropId, expenseId).then(() => ({ cropId, expenseId })))

const cropSlice = createSlice({
  name: 'crops',
  initialState: { items: [], selected: null, loading: false, error: null },
  reducers: { clearSelected: (s) => { s.selected = null } },
  extraReducers: (builder) => {
    const load = (s) => { s.loading = true; s.error = null }
    const fail = (s, a) => { s.loading = false; s.error = a.error.message }

    builder
      .addCase(fetchCrops.pending,  load)
      .addCase(fetchCrops.fulfilled, (s, a) => { s.loading = false; s.items = a.payload.items })
      .addCase(fetchCrops.rejected,  fail)

      .addCase(fetchCrop.pending,  load)
      .addCase(fetchCrop.fulfilled, (s, a) => { s.loading = false; s.selected = a.payload })
      .addCase(fetchCrop.rejected,  fail)

      .addCase(createCrop.fulfilled, (s, a) => { s.items.unshift(a.payload) })

      .addCase(updateCrop.fulfilled, (s, a) => {
        const idx = s.items.findIndex(c => c.id === a.payload.id)
        if (idx !== -1) s.items[idx] = a.payload
        if (s.selected?.id === a.payload.id) s.selected = a.payload
      })

      .addCase(deleteCrop.fulfilled, (s, a) => { s.items = s.items.filter(c => c.id !== a.payload) })

      .addCase(addCropExpense.fulfilled, (s, a) => {
        const idx = s.items.findIndex(c => c.id === a.payload.id)
        if (idx !== -1) s.items[idx] = a.payload
        if (s.selected?.id === a.payload.id) s.selected = a.payload
      })
  },
})

export const { clearSelected } = cropSlice.actions
export default cropSlice.reducer
