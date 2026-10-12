import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  label: string
  value: string | number
  detail: string
  icon: LucideIcon
}

export function MetricCard({ label, value, detail, icon: Icon }: MetricCardProps) {
  return (
    <article className="panel p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-slate-600">{label}</h2>
        <Icon size={18} className="text-teal-700" aria-hidden="true" />
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </article>
  )
}
