import type { PortfolioData, Property } from '../models'

export const formatRent = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(amount)

export function filterProperties(properties: Property[], search: string, status: string, year: string) {
  const query = search.trim().toLowerCase()
  return properties.filter((property) =>
    (property.name.toLowerCase().includes(query) || property.address.toLowerCase().includes(query)) &&
    (status === '' || property.leasingStatus === status) &&
    (year === '' || property.academicYear === year),
  )
}

export function validateLeasedBedrooms(count: number, total: number) {
  if (!Number.isInteger(count) || (count !== 0 && count !== total)) {
    throw new Error(`Choose Available (0 bedrooms) or Fully leased (${total} bedrooms).`)
  }
}

export function parseLeasedBedrooms(input: string, total: number): number {
  if (!/^\d+$/.test(input.trim())) throw new Error(`Choose Available (0 bedrooms) or Fully leased (${total} bedrooms).`)
  const count = Number(input)
  validateLeasedBedrooms(count, total)
  return count
}

export function updatePropertyLeasing(data: PortfolioData, id: string, count: number): PortfolioData {
  const property = data.properties.find((item) => item.id === id)
  if (!property) throw new Error('This property could not be found.')
  validateLeasedBedrooms(count, property.totalBedrooms)
  return {
    ...data,
    properties: data.properties.map((item) => item.id === id ? {
      ...item,
      leasedBedrooms: count,
      leasingStatus: count === item.totalBedrooms ? 'Fully leased' : 'Available',
    } : item),
  }
}
