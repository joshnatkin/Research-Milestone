import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import App from '../src/App'
import { mockData } from '../src/data/mockData'
import { calculateMetrics, occupancyPercent } from '../src/utils/metrics'
import { loadPortfolio, savePortfolio, STORAGE_KEY } from '../src/utils/storage'
import { filterProperties, parseLeasedBedrooms, updatePropertyLeasing } from '../src/utils/properties'
import { createMaintenanceRequest, updateMaintenanceStatus, filterMaintenance, maintenanceSummary } from '../src/utils/maintenance'

// A small browser-storage substitute keeps these checks dependency-free.
const saved = new Map<string, string>()
const storage = {
  getItem: (key: string) => saved.get(key) ?? null,
  setItem: (key: string, value: string) => { saved.set(key, value) },
}
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })

saved.set('estate.portfolio.v1', 'legacy apartment data')
assert.deepEqual(loadPortfolio().data, mockData)
assert.equal(saved.get('estate.portfolio.v1'), 'legacy apartment data', 'Old demo data is preserved')
for (const house of mockData.properties) {
  assert.ok(house.totalBedrooms >= 3 && house.totalBedrooms <= 6)
  assert.ok(house.leasedBedrooms === 0 || house.leasedBedrooms === house.totalBedrooms)
}
const metrics = calculateMetrics(mockData.properties, mockData.maintenanceRequests)
assert.deepEqual(metrics, {
  totalProperties: 6, totalBedrooms: 25, leasedBedrooms: 12,
  availableBedrooms: 13, occupancy: 12 / 25 * 100, openMaintenance: 4,
})
assert.equal(occupancyPercent(0, 0), 0)
assert.equal(calculateMetrics([], mockData.maintenanceRequests).openMaintenance, 0)
assert.equal(calculateMetrics([], []).occupancy, 0)
const changed = structuredClone(mockData)
changed.properties[0].leasedBedrooms = 4
changed.properties[0].leasingStatus = 'Fully leased'
assert.equal(calculateMetrics(changed.properties, changed.maintenanceRequests).leasedBedrooms, 16)
assert.equal(calculateMetrics([mockData.properties[0]], mockData.maintenanceRequests).openMaintenance, 1)
console.log('PASS: sample totals, changed data, empty portfolio, and maintenance scoping')

assert.deepEqual(loadPortfolio().data, mockData)
assert.ok(saved.has(STORAGE_KEY), 'First visit initializes storage')
saved.set(STORAGE_KEY, JSON.stringify(changed))
assert.equal(loadPortfolio().data.properties[0].leasedBedrooms, 4, 'Reload preserves saved data')
saved.set(STORAGE_KEY, '{broken')
assert.ok(loadPortfolio().warning)
assert.equal(saved.get(STORAGE_KEY), '{broken', 'Invalid data is not overwritten')
saved.set(STORAGE_KEY, JSON.stringify({ properties: [{}], maintenanceRequests: [] }))
assert.ok(loadPortfolio().warning)
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true, get: () => { throw new Error('Storage blocked') },
})
assert.deepEqual(loadPortfolio().data, mockData)
assert.ok(loadPortfolio().warning)
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
saved.clear()
console.log('PASS: first visit, saved reload, malformed data, invalid schema, and blocked storage')

for (const [path, heading] of [['/', 'Dashboard'], ['/properties', 'Properties'], ['/maintenance', 'Maintenance'], ['/missing', 'Page not found']]) {
  const html = renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
  assert.ok(html.includes(`>${heading}</h1>`), `${path} renders its page`)
  for (const route of ['/', '/properties', '/maintenance']) assert.ok(html.includes(`href="${route}"`))
  if (path === '/') {
    assert.ok(html.includes('48.0%'))
    assert.ok(html.includes('Maple House'))
    assert.ok(html.includes('aria-valuenow="48"'))
  }
}
console.log('PASS: all three routes, navigation links, fallback page, and rendered dashboard values')

const original = structuredClone(mockData)
const fullyLeased = updatePropertyLeasing(original, 'p1', 4)
assert.equal(fullyLeased.properties[0].leasingStatus, 'Fully leased')
assert.deepEqual(original, mockData, 'Updates do not mutate existing state')
assert.deepEqual(fullyLeased.properties.slice(1), original.properties.slice(1))
assert.deepEqual(fullyLeased.maintenanceRequests, original.maintenanceRequests)
const updatedMetrics = calculateMetrics(fullyLeased.properties, fullyLeased.maintenanceRequests)
assert.equal(updatedMetrics.leasedBedrooms, 16)
assert.equal(updatedMetrics.availableBedrooms, 9)
assert.equal(updatedMetrics.occupancy, 16 / 25 * 100)
assert.equal(updatedMetrics.openMaintenance, 4)
const vacant = updatePropertyLeasing(fullyLeased, 'p1', 0)
assert.equal(vacant.properties[0].leasingStatus, 'Available')
assert.equal(vacant.properties[0].leasedBedrooms, 0)
for (const count of [-1, 5, 1, 2, 3, 2.5, NaN, Infinity]) {
  assert.throws(() => updatePropertyLeasing(original, 'p1', count), /Choose Available/)
}
assert.throws(() => updatePropertyLeasing(original, 'missing', 1), /not be found/)
for (const input of ['', ' ', '-1', '5', '1', '2', '3', '2.5', 'abc', '1e1']) {
  assert.throws(() => parseLeasedBedrooms(input, 4), /Choose Available/)
}
assert.equal(parseLeasedBedrooms('0', 4), 0)
assert.equal(parseLeasedBedrooms('4', 4), 4)
console.log('PASS: immutable property updates, both status transitions, metric changes, and invalid counts')

savePortfolio(fullyLeased)
assert.deepEqual(loadPortfolio().data, fullyLeased, 'Saved edits survive reloading')
const partial = structuredClone(fullyLeased)
partial.properties[0].leasedBedrooms = 2
partial.properties[0].leasingStatus = 'Available'
assert.throws(() => savePortfolio(partial), /invalid/)
saved.set(STORAGE_KEY, JSON.stringify(partial))
assert.ok(loadPortfolio().warning, 'Partial-house saved data is rejected')
savePortfolio(fullyLeased)
const inconsistent = structuredClone(fullyLeased)
inconsistent.properties[0].leasingStatus = 'Available'
assert.throws(() => savePortfolio(inconsistent), /invalid/)
assert.deepEqual(loadPortfolio().data, fullyLeased)
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: { ...storage, setItem: () => { throw new Error('Quota exceeded') } },
})
assert.throws(() => savePortfolio(vacant), /could not be saved/)
assert.equal(saved.get(STORAGE_KEY), JSON.stringify(fullyLeased), 'Failed save preserves the last saved portfolio')
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true, get: () => { throw new Error('Storage blocked') },
})
assert.throws(() => savePortfolio(vacant), /could not be saved/)
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
console.log('PASS: edit/save/reload, invalid-save rejection, blocked writes, and quota failure')

const year = original.properties[0].academicYear
assert.equal(filterProperties(original.properties, ' MAPLE ', 'Available', year).length, 1)
assert.equal(filterProperties(original.properties, '124 maple', '', '').length, 1)
assert.equal(filterProperties(original.properties, 'maple', 'Fully leased', '').length, 0)
assert.equal(filterProperties(original.properties, '', '', 'missing').length, 0)
assert.equal(filterProperties(original.properties, '', '', '').length, 6)
assert.equal(filterProperties(fullyLeased.properties, 'maple', 'Fully leased', year).length, 1)
assert.deepEqual(original, mockData, 'Filtering never changes the portfolio')
console.log('PASS: combined search/status/year filters and updated status filtering')

function renderRoute(path: string) {
  return renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}
assert.ok(renderRoute('/').includes('64.0%'), 'Dashboard reflects saved property edits after reload')
const details = renderRoute('/properties/p1')
assert.ok(details.includes('>Maple House</h1>'))
assert.ok(details.includes('100.0%'))
assert.ok(details.includes('$3,300.00'), 'Estimated monthly revenue reflects updated leased bedrooms')
assert.ok(details.includes('Fully leased'))
assert.ok(details.includes('Edit leasing'))
assert.ok(renderRoute('/properties/missing').includes('Property not found'))
assert.ok(renderRoute('/properties?search=maple&status=Fully+leased').includes('Showing 1 of 6 properties'))
assert.ok(renderRoute('/properties?search=maple&status=Available').includes('No properties match your filters'))
assert.ok(renderRoute('/properties').includes('View details'))
assert.ok(renderRoute('/maintenance').includes('>Maintenance</h1>'))
saved.clear()
console.log('PASS: reloaded dashboard/detail values, estimated revenue, filtered tables, and existing routes')
const draft = { propertyId: 'p1', description: '  Repair the porch light.  ', priority: 'High' }
const withRequest = createMaintenanceRequest(fullyLeased, draft)
const request = withRequest.maintenanceRequests[0]
assert.equal(request.description, 'Repair the porch light.')
assert.equal(request.status, 'Open')
assert.equal(request.priority, 'High')
assert.equal(request.propertyId, 'p1')
assert.ok(request.id)
assert.equal(new Set(withRequest.maintenanceRequests.map((item) => item.id)).size, 7)
const withSecondRequest = createMaintenanceRequest(withRequest, draft)
assert.notEqual(withSecondRequest.maintenanceRequests[0].id, request.id)
assert.deepEqual(withRequest.properties, fullyLeased.properties, 'Creation preserves leasing changes')
assert.deepEqual(withRequest.maintenanceRequests.slice(1), fullyLeased.maintenanceRequests)
assert.equal(fullyLeased.maintenanceRequests.length, 6, 'Creation does not mutate existing state')
assert.deepEqual(maintenanceSummary(withRequest.maintenanceRequests), { total: 7, open: 3, inProgress: 2, resolved: 2 })
assert.deepEqual(maintenanceSummary([]), { total: 0, open: 0, inProgress: 0, resolved: 0 })
for (const description of ['', '   ', '\n\t']) {
  assert.throws(() => createMaintenanceRequest(fullyLeased, { ...draft, description }), /description/)
}
assert.throws(() => createMaintenanceRequest(fullyLeased, { ...draft, propertyId: '' }), /valid house/)
assert.throws(() => createMaintenanceRequest(fullyLeased, { ...draft, propertyId: 'missing' }), /valid house/)
assert.throws(() => createMaintenanceRequest(fullyLeased, { ...draft, priority: 'Urgent' }), /priority/)
console.log('PASS: maintenance creation, unique IDs, trimming, invalid input, summaries, and preserved properties')

const inProgress = updateMaintenanceStatus(withRequest, request.id, 'In progress')
const resolved = updateMaintenanceStatus(inProgress, request.id, 'Resolved')
const reopened = updateMaintenanceStatus(resolved, request.id, 'Open')
for (const [data, expected] of [[withRequest, 5], [inProgress, 5], [resolved, 4], [reopened, 5]] as const) {
  assert.equal(calculateMetrics(data.properties, data.maintenanceRequests).openMaintenance, expected)
  assert.equal(calculateMetrics(data.properties, data.maintenanceRequests).occupancy, 64)
  assert.deepEqual(data.properties, fullyLeased.properties)
  assert.deepEqual(data.maintenanceRequests.slice(1), fullyLeased.maintenanceRequests)
  savePortfolio(data)
  assert.deepEqual(loadPortfolio().data, data)
}
assert.equal(withRequest.maintenanceRequests[0].status, 'Open', 'Status updates do not mutate existing state')
assert.deepEqual(maintenanceSummary(inProgress.maintenanceRequests), { total: 7, open: 2, inProgress: 3, resolved: 2 })
assert.deepEqual(maintenanceSummary(resolved.maintenanceRequests), { total: 7, open: 2, inProgress: 2, resolved: 3 })
assert.throws(() => updateMaintenanceStatus(withRequest, request.id, 'Closed'), /Choose Open/)
assert.throws(() => updateMaintenanceStatus(withRequest, 'missing', 'Open'), /not be found/)
assert.deepEqual(filterMaintenance(withRequest.maintenanceRequests, 'Open', 'High', 'p1'), [request])
assert.equal(filterMaintenance(withRequest.maintenanceRequests, '', '', '').length, 7)
assert.equal(filterMaintenance(withRequest.maintenanceRequests, 'Resolved', 'High', 'p1').length, 0)
assert.equal(filterMaintenance(withRequest.maintenanceRequests, '', '', 'missing').length, 0)
assert.equal(filterMaintenance(withRequest.maintenanceRequests, '', 'High', '').length, 2)
assert.equal(filterMaintenance(withRequest.maintenanceRequests, '', '', 'p1').length, 2)
assert.equal(withRequest.maintenanceRequests.length, 7)
console.log('PASS: status workflow/reopening, combined filters, dashboard unresolved counts, and save/reload')

const invalidMaintenance = structuredClone(reopened)
invalidMaintenance.maintenanceRequests[0].description = ' '
assert.throws(() => savePortfolio(invalidMaintenance), /invalid/)
const beforeFailure = saved.get(STORAGE_KEY)
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true, value: { ...storage, setItem: () => { throw new Error('Quota exceeded') } },
})
assert.throws(() => savePortfolio(withSecondRequest), /could not be saved/)
assert.throws(() => savePortfolio(resolved), /could not be saved/)
assert.equal(saved.get(STORAGE_KEY), beforeFailure)
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })
assert.deepEqual(loadPortfolio().data, reopened)
assert.ok(renderRoute('/maintenance').includes('Repair the porch light.'))
assert.ok(renderRoute('/maintenance').includes('Showing 7 of 7 requests'))
assert.ok(renderRoute('/maintenance?status=Open&priority=High&property=p1').includes('Showing 1 of 7 requests'))
assert.ok(renderRoute('/maintenance?status=Resolved&priority=High&property=p1').includes('No requests match your filters'))
const dashboardAfterMaintenance = renderRoute('/')
assert.match(dashboardAfterMaintenance, /Open maintenance[\s\S]*?tabular-nums">5<\/p>/)
assert.ok(dashboardAfterMaintenance.includes('64.0%'))
const leasingAfterMaintenance = updatePropertyLeasing(reopened, 'p1', 0)
assert.deepEqual(leasingAfterMaintenance.maintenanceRequests, reopened.maintenanceRequests)
savePortfolio(leasingAfterMaintenance)
assert.equal(loadPortfolio().data.properties[0].leasingStatus, 'Available')
assert.ok(renderRoute('/properties/p1').includes('Available'))
saved.clear()
console.log('PASS: maintenance save failures, storage validation, rendered filters/dashboard, and property regression')
console.log('These are logic and server-rendering checks, not browser or visual tests.')
