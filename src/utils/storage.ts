import { mockData } from '../data/mockData'
import type { PortfolioData } from '../models'

export const STORAGE_KEY = 'estate.portfolio.v1'

// JSON from browser storage needs runtime checks; TypeScript only checks our code.
function isPortfolioData(value: unknown): value is PortfolioData {
  if (!value || typeof value !== 'object') return false
  const data = value as PortfolioData
  if (!Array.isArray(data.properties) || !Array.isArray(data.maintenanceRequests)) return false
  const validProperties = data.properties.every((p) => p &&
    typeof p.id === 'string' && typeof p.name === 'string' && typeof p.address === 'string' &&
    typeof p.academicYear === 'string' && Number.isInteger(p.totalBedrooms) && p.totalBedrooms > 0 &&
    Number.isInteger(p.leasedBedrooms) && p.leasedBedrooms >= 0 && p.leasedBedrooms <= p.totalBedrooms &&
    Number.isFinite(p.monthlyRentPerBedroom) && p.monthlyRentPerBedroom >= 0 &&
    p.leasingStatus === (p.leasedBedrooms === p.totalBedrooms ? 'Fully leased' : 'Leasing'))
  if (!validProperties) return false
  const ids = new Set(data.properties.map((p) => p.id))
  return ids.size === data.properties.length &&
    new Set(data.maintenanceRequests.map((r) => r?.id)).size === data.maintenanceRequests.length &&
    data.maintenanceRequests.every((r) => r && typeof r.id === 'string' && ids.has(r.propertyId) &&
      typeof r.description === 'string' && ['Low', 'Medium', 'High'].includes(r.priority) &&
      ['Open', 'In progress', 'Resolved'].includes(r.status))
}

export function loadPortfolio(): { data: PortfolioData; warning?: string } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)
      if (!isPortfolioData(parsed)) throw new Error('Invalid saved portfolio')
      return { data: parsed }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData))
    return { data: structuredClone(mockData) }
  } catch {
    // Preserve invalid saved data rather than silently overwriting it.
    return {
      data: structuredClone(mockData),
      warning: 'Saved data could not be loaded or stored. Showing sample data for this visit; browser persistence is unavailable.',
    }
  }
}
