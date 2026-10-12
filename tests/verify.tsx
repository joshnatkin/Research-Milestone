import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import App from '../src/App'
import { mockData } from '../src/data/mockData'
import { calculateMetrics, occupancyPercent } from '../src/utils/metrics'
import { loadPortfolio, STORAGE_KEY } from '../src/utils/storage'

// A small browser-storage substitute keeps these checks dependency-free.
const saved = new Map<string, string>()
const storage = {
  getItem: (key: string) => saved.get(key) ?? null,
  setItem: (key: string, value: string) => { saved.set(key, value) },
}
Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true })

const metrics = calculateMetrics(mockData.properties, mockData.maintenanceRequests)
assert.deepEqual(metrics, {
  totalProperties: 6, totalBedrooms: 120, leasedBedrooms: 104,
  availableBedrooms: 16, occupancy: 104 / 120 * 100, openMaintenance: 4,
})
assert.equal(occupancyPercent(0, 0), 0)
assert.equal(calculateMetrics([], mockData.maintenanceRequests).openMaintenance, 0)
assert.equal(calculateMetrics([], []).occupancy, 0)
const changed = structuredClone(mockData)
changed.properties[0].leasedBedrooms = 20
assert.equal(calculateMetrics(changed.properties, changed.maintenanceRequests).leasedBedrooms, 102)
assert.equal(calculateMetrics([mockData.properties[0]], mockData.maintenanceRequests).openMaintenance, 1)
console.log('PASS: sample totals, changed data, empty portfolio, and maintenance scoping')

assert.deepEqual(loadPortfolio().data, mockData)
assert.ok(saved.has(STORAGE_KEY), 'First visit initializes storage')
saved.set(STORAGE_KEY, JSON.stringify(changed))
assert.equal(loadPortfolio().data.properties[0].leasedBedrooms, 20, 'Reload preserves saved data')
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
    assert.ok(html.includes('86.7%'))
    assert.ok(html.includes('Maple Hall'))
    assert.ok(html.includes('aria-valuenow="86.7"'))
  }
}
console.log('PASS: all three routes, navigation links, fallback page, and rendered dashboard values')
console.log('These are logic and server-rendering checks, not browser or visual tests.')
