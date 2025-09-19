import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/dashboard.jsx'
import { RouterProvider, Router, createBrowserRouter, createRoutesFromElements, Route, BrowserRouter, Navigate, Routes } from 'react-router-dom'
import PrivateRoute from './components/PrivateRoute.jsx'
import AdminLogin from './pages/AdminLogin.jsx'
import ItemView from './pages/ItemView.jsx'
import Item from './pages/Item.jsx'
import CiplTemplate from './components/CiplTemplate.jsx'

// import AskRole from './pages/AskRole.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/'>
      <Route path='' element={<Navigate to="/dashboard" />} />
      <Route path='login' element={<AdminLogin />} />
      <Route path='dashboard' element={<PrivateRoute>
        <Dashboard />
      </PrivateRoute>} />
      <Route path='item/:assetId' element={<Item />} />
      <Route path='item-view/:assetId' element={
        <ItemView />
      } />
    <Route path='/cipl' element={
      <CiplTemplate />
    } /> 
    </Route>
    
  )
)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
