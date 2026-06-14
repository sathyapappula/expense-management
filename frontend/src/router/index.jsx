import { createBrowserRouter } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import ResponsiveLayout from '../layouts/ResponsiveLayout'
import AuthLayout from '../layouts/AuthLayout'
import Login from '../features/auth/Login'
import Register from '../features/auth/Register'
import Dashboard from '../features/dashboard/Dashboard'
import IncomeList from '../features/income/IncomeList'
import ExpenseList from '../features/expenses/ExpenseList'
import BudgetPlanner from '../features/budgets/BudgetPlanner'
import Reports from '../features/reports/Reports'
import CropList from '../features/crops/CropList'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <ResponsiveLayout />,
        children: [
          { index: true,       element: <Dashboard /> },
          { path: 'income',    element: <IncomeList /> },
          { path: 'expenses',  element: <ExpenseList /> },
          { path: 'budget',    element: <BudgetPlanner /> },
          { path: 'reports',   element: <Reports /> },
          { path: 'crops',     element: <CropList /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login',    element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
])
