import { ArrowLeft, Building2, Wrench } from 'lucide-react'
import { Link } from 'react-router'

export function Placeholder({ page }: { page: 'Properties' | 'Maintenance' }) {
  const Icon = page === 'Properties' ? Building2 : Wrench
  return (
    <>
      <h1 className="page-title">{page}</h1>
      <section className="panel mt-8 flex flex-col items-center px-6 py-20 text-center">
        <div className="rounded-2xl bg-teal-50 p-4 text-teal-700"><Icon size={30} aria-hidden="true" /></div>
        <p className="eyebrow mt-6">COMING NEXT</p>
        <h2 className="mt-3 text-xl font-semibold">A home for your {page.toLowerCase()}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{page === 'Properties' ? 'Property details and management will be implemented in a future stage.' : 'Maintenance tracking and request forms will be implemented in a future stage.'} For now, explore the portfolio overview on your dashboard.</p>
        <Link to="/" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-teal-700"><ArrowLeft size={16} />Back to dashboard</Link>
      </section>
    </>
  )
}
