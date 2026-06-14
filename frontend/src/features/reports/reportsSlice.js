import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { reportsApi } from '../../api/reports'
import { downloadBlob } from '../../utils/formatters'
import { message } from 'antd'

export const downloadReport = createAsyncThunk('reports/download', async (params, { rejectWithValue }) => {
  try {
    const { data } = await reportsApi.download(params)
    const ext = params.format === 'excel' ? 'xlsx' : params.format
    downloadBlob(data, `finance_report_${params.report_type}.${ext}`)
    message.success(`Report downloaded as ${ext.toUpperCase()}`)
    return true
  } catch (err) {
    message.error('Failed to generate report')
    return rejectWithValue('Failed to generate report')
  }
})

const reportsSlice = createSlice({
  name: 'reports',
  initialState: { loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(downloadReport.pending, (state) => { state.loading = true })
      .addCase(downloadReport.fulfilled, (state) => { state.loading = false })
      .addCase(downloadReport.rejected, (state, action) => { state.loading = false; state.error = action.payload })
  },
})
export default reportsSlice.reducer
