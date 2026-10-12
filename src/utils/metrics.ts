import type { MaintenanceRequest, Property } from '../models'

export function occupancyPercent(leased: number, total: number): number {
  return total === 0 ? 0 : (leased / total) * 100
}

export function calculateMetrics(properties: Property[], requests: MaintenanceRequest[]) {
  const totalBedrooms = properties.reduce((sum, property) => sum + property.totalBedrooms, 0)
  const leasedBedrooms = properties.reduce((sum, property) => sum + property.leasedBedrooms, 0)
  const propertyIds = new Set(properties.map((property) => property.id))
  return {
    totalProperties: properties.length,
    totalBedrooms,
    leasedBedrooms,
    availableBedrooms: totalBedrooms - leasedBedrooms,
    occupancy: occupancyPercent(leasedBedrooms, totalBedrooms),
    openMaintenance: requests.filter((request) => propertyIds.has(request.propertyId) && request.status !== 'Resolved').length,
  }
}
