import React from 'react'
import { Routes, Route } from 'react-router-dom'
import TypingPractice from './views/TypingPractice'
import AuthView from './views/AuthView'
import StatsView from './views/StatsView'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<TypingPractice />} />
      <Route path="/auth" element={<AuthView />} />
      <Route path="/stats" element={<StatsView />} />
    </Routes>
  )
}

export default App


