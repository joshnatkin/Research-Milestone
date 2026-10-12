import { useState } from 'react'
import { ClipboardList, Clock3, CircleCheck, Wrench } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { MetricCard } from '../components/MetricCard'
import type { PortfolioData } from '../models'
import { filterMaintenance, maintenanceSummary, priorities, statuses } from '../utils/maintenance'
import type { MaintenanceDraft } from '../utils/maintenance'

interface MaintenanceProps {
  data: PortfolioData
  warning?: string
  onCreate: (draft: MaintenanceDraft) => string | undefined
  onStatusChange: (id: string, status: string) => string | undefined
}

const priorityColors = { Low: 'bg-slate-100 text-slate-700', Medium: 'bg-amber-50 text-amber-800', High: 'bg-red-50 text-red-800' }
const statusColors = { Open: 'bg-amber-50 text-amber-800', 'In progress': 'bg-blue-50 text-blue-800', Resolved: 'bg-teal-50 text-teal-800' }
const controlClass = 'mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 font-normal'
const emptyDraft: MaintenanceDraft = { propertyId: '', description: '', priority: 'Medium' }

export function Maintenance({ data, warning, onCreate, onStatusChange }: MaintenanceProps) {
  const [params, setParams] = useSearchParams()
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<MaintenanceDraft>(emptyDraft)
  const [formError, setFormError] = useState('')
  const [statusError, setStatusError] = useState('')
  const [message, setMessage] = useState('')
  const status = params.get('status') ?? ''
  const priority = params.get('priority') ?? ''
  const propertyId = params.get('property') ?? ''
  const summary = maintenanceSummary(data.maintenanceRequests)
  const displayed = filterMaintenance(data.maintenanceRequests, status, priority, propertyId)
  const houses = new Map(data.properties.map((property) => [property.id, property.name]))

  function setFilter(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }

  return <div className="space-y-7">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow mb-2">CARE FOR EVERY HOUSE</p><h1 className="page-title">Maintenance</h1><p className="mt-2 text-sm text-slate-500">Create requests and track repairs across your rental houses.</p></div>
      {!creating && <button type="button" onClick={() => { setCreating(true); setDraft(emptyDraft); setFormError(''); setMessage('') }} className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800">Create request</button>}
    </div>
    {warning && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-900">{warning}</p>}
    <section aria-label="Maintenance summary" className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <MetricCard label="Total requests" value={summary.total} detail="Across all houses" icon={ClipboardList} />
      <MetricCard label="Open requests" value={summary.open} detail="Awaiting attention" icon={Wrench} />
      <MetricCard label="In-progress requests" value={summary.inProgress} detail="Work underway" icon={Clock3} />
      <MetricCard label="Resolved requests" value={summary.resolved} detail="Completed repairs" icon={CircleCheck} />
    </section>
    <p role="status" className="text-sm text-teal-800">{message}</p>
    {creating && <section className="panel p-6" aria-labelledby="create-heading">
      <h2 id="create-heading" className="text-lg font-semibold">Create maintenance request</h2>
      <form noValidate className="mt-5 space-y-4" onSubmit={(event) => {
        event.preventDefault()
        const error = onCreate(draft)
        if (error) { setFormError(error); return }
        setCreating(false)
        setDraft(emptyDraft)
        setFormError('')
        setParams({}, { replace: true })
        setMessage('Request created and saved as Open. Filters cleared to show your new request.')
      }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium">House<select required value={draft.propertyId} onChange={(event) => setDraft({ ...draft, propertyId: event.target.value })} className={controlClass}><option value="">Choose a house</option>{data.properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>
          <label className="text-sm font-medium">Priority<select required value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value })} className={controlClass}>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <label className="block text-sm font-medium">Request description<textarea required rows={3} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Describe the issue at this house" className={controlClass} /></label>
        <p className="text-xs text-slate-500">New requests start as Open. Enter only fictional information for this demo.</p>
        {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
        <div className="flex gap-3"><button type="submit" className="rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800">Submit request</button><button type="button" onClick={() => { setCreating(false); setDraft(emptyDraft); setFormError('') }} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium">Cancel</button></div>
      </form>
    </section>}
    <section className="panel p-5" aria-label="Maintenance filters">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="text-sm font-medium">Status<select value={status} onChange={(event) => setFilter('status', event.target.value)} className={controlClass}><option value="">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">Priority<select value={priority} onChange={(event) => setFilter('priority', event.target.value)} className={controlClass}><option value="">All priorities</option>{priorities.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-sm font-medium">House<select value={propertyId} onChange={(event) => setFilter('property', event.target.value)} className={controlClass}><option value="">All properties</option>{data.properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}</select></label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm"><p role="status" className="text-slate-500">Showing {displayed.length} of {summary.total} requests. Summary cards include all requests.</p><button type="button" onClick={() => setParams({}, { replace: true })} className="font-medium text-teal-700">Clear filters</button></div>
    </section>
    {statusError && <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{statusError}</p>}
    <section className="panel overflow-hidden" aria-label="Maintenance requests">
      <div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm">
        <caption className="sr-only">Maintenance requests matching the selected filters</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600"><tr>{['Request description', 'House', 'Priority', 'Status', 'Actions'].map((heading) => <th key={heading} scope="col" className="px-5 py-4 font-medium">{heading}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{displayed.map((request) => <tr key={request.id} className="hover:bg-slate-50/70">
          <th scope="row" className="max-w-sm px-5 py-5 font-medium whitespace-pre-wrap break-words">{request.description}</th>
          <td className="px-5 py-5">{houses.get(request.propertyId)}</td>
          <td className="px-5 py-5"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${priorityColors[request.priority]}`}>{request.priority}</span></td>
          <td className="px-5 py-5"><span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[request.status]}`}>{request.status}</span></td>
          <td className="px-5 py-5"><select aria-label={`Update status: ${request.description} (${houses.get(request.propertyId)})`} value={request.status} onChange={(event) => {
            setMessage('')
            const error = onStatusChange(request.id, event.target.value)
            setStatusError(error ?? '')
            if (!error) setMessage(`Request for ${houses.get(request.propertyId)} saved as ${event.target.value}. It may no longer match your filters.`)
          }} className="rounded-lg border border-slate-300 bg-white px-3 py-2">{statuses.map((item) => <option key={item}>{item}</option>)}</select></td>
        </tr>)}</tbody>
      </table></div>
      {displayed.length === 0 && <div className="px-6 py-14 text-center"><h2 className="font-semibold">{summary.total === 0 ? 'No maintenance requests yet' : 'No requests match your filters'}</h2><p className="mt-2 text-sm text-slate-500">{summary.total === 0 ? 'Create a request to start tracking repairs at your houses.' : 'Try a different status, priority, or house, or clear the filters.'}</p></div>}
    </section>
  </div>
}
