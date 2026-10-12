import { useState } from 'react'
import { ArrowUpRight, BedDouble, Building2, CalendarDays, CheckCheck, DoorOpen, GraduationCap, Percent, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { MetricCard } from '../components/MetricCard'
import { ProgressBar } from '../components/ProgressBar'
import { ACADEMIC_YEAR } from '../data/mockData'
import type { PortfolioData } from '../models'
import { calculateMetrics, occupancyPercent } from '../utils/metrics'

export function Dashboard({ data, warning }: { data: PortfolioData; warning?: string }) {
  const years = [...new Set(data.properties.map((property) => property.academicYear))].sort().reverse()
  const [year, setYear] = useState(years.includes(ACADEMIC_YEAR) ? ACADEMIC_YEAR : years[0] ?? ACADEMIC_YEAR)
  const properties = data.properties.filter((property) => property.academicYear === year)
  const metrics = calculateMetrics(properties, data.maintenanceRequests)
  const fullyLeased = properties.filter((property) => property.leasedBedrooms === property.totalBedrooms).length

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow mb-2">YOUR PORTFOLIO, AT A GLANCE</p>
          <h1 className="page-title">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">A little clarity for the next academic chapter.</p>
        </div>
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm">
          <CalendarDays size={17} className="text-teal-700" aria-hidden="true" />
          <span className="sr-only">Academic year</span>
          <select value={year} onChange={(event) => setYear(event.target.value)} className="bg-transparent font-medium">
            {(years.length ? years : [ACADEMIC_YEAR]).map((academicYear) => <option key={academicYear} value={academicYear}>{academicYear}</option>)}
          </select>
        </label>
      </div>

      {warning && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{warning}</p>}

      <section aria-label="Portfolio metrics" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6 xl:gap-4">
        <MetricCard label="Total properties" value={metrics.totalProperties} detail="In this academic year" icon={Building2} />
        <MetricCard label="Total bedrooms" value={metrics.totalBedrooms} detail="Across your portfolio" icon={BedDouble} />
        <MetricCard label="Leased bedrooms" value={metrics.leasedBedrooms} detail="For the selected year" icon={CheckCheck} />
        <MetricCard label="Available bedrooms" value={metrics.availableBedrooms} detail="Ready for their next chapter" icon={DoorOpen} />
        <MetricCard label="Portfolio occupancy" value={`${metrics.occupancy.toFixed(1)}%`} detail="Based on leased bedrooms" icon={Percent} />
        <MetricCard label="Open maintenance" value={metrics.openMaintenance} detail="Open + in progress" icon={Wrench} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.8fr_1fr]" aria-label="Leasing summary">
        <article className="panel p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="text-lg font-semibold">Leasing progress</h2><p className="mt-1 text-sm text-slate-500">Preparing for the {year} academic year</p></div>
            <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">Academic year leasing</span>
          </div>
          <div className="mb-4 mt-7 flex items-baseline gap-2"><span className="text-4xl font-semibold tracking-tight tabular-nums">{metrics.occupancy.toFixed(1)}%</span><span className="text-sm text-slate-500">leased</span></div>
          <ProgressBar value={metrics.occupancy} label={`Portfolio leasing for ${year}`} />
          <div className="mt-4 flex flex-wrap justify-between gap-3 text-sm">
            <p className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-teal-600" />{metrics.leasedBedrooms} leased bedrooms</p>
            <p className="text-slate-500">{metrics.availableBedrooms} of {metrics.totalBedrooms} still available</p>
          </div>
        </article>
        <article className="relative overflow-hidden rounded-xl bg-[#e8f1ee] p-6 sm:p-7">
          <GraduationCap size={30} className="text-teal-800" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-[#214b43]">Room for what’s next.</h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[#49675f]">{fullyLeased} of {metrics.totalProperties} properties are fully leased. Keep an eye on availability as the next academic year approaches.</p>
          <Link to="/properties" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-teal-900">Explore properties <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </article>
      </section>

      <section className="panel overflow-hidden" aria-labelledby="portfolio-heading">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div><h2 id="portfolio-heading" className="text-lg font-semibold">Portfolio overview</h2><p className="mt-1 text-sm text-slate-500">Every property. One clear picture.</p></div>
          <span className="text-xs font-medium text-slate-500">{properties.length} properties · {year}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Properties and bedroom occupancy for {year}</caption>
            <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500"><tr>
              <th scope="col" className="px-6 py-3 font-medium">Property</th>
              <th scope="col" className="px-4 py-3 font-medium">Bedrooms</th>
              <th scope="col" className="px-4 py-3 font-medium">Leased</th>
              <th scope="col" className="w-44 px-4 py-3 font-medium">Occupancy</th>
              <th scope="col" className="px-6 py-3 font-medium">Leasing status</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {properties.map((property) => {
                const occupancy = occupancyPercent(property.leasedBedrooms, property.totalBedrooms)
                return <tr key={property.id} className="hover:bg-slate-50/70">
                  <th scope="row" className="px-6 py-4 font-normal"><div className="flex items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2.5 text-slate-500"><Building2 size={19} aria-hidden="true" /></div>
                    <div><p className="font-semibold">{property.name}</p><p className="mt-1 text-xs text-slate-500">{property.address}</p></div>
                  </div></th>
                  <td className="px-4 py-4 tabular-nums">{property.totalBedrooms}</td>
                  <td className="px-4 py-4 tabular-nums">{property.leasedBedrooms}<span className="text-slate-400"> / {property.totalBedrooms}</span></td>
                  <td className="px-4 py-4"><p className="mb-2 text-xs font-medium tabular-nums">{occupancy.toFixed(1)}%</p><ProgressBar value={occupancy} label={`${property.name} occupancy`} /></td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${property.leasingStatus === 'Fully leased' ? 'bg-teal-50 text-teal-800' : 'bg-amber-50 text-amber-800'}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{property.leasingStatus}</span></td>
                </tr>
              })}
              {properties.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-500">No properties in this academic year.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-100 px-6 py-3 text-xs text-slate-500">Occupancy reflects bedrooms leased for the selected academic year, not current residents.</div>
      </section>
      <footer className="flex flex-wrap justify-between gap-2 text-xs text-slate-500"><p>Fictional properties. Real learning.</p><p>Estate research milestone · Stage 1</p></footer>
    </div>
  )
}
