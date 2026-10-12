# Estate — Research Milestone

This is my individual research prototype for CSCE 490. Estate is a proposed web-based ERP property management platform for landlords and property managers, especially those managing student housing. This repository is a small Stage 1 experiment to learn the tools before building the larger team application.

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

## Implemented in Stage 1

- Responsive sidebar/navigation, page header, and dashboard cards.
- Dashboard at `/`, with six calculated metrics, academic-year selection, leasing progress, and a property occupancy table.
- Placeholder pages at `/properties` and `/maintenance`, plus a page-not-found fallback.
- Six fictional properties and six maintenance requests, separated from the components.
- Browser persistence initialized from sample data on the first visit.

The sample cycle is **2027–2028**. Occupancy means leased bedrooms for that academic year, not people currently living in the properties. The initial totals are **6 properties, 120 bedrooms, 104 leased, 16 available, 86.7% occupancy, and 4 open maintenance requests**.

Metrics sum bedrooms across the selected year's properties. Available bedrooms = total minus leased; occupancy = leased ÷ total × 100, with zero for an empty portfolio. The percentage is weighted by bedroom count, rather than averaging property percentages. Open maintenance includes `Open` and `In progress` requests associated with the selected properties; `Resolved` requests are excluded. The leasing bar uses the same occupancy calculation.

## Project structure

```text
src/
  components/     Layout, MetricCard, ProgressBar
  pages/          Dashboard and shared placeholder page
  models/         Property, MaintenanceRequest, PortfolioData interfaces
  data/           Fictional sample dataset and academic year
  utils/          Storage loading/validation and metric calculations
  App.tsx         Routes and initial data loading
  main.tsx        React entry point and BrowserRouter
  index.css       Tailwind import and shared styles
tests/
  verify.tsx      Logic and route-rendering checks
```

The app loads its portfolio once and passes it into the dashboard as props. Calculations are plain functions so future pages can reuse them. The layout uses React Router's `Outlet` to keep navigation consistent across pages.

Data is stored under `estate.portfolio.v1`. Subsequent visits load the saved dataset, so editing the mock file alone will not replace existing browser data. To reset the demo, remove that key in your browser's developer tools and reload. Saved JSON is validated at runtime. If it is invalid or storage is blocked, the app shows a notice and uses sample data for that visit without overwriting the invalid data. Persistence is specific to the browser and origin (including port), and clearing site data removes it. There are no editing forms in Stage 1.

## Verification and limits

Production build and strict TypeScript checks pass. The Vite development server started successfully, and all three routes returned HTTP 200. `npm run verify` checks the expected totals, changed data, an empty portfolio, maintenance scoping, initial storage, saved reloads, malformed/blocked storage, all three page routes, and the fallback route. Route checks render React to HTML in Node; they do not automate browser clicks. The interface has not been visually tested in a browser, and actual browser persistence, keyboard navigation, and mobile appearance still need a manual check.

Manual check: open the dashboard, compare the totals above, visit both placeholder pages and return, refresh each route, and inspect the storage key. Resize the window to check the compact navigation and horizontally scrollable table.

No authentication, tenant login, property editing, maintenance forms, payments, uploads, integrations, backend, or database is implemented. If hosted later, the static host must return `index.html` for application routes so direct visits work with `BrowserRouter`. No deployment, remote repository, or Git commit is created as part of this milestone.
