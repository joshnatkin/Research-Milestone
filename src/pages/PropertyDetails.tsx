import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ProgressBar } from '../components/ProgressBar'
import type { Property } from '../models'
import { occupancyPercent } from '../utils/metrics'
import { formatRent, parseLeasedBedrooms } from '../utils/properties'

interface PropertyDetailsProps {
  properties: Property[]
  warning?: string
  onSave: (id: string, count: number) => string | undefined
}

export function PropertyDetails({ properties, warning, onSave }: PropertyDetailsProps) {
  const { propertyId } = useParams()
  const { search } = useLocation()
  const property = properties.find((item) => item.id === propertyId)
  return <div className="space-y-6">
    <Link to={`/properties${search}`} className="inline-block text-sm font-medium text-teal-700">← Back to properties</Link>
    {warning && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{warning}</p>}
    {property ? <PropertyInformation key={property.id} property={property} onSave={onSave} /> : <h1 className="page-title">Property not found</h1>}
  </div>
}

function PropertyInformation({ property, onSave }: { property: Property; onSave: PropertyDetailsProps['onSave'] }) {
  const [editing, setEditing] = useState(false)
  const [input, setInput] = useState(String(property.leasedBedrooms))
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const occupancy = occupancyPercent(property.leasedBedrooms, property.totalBedrooms)
  const facts = [
    ['Academic year', property.academicYear], ['Total bedrooms', property.totalBedrooms],
    ['Leased bedrooms', property.leasedBedrooms], ['Available bedrooms', property.totalBedrooms - property.leasedBedrooms],
    ['Occupancy', `${occupancy.toFixed(1)}%`], ['Monthly rent per bedroom (rate)', formatRent(property.monthlyRentPerBedroom)],
    ['Monthly rent for entire house', formatRent(property.totalBedrooms * property.monthlyRentPerBedroom)], ['Leasing status', property.leasingStatus], ['Estimated monthly rental revenue', formatRent(property.leasedBedrooms * property.monthlyRentPerBedroom)],
  ]

  return <>
    <div><p className="eyebrow mb-2">PROPERTY DETAILS</p><h1 className="page-title">{property.name}</h1><p className="mt-2 text-sm text-slate-500">{property.address}</p></div>
    <section className="panel p-6" aria-label="Property information">
      <dl className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{facts.map(([label, value]) => <div key={label}><dt className="text-sm text-slate-500">{label}</dt><dd className="mt-2 text-lg font-semibold">{value}</dd></div>)}</dl>
      <div className="mt-7"><ProgressBar value={occupancy} label={`${property.name} occupancy`} /></div>
      <p className="mt-4 text-xs leading-5 text-slate-500">Revenue is an estimate: leased bedrooms × monthly rent per bedroom. It does not represent actual collected rent. Occupancy reflects leases for {property.academicYear}.</p>
    </section>
    <section className="panel p-6" aria-labelledby="leasing-heading">
      <h2 id="leasing-heading" className="text-lg font-semibold">Leasing information</h2>
      <p className="mt-2 text-sm text-slate-500">Each house is rented under one lease. Mark the entire house available or fully leased; individual bedrooms cannot be leased separately.</p>
      <p role="status" className="mt-3 text-sm text-teal-800">{message}</p>
      {editing ? <form noValidate className="mt-5 max-w-lg" onSubmit={(event) => {
        event.preventDefault()
        try {
          const count = parseLeasedBedrooms(input, property.totalBedrooms)
          const failure = onSave(property.id, count)
          if (failure) { setError(failure); return }
          setEditing(false)
          setError('')
          setMessage('Leasing changes saved. Your dashboard and portfolio now reflect the update.')
        } catch (failure) {
          setError(failure instanceof Error ? failure.message : 'Please check the leased-bedroom count.')
        }
      }}>
        <label htmlFor="leased-bedrooms" className="text-sm font-medium">House leasing status</label>
        <select id="leased-bedrooms" value={input} onChange={(event) => { setInput(event.target.value); setError('') }} aria-invalid={Boolean(error)} aria-describedby={`bedroom-help${error ? ' bedroom-error' : ''}`} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">
          <option value="0">Available — entire house</option>
          <option value={String(property.totalBedrooms)}>Fully leased — all {property.totalBedrooms} bedrooms</option>
        </select>
        <p id="bedroom-help" className="mt-2 text-xs text-slate-500">Current status: {property.leasingStatus}. This {property.totalBedrooms}-bedroom house is leased as one property.</p>
        {error && <p id="bedroom-error" role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        <div className="mt-5 flex gap-3"><button type="submit" className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800">Save changes</button><button type="button" onClick={() => { setEditing(false); setInput(String(property.leasedBedrooms)); setError('') }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium">Cancel</button></div>
      </form> : <button type="button" onClick={() => { setInput(String(property.leasedBedrooms)); setError(''); setMessage(''); setEditing(true) }} className="mt-4 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800">Edit leasing</button>}
    </section>
  </>
}
