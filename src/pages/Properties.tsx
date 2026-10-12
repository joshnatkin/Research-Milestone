import { Link, useSearchParams } from 'react-router'
import { ProgressBar } from '../components/ProgressBar'
import type { Property } from '../models'
import { occupancyPercent } from '../utils/metrics'
import { filterProperties, formatRent } from '../utils/properties'

export function Properties({ properties, warning }: { properties: Property[]; warning?: string }) {
  const [params, setParams] = useSearchParams()
  const search = params.get('search') ?? ''
  const status = params.get('status') ?? ''
  const year = params.get('year') ?? ''
  const years = [...new Set(properties.map((property) => property.academicYear))].sort().reverse()
  const displayed = filterProperties(properties, search, status, year)
  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return <div className="space-y-7">
    <div><p className="eyebrow mb-2">YOUR STUDENT HOUSING PORTFOLIO</p><h1 className="page-title">Properties</h1><p className="mt-2 text-sm text-slate-500">Manage your 3–6 bedroom rental houses. Each house is either entirely available or fully leased.</p></div>
    {warning && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{warning}</p>}
    <section className="panel p-5" aria-label="Property filters">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr]">
        <label className="text-sm font-medium">Search properties<input type="search" value={search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Search by name or address" className="mt-2 block w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal" /></label>
        <label className="text-sm font-medium">Leasing status<select value={status} onChange={(event) => setFilter('status', event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="">All statuses</option><option>Available</option><option>Fully leased</option></select></label>
        <label className="text-sm font-medium">Academic year<select value={year} onChange={(event) => setFilter('year', event.target.value)} className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal"><option value="">All years</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm"><p role="status" className="text-slate-500">Showing {displayed.length} of {properties.length} properties</p><button type="button" onClick={() => setParams({}, { replace: true })} className="font-medium text-teal-700">Clear filters</button></div>
    </section>
    <section className="panel overflow-hidden" aria-label="Portfolio properties">
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm">
        <caption className="sr-only">Properties matching the selected filters. Rent is in USD per bedroom per month.</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600"><tr>{['Property / address', 'Year', 'Bedrooms', 'Leased', 'Available', 'Occupancy', 'Rent / bedroom', 'Status', 'Details'].map((heading) => <th key={heading} scope="col" className="px-4 py-4 font-medium">{heading}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{displayed.map((property) => {
          const occupancy = occupancyPercent(property.leasedBedrooms, property.totalBedrooms)
          return <tr key={property.id} className="hover:bg-slate-50/70">
            <th scope="row" className="px-4 py-5 font-normal"><p className="font-semibold">{property.name}</p><p className="mt-1 text-xs text-slate-500">{property.address}</p></th>
            <td className="px-4 py-5 whitespace-nowrap">{property.academicYear}</td>
            <td className="px-4 py-5">{property.totalBedrooms}</td><td className="px-4 py-5">{property.leasedBedrooms}</td><td className="px-4 py-5">{property.totalBedrooms - property.leasedBedrooms}</td>
            <td className="min-w-32 px-4 py-5"><p className="mb-2 text-xs">{occupancy.toFixed(1)}%</p><ProgressBar value={occupancy} label={`${property.name} occupancy`} /></td>
            <td className="px-4 py-5">{formatRent(property.monthlyRentPerBedroom)}</td>
            <td className="px-4 py-5"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${property.leasingStatus === 'Fully leased' ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}>{property.leasingStatus}</span></td>
            <td className="px-4 py-5"><Link to={{ pathname: `/properties/${encodeURIComponent(property.id)}`, search: params.toString() }} className="whitespace-nowrap font-medium text-teal-700" aria-label={`View details for ${property.name}`}>View details</Link></td>
          </tr>
        })}</tbody>
      </table></div>
      {displayed.length === 0 && <div className="px-6 py-14 text-center"><h2 className="font-semibold">No properties match your filters</h2><p className="mt-2 text-sm text-slate-500">Try a different name or address, or clear the filters to see your portfolio.</p></div>}
    </section>
  </div>
}
