import ChatSystem from '@/components/ChatRoom'
import Layout from '@/components/layout/Layout'
import Home from '@/public/Home'
import { Route, Routes } from 'react-router-dom'

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout/>}>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<ChatSystem />} />
      </Route>
    </Routes>
  ) 
}

export default AppRoutes