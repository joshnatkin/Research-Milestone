import type { PortfolioData } from '../models'

// Fictional rental houses inspired by student housing in Columbia, SC.
// A fixed upcoming leasing cycle keeps the research dataset reproducible.
export const ACADEMIC_YEAR = '2027–2028'

export const mockData: PortfolioData = {
  properties: [
    { id: 'p1', name: 'Maple House', address: '124 Maple Walk', totalBedrooms: 4, leasedBedrooms: 0, monthlyRentPerBedroom: 825, leasingStatus: 'Available', academicYear: ACADEMIC_YEAR },
    { id: 'p2', name: 'Juniper House', address: '38 Juniper Lane', totalBedrooms: 3, leasedBedrooms: 3, monthlyRentPerBedroom: 910, leasingStatus: 'Fully leased', academicYear: ACADEMIC_YEAR },
    { id: 'p3', name: 'Scholar House', address: '206 Scholar Avenue', totalBedrooms: 6, leasedBedrooms: 0, monthlyRentPerBedroom: 780, leasingStatus: 'Available', academicYear: ACADEMIC_YEAR },
    { id: 'p4', name: 'Cedar House', address: '75 Cedar Terrace', totalBedrooms: 5, leasedBedrooms: 5, monthlyRentPerBedroom: 850, leasingStatus: 'Fully leased', academicYear: ACADEMIC_YEAR },
    { id: 'p5', name: 'Oakfield House', address: '19 Oakfield Court', totalBedrooms: 4, leasedBedrooms: 4, monthlyRentPerBedroom: 895, leasingStatus: 'Fully leased', academicYear: ACADEMIC_YEAR },
    { id: 'p6', name: 'Meadow House', address: '310 Meadow Way', totalBedrooms: 3, leasedBedrooms: 0, monthlyRentPerBedroom: 975, leasingStatus: 'Available', academicYear: ACADEMIC_YEAR },
  ],
  maintenanceRequests: [
    { id: 'm1', propertyId: 'p1', description: 'Kitchen sink draining slowly in shared kitchen.', priority: 'Medium', status: 'Open' },
    { id: 'm2', propertyId: 'p3', description: 'Heating not working in the living room.', priority: 'High', status: 'In progress' },
    { id: 'm3', propertyId: 'p4', description: 'Replace flickering hallway light.', priority: 'Low', status: 'Open' },
    { id: 'm4', propertyId: 'p6', description: 'Laundry room dryer is not heating.', priority: 'Medium', status: 'In progress' },
    { id: 'm5', propertyId: 'p2', description: 'Repair loose bedroom door handle.', priority: 'Low', status: 'Resolved' },
    { id: 'm6', propertyId: 'p5', description: 'Replace worn weather seal at main entrance.', priority: 'Low', status: 'Resolved' },
  ],
}
