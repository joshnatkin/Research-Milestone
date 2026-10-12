import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import App from '../src/App'
import { mockData } from '../src/data/mockData'
import { calculateMetrics, occupancyPercent } from '../src/utils/metrics'
import { loadPortfolio, savePortfolio, STORAGE_KEY } from '../src/utils/storage'
import { filterProperties, parseLeasedBedrooms, updatePropertyLeasing } from '../src/utils/properties'

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
console.log('These are logic and server-rendering checks, not browser or visual tests.')
