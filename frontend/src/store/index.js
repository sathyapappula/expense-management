import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import dashboardReducer from '../features/dashboard/dashboardSlice'
import incomeReducer from '../features/income/incomeSlice'
import expenseReducer from '../features/expenses/expenseSlice'
import budgetReducer from '../features/budgets/budgetSlice'
import reportsReducer from '../features/reports/reportsSlice'
import cropsReducer from '../features/crops/cropSlice'
import assetsReducer from '../features/assets/assetsSlice'
import ccReducer from '../features/creditcards/creditCardsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    income: incomeReducer,
    expense: expenseReducer,
    budget: budgetReducer,
    reports: reportsReducer,
    crops: cropsReducer,
    assets: assetsReducer,
    cc: ccReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
})
