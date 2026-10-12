# Estate — Research Milestone

This is my individual research prototype for CSCE 490. Estate is a proposed web-based ERP property management platform for landlords and property managers, especially those managing student housing. This repository is at Stage 2 of a three-stage prototype to learn the tools before building the larger team application.

## Running locally

Use **Node.js 22.22 or newer** (a supported LTS release is recommended), with npm. The original development machine had Node 20.18, which is too old for these library versions. If you use nvm, run `nvm install` and `nvm use`; `.nvmrc` specifies 22.22.0. Otherwise install a compatible Node release before continuing.

```sh
npm install
npm run dev
```

Open the URL Vite prints, usually http://localhost:5173. To check the production build and serve it locally:

```sh
npm run build
npm run preview
```

`npm run build` checks TypeScript and writes the production files to `dist/`. `npm run verify` runs the small calculation, storage, and route-rendering checks.

## Tools and choices

| Tool | What I use it for |
| --- | --- |
| React + React DOM | Build and render reusable UI components, such as the layout and metric cards. |
| TypeScript | Define property/request interfaces and catch mistakes before the app runs. Strict checking is enabled. |
| Vite + its React plugin | Start a fast development server, update the UI while editing, and bundle production assets. |
| Tailwind CSS + its Vite plugin | Style the layout with utility classes and a consistent palette. |
| React Router | Navigate between pages without a full browser reload. |
| Lucide React | Provide consistent SVG icons. |
| localStorage | Save the fictional portfolio in the current browser without a backend. This is a browser API, not an npm package. |
| npm | Install dependencies and run the scripts in `package.json`. |

I chose React to practice component-based UI development, TypeScript to make the data shapes explicit, and Vite to keep setup and feedback fast within a short milestone. React state is enough here; a global state library would add complexity without much benefit.

Django would be useful for a Python backend, database models, and a built-in admin, but this stage only needs a frontend. Next.js also uses React and offers server rendering and server features; those are not needed for this browser-only experiment. This prototype lets me learn the frontend before the team decides how to build the full platform.

`package.json` lists runtime and development dependencies. npm resolves their dependencies too, while `package-lock.json` records exact versions for reproducible installs (`npm ci` can install directly from that lockfile). Build tools and TypeScript belong in development dependencies; React, routing, and icons are application dependencies. No external API, font service, or chart library is used.

Setup follows the [Vite React template](https://vite.dev/guide/), [Tailwind Vite integration](https://tailwindcss.com/docs/installation/using-vite), and [React Router declarative setup](https://reactrouter.com/start/declarative/installation).

## Implemented so far

- Responsive sidebar/navigation, page header, and dashboard cards.
- Dashboard at `/`, with six calculated metrics, academic-year selection, leasing progress, and a property occupancy table.
- Properties at `/properties`, details at `/properties/:propertyId`, a Maintenance placeholder at `/maintenance`, and a page-not-found fallback.
- Six fictional properties and six maintenance requests, separated from the components.
- Browser persistence initialized from sample data on the first visit.

Per-bedroom rent is retained as a pricing rate; details also show the monthly rent for the entire house. Each house has 0% or 100% occupancy, while portfolio occupancy is weighted by bedroom count.

The sample cycle is **2027–2028**. Occupancy means leased bedrooms for that academic year, not people currently living in the properties. The initial totals are **6 houses, 25 bedrooms, 12 leased, 13 available, 48.0% occupancy, and 4 open maintenance requests**.

Metrics sum bedrooms across the selected year's properties. Available bedrooms = total minus leased; occupancy = leased ÷ total × 100, with zero for an empty portfolio. The percentage is weighted by bedroom count, rather than averaging property percentages. Open maintenance includes `Open` and `In progress` requests associated with the selected properties; `Resolved` requests are excluded. The leasing bar uses the same occupancy calculation.

## Stage 2: Properties

Each property is a fictional 3–6 bedroom house inspired by student rentals in Columbia, SC, rented under one lease. A house is either entirely available or fully leased. The Properties page lists every property with bedrooms, availability, occupancy, rent, and leasing status. Search matches a name or street address without case sensitivity. Leasing-status and academic-year filters work together with search, and a count shows how many properties match. Filters only change the view; they never change the dataset. Their values are stored in the URL, so returning from details keeps the same search.

Choose **View details** to see the property's information and estimated monthly rental revenue (leased bedrooms × rent per bedroom, not collected rent). **Edit leasing** offers Available or Fully leased for the entire house. Cancel discards the draft. Saving sets leased bedrooms to zero or the full bedroom count; partial-house leases are rejected by both update and storage validation.

`App.tsx` owns the shared portfolio state and passes a save callback to the detail page. The callback validates the update, creates a new portfolio without mutating the old one, and saves it to localStorage before updating React state. The table, detail page, and existing dashboard then read the same updated data. Dashboard metrics still use the existing calculation utility and academic-year filter. No new dependencies were needed.

If browser storage fails, the form shows an error and stays open with the draft intact. The previous portfolio remains unchanged, and success is only reported after storage accepts the write. Reloading uses the same `estate.portfolio.v2` key and preserves saved edits. This is a single-browser prototype; concurrent edits in multiple tabs are not synchronized.

## Project structure

```text
src/
  components/     Layout, MetricCard, ProgressBar
  pages/          Dashboard, Properties, PropertyDetails, Maintenance placeholder
  models/         Property, MaintenanceRequest, PortfolioData interfaces
  data/           Fictional sample dataset and academic year
  utils/          Storage loading/saving, metrics, property filtering/updates
  App.tsx         Routes, shared portfolio state, and save callback
  main.tsx        React entry point and BrowserRouter
  index.css       Tailwind import and shared styles
tests/
  verify.tsx      Logic and route-rendering checks
```

The app loads its portfolio once and shares it through props. Calculations and property updates are plain functions so they can be tested without a browser. The layout uses React Router's `Outlet` to keep navigation consistent across pages.

Data is stored under `estate.portfolio.v2`. This whole-house dataset starts fresh once; the earlier apartment-style demo remains untouched under `estate.portfolio.v1` and is not migrated because partial leases cannot be mapped reliably to whole-house leases. Subsequent visits load the saved dataset, so editing the mock file alone will not replace existing browser data. To reset the demo, remove that key in your browser's developer tools and reload. Saved JSON is validated at runtime. If it is invalid or storage is blocked, the app shows a notice and uses sample data for that visit without overwriting the invalid data. Persistence is specific to the browser and origin (including port), and clearing site data removes it. A valid explicit save from the leasing form writes the updated portfolio, including when the app initially loaded fallback sample data.

## Verification and limits

The Stage 2 production build and strict TypeScript checks pass. The development server and HTTP responses were checked in Stage 1. `npm run verify` checks the expected totals, changed data, an empty portfolio, maintenance scoping, initial storage, saved reloads, malformed/blocked storage, all three page routes, and the fallback route. Stage 2 adds checks for immutable updates, fully leased and reopened status transitions, invalid and partial-house counts, preservation of old demo storage, combined filters, save/reload persistence, blocked/quota-failed writes, and updated dashboard/detail values including estimated revenue. Route checks render React to HTML in Node; they do not automate browser clicks. The interface has not been visually tested in a browser, and actual browser persistence, keyboard navigation, and mobile appearance still need a manual check.

Manual check: open Properties, combine search and status filters, and view Maple House. Change it from Available to Fully leased and save. Details should show 4 leased bedrooms, 100% occupancy, and $3,300 estimated monthly revenue; the dashboard should show 16 leased bedrooms, 9 available, and 64.0% occupancy. Refresh to confirm persistence. Set it back to Available, or try Cancel to discard the draft. Visit Maintenance to confirm its placeholder still works. Resize the window to check navigation and horizontally scrollable tables.

Only whole-house leasing-status editing is implemented; general property editing, authentication, tenant login, maintenance forms, payments, uploads, integrations, backend, and database remain out of scope. If hosted later, the static host must return `index.html` for application routes so direct visits work with `BrowserRouter`. No deployment, remote repository, or Git commit is created as part of this milestone.
