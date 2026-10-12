export interface Property {
  id: string
  name: string
  address: string
  totalBedrooms: number
  leasedBedrooms: number
  monthlyRentPerBedroom: number
  leasingStatus: 'Leasing' | 'Fully leased'
  academicYear: string
}

export interface MaintenanceRequest {
  id: string
  propertyId: string
  description: string
  priority: 'Low' | 'Medium' | 'High'
  status: 'Open' | 'In progress' | 'Resolved'
}

export interface PortfolioData {
  properties: Property[]
  maintenanceRequests: MaintenanceRequest[]
}
