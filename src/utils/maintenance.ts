import type { MaintenanceRequest, PortfolioData } from '../models'

export const priorities: MaintenanceRequest['priority'][] = ['Low', 'Medium', 'High']
export const statuses: MaintenanceRequest['status'][] = ['Open', 'In progress', 'Resolved']

export interface MaintenanceDraft {
  propertyId: string
  description: string
  priority: string
}

export function createMaintenanceRequest(data: PortfolioData, draft: MaintenanceDraft): PortfolioData {
  if (!data.properties.some((property) => property.id === draft.propertyId)) throw new Error('Choose a valid house.')
  const description = draft.description.trim()
  if (!description) throw new Error('Enter a request description; spaces alone are not enough.')
  const priority = priorities.find((item) => item === draft.priority)
  if (!priority) throw new Error('Choose Low, Medium, or High priority.')
  let id = crypto.randomUUID()
  while (data.maintenanceRequests.some((request) => request.id === id)) id = crypto.randomUUID()
  return {
    ...data,
    maintenanceRequests: [{ id, propertyId: draft.propertyId, description, priority, status: 'Open' }, ...data.maintenanceRequests],
  }
}

export function updateMaintenanceStatus(data: PortfolioData, id: string, status: string): PortfolioData {
  const nextStatus = statuses.find((item) => item === status)
  if (!nextStatus) throw new Error('Choose Open, In progress, or Resolved.')
  if (!data.maintenanceRequests.some((request) => request.id === id)) throw new Error('This request could not be found.')
  return {
    ...data,
    maintenanceRequests: data.maintenanceRequests.map((request) => request.id === id ? { ...request, status: nextStatus } : request),
  }
}

export function filterMaintenance(requests: MaintenanceRequest[], status: string, priority: string, propertyId: string) {
  return requests.filter((request) => (!status || request.status === status) &&
    (!priority || request.priority === priority) && (!propertyId || request.propertyId === propertyId))
}

export function maintenanceSummary(requests: MaintenanceRequest[]) {
  return {
    total: requests.length,
    open: requests.filter((request) => request.status === 'Open').length,
    inProgress: requests.filter((request) => request.status === 'In progress').length,
    resolved: requests.filter((request) => request.status === 'Resolved').length,
  }
}
