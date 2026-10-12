import { useState } from 'react'
import { Link, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Placeholder } from './pages/Placeholder'
import { Properties } from './pages/Properties'
import { PropertyDetails } from './pages/PropertyDetails'
import { loadPortfolio, savePortfolio } from './utils/storage'
import { updatePropertyLeasing } from './utils/properties'

export default function App() {
  const [portfolio, setPortfolio] = useState(loadPortfolio)

  function saveLeasing(id: string, count: number): string | undefined {
    try {
      const data = updatePropertyLeasing(portfolio.data, id, count)
      // Persist first: failed writes leave the shared state unchanged and the form open.
      savePortfolio(data)
      setPortfolio({ data })
      return undefined
    } catch (error) {
      return error instanceof Error ? error.message : 'Changes could not be saved. Please try again.'
    }
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard data={portfolio.data} warning={portfolio.warning} />} />
        <Route path="properties" element={<Properties properties={portfolio.data.properties} warning={portfolio.warning} />} />
        <Route path="properties/:propertyId" element={<PropertyDetails properties={portfolio.data.properties} warning={portfolio.warning} onSave={saveLeasing} />} />
        <Route path="maintenance" element={<Placeholder page="Maintenance" />} />
        <Route path="*" element={<><h1 className="page-title">Page not found</h1><Link className="mt-5 inline-block text-teal-700" to="/">Back to dashboard</Link></>} />
      </Route>
    </Routes>
  )
}
