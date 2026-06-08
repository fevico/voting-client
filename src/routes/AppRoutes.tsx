import Layout from '@/components/layout/Layout'
import Home from '@/public/Home'
import { Route, Routes } from 'react-router-dom'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout/>}>
      <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  ) 
}

export default AppRoutes