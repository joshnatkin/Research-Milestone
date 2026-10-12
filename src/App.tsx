import { useState } from 'react'
import { Link, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Placeholder } from './pages/Placeholder'
import { loadPortfolio } from './utils/storage'

export default function App() {
  const [portfolio] = useState(loadPortfolio)
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard data={portfolio.data} warning={portfolio.warning} />} />
        <Route path="properties" element={<Placeholder page="Properties" />} />
        <Route path="maintenance" element={<Placeholder page="Maintenance" />} />
        <Route path="*" element={<><h1 className="page-title">Page not found</h1><Link className="mt-5 inline-block text-teal-700" to="/">Back to dashboard</Link></>} />
      </Route>
    </Routes>
  )
}
