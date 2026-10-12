import type { PortfolioData } from '../models'

// A fixed upcoming leasing cycle keeps the research dataset reproducible.
export const ACADEMIC_YEAR = '2027–2028'

export const mockData: PortfolioData = {
  properties: [
    { id: 'p1', name: 'Maple Hall', address: '124 Maple Walk', totalBedrooms: 24, leasedBedrooms: 22, monthlyRentPerBedroom: 825, leasingStatus: 'Leasing', academicYear: ACADEMIC_YEAR },
    { id: 'p2', name: 'The Juniper', address: '38 Juniper Lane', totalBedrooms: 18, leasedBedrooms: 18, monthlyRentPerBedroom: 910, leasingStatus: 'Fully leased', academicYear: ACADEMIC_YEAR },
    { id: 'p3', name: 'College Row', address: '206 Scholar Avenue', totalBedrooms: 32, leasedBedrooms: 26, monthlyRentPerBedroom: 780, leasingStatus: 'Leasing', academicYear: ACADEMIC_YEAR },
    { id: 'p4', name: 'Cedar Commons', address: '75 Cedar Terrace', totalBedrooms: 20, leasedBedrooms: 16, monthlyRentPerBedroom: 850, leasingStatus: 'Leasing', academicYear: ACADEMIC_YEAR },
    { id: 'p5', name: 'Oakfield House', address: '19 Oakfield Court', totalBedrooms: 12, leasedBedrooms: 12, monthlyRentPerBedroom: 895, leasingStatus: 'Fully leased', academicYear: ACADEMIC_YEAR },
    { id: 'p6', name: 'Parkside Studios', address: '310 Meadow Way', totalBedrooms: 14, leasedBedrooms: 10, monthlyRentPerBedroom: 975, leasingStatus: 'Leasing', academicYear: ACADEMIC_YEAR },
  ],
  maintenanceRequests: [
    { id: 'm1', propertyId: 'p1', description: 'Kitchen sink draining slowly in shared kitchen.', priority: 'Medium', status: 'Open' },
    { id: 'm2', propertyId: 'p3', description: 'Heating not working in the second-floor lounge.', priority: 'High', status: 'In progress' },
    { id: 'm3', propertyId: 'p4', description: 'Replace flickering hallway light.', priority: 'Low', status: 'Open' },
    { id: 'm4', propertyId: 'p6', description: 'Laundry room dryer is not heating.', priority: 'Medium', status: 'In progress' },
    { id: 'm5', propertyId: 'p2', description: 'Repair loose study room door handle.', priority: 'Low', status: 'Resolved' },
    { id: 'm6', propertyId: 'p5', description: 'Replace worn weather seal at main entrance.', priority: 'Low', status: 'Resolved' },
  ],
}
