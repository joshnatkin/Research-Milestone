import { useEffect } from 'react'
import { Building2, GraduationCap, LayoutDashboard, Wrench } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'

const navigation = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/properties', label: 'Properties', icon: Building2 },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
]

export function Layout() {
  const { pathname } = useLocation()
  const title = navigation.find((item) => item.to === pathname)?.label ?? 'Page not found'
  useEffect(() => { document.title = `${title} | Estate` }, [title])
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-4">Skip to content</a>
      <aside className="flex flex-col bg-[#142c35] px-5 py-6 text-white lg:sticky lg:top-0 lg:h-screen">
        <NavLink to="/" className="flex items-center gap-3 px-3 text-3xl font-semibold tracking-tight" aria-label="Estate home">
          <Building2 className="text-teal-300" size={30} aria-hidden="true" />estate<span className="-ml-3 text-teal-300">.</span>
        </NavLink>
        <p className="mt-10 hidden px-3 text-[10px] font-semibold tracking-[0.18em] text-slate-400 lg:block">WORKSPACE</p>
        <nav aria-label="Main navigation" className="mt-5 flex flex-wrap gap-2 lg:flex-col">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${isActive ? 'bg-white/10 text-teal-200' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <Icon size={18} aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto hidden rounded-xl border border-white/10 p-4 lg:block">
          <GraduationCap size={22} className="mb-3 text-teal-300" aria-hidden="true" />
          <p className="text-sm font-medium">Built around student living.</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">A clearer view of your housing portfolio.</p>
        </div>
        <p className="mt-5 hidden px-3 text-xs text-slate-400 lg:block">Estate · Research prototype</p>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5 lg:px-10">
          <p className="text-sm font-medium">Workspace <span className="mx-3 text-slate-300">/</span> {title}</p>
          <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-800">Demo portfolio</span>
        </header>
        <main id="main" className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10"><Outlet /></main>
      </div>
    </div>
  )
}
