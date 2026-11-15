# Lunar Landing Site Navigator

A web app for comparing lunar landing sites and dates by power and communication conditions.
Built by team **Snow Leopard** for the [NASA Space Apps Challenge 2026](https://www.spaceappschallenge.org/).

## Why this project exists

Missions to the Moon's south pole face extreme lighting and communication constraints.
The Sun stands only a few degrees above the horizon there, so a nearby mountain can block it
for days, and the Earth may hide behind the terrain, cutting off direct radio contact.
A small change of the landing point or date can turn a good site into an unusable one.

Tools that give this information (JPL Horizons, LROC QuickMap, Moon Trek) are built for
detailed analysis and are hard to use for a quick comparison. Mission dates also slip:
when a launch is delayed, a team has to re-check the site, or find another one, fast.

Lunar Landing Site Navigator answers one question in a few seconds:
**at this site and on these dates, will the lander have sunlight for power and a direct link to the Earth?**
It is meant for mission planners, educators and anyone curious why the lunar south pole is so hard to land on.

## Features

- **Site catalog**: the nine NASA Artemis candidate regions, commercial landings (IM-1, IM-2, Blue Ghost 1),
  other countries' missions (Chang'e, Chandrayaan-3, SLIM, Luna) and Apollo, plus custom coordinates.
- **Verdict for a site and date**: share of the mission with sunlight, with a direct Earth link and with both;
  the longest darkness and communication gap; the Sun's elevation; time until sunset and Earthset.
- **Sky views**: a 2D sky chart, a 3D globe of the Moon and a 3D view of the terrain around the site
  with the Sun and the Earth and real shadows.
- **Timeline and playback**: day-by-day bars of sunlight, Earth visibility and work windows, with an animation over the mission.
- **Planner**: a heatmap of sites against start dates over about a year, and the best launch windows.
- **Nearby points**: the same scenario 2–10 km around the site, to show how much the result depends on the exact spot.
- **Scenario comparison**: up to four site–date scenarios side by side.
- **Beginner and expert modes**, hints for every term, English and Russian.
- Works on phones, tablets and desktops.

## Data and method

- **Sun and Earth positions**: [JPL Horizons](https://ssd.jpl.nasa.gov/horizons/) (DE441 ephemeris),
  azimuth and elevation as seen from the site, airless (no refraction). Libration is included.
- **Terrain**: LOLA (Lunar Orbiter Laser Altimeter) elevations from the
  [USGS Astrogeology](https://astrogeology.usgs.gov/) web map service. The horizon profile of a site
  (72 directions, up to 120 km away, with the Moon's curvature) is calculated in the browser.
- **Check**: at the six Apollo landing sites the Sun matches the NASA ALSJ values within 0.02° and the Earth within 0.22°.
- The thresholds for "viable" and "marginal" are project assumptions, not NASA requirements; they can be changed in expert mode.

## Running locally

You need [Node.js](https://nodejs.org/) 22 or newer (npm comes with it) and an internet connection:
the data is requested live from JPL Horizons and USGS.

```bash
git clone https://github.com/dilmun1101/lunar-landing-site-navigator.git
cd lunar-landing-site-navigator
npm install
npm run dev
```

Open the address Vite prints, usually http://localhost:5173.

Horizons and USGS do not allow requests from other websites (no CORS headers), so the app calls
`/horizons-api` and `/usgs-wms` on its own origin and the Vite dev server forwards them
(see `server.proxy` in `vite.config.ts`). Because of this, the app must be opened through Vite:
opening `dist/index.html` straight from the disk shows the interface but loads no data.

Other commands:

| Command            | What it does                                               |
| ------------------ | ---------------------------------------------------------- |
| `npm run build`    | Type-checks and builds the production version into `dist/` |
| `npm run preview`  | Serves the built `dist/` with the same proxies             |
| `npm run test:run` | Runs the unit tests once (Vitest)                          |
| `npm run lint`     | Checks the code with ESLint                                |
| `npm run format`   | Formats the code with Prettier                             |

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS, React Router, Zustand, i18next,
three.js with React Three Fiber, Vitest.

## Project structure

```
src/
  domain/      calculations without UI: visibility, horizon, metrics, terrain, planner
  lib/         data clients (Horizons, LOLA) and formatting
  features/    parts of the interface: scenario, planner, comparison, site picker
  pages/       the Scenario and Planner pages
  layouts/     header, side panels, footer
  components/  shared UI elements
public/locales/  English and Russian texts
```

## Team

Team **Snow Leopard**, NASA Space Apps Challenge 2026.
Author: [dilmun1101](https://github.com/dilmun1101).
