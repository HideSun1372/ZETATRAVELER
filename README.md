# ZETATRAVELER

A single-player desktop RPG inspired by EarthBound, Undertale, and Deltarune. Explore 50 alien planets, encounter 150 unique enemies, and shape the story through your choices — Pacifist, Genocide, or Neutral.

## Features

- **50 Planets** across 5 regions: Verdant Cluster, Frozen Expanse, Inferno Sector, Void Realm, and Celestial Heights
- **Multi-room exploration** — 3–6 interconnected areas per planet with doors, portals, and gates
- **Real-time bullet-hell combat** rendered in 3D
- **Branching narrative** with three distinct endings based on moral choices
- **Discoverable lore** — tablets, terminals, and memory fragments throughout each world
- **3-slot save system** with local storage persistence

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| 3D Rendering | React Three Fiber, Three.js, React Three Postprocessing |
| State | Zustand |
| Audio | Howler.js |
| Physics | Matter.js, gl-matrix |
| Animations | GSAP |
| Styling | Tailwind CSS, Radix UI |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL via Drizzle ORM + Neon |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

This starts the Vite client dev server and the Express backend together with hot module reloading.

### Build & Start (production)

```bash
npm run build
npm start
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Build client (Vite) and server (esbuild) |
| `npm start` | Serve the production build |
| `npm run check` | TypeScript type check |
| `npm test` | Run Vitest suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |

## Project Structure

```
client/src/
  components/game/   # Core game phases (Battle, Planet, Hub, Menu, …)
  components/ui/     # Radix UI + shadcn components
  lib/data/          # Game content (planets, biomes, enemies, areas)
  lib/stores/        # Zustand stores (useRPG, useGame, useAudio)
server/              # Express backend
shared/              # Drizzle schema + Zod types
attached_assets/     # Game assets (sprites, audio, 3D models)
```

## Game Flow

```
vessel → intro → hub → planet → battle → (loop or ending)
```

- **vessel** — character creation
- **intro** — opening cutscene
- **hub** — central hub with NPC interaction and the Galaxy Map
- **planet** — 2D top-down exploration with enemy encounters
- **battle** — real-time bullet-hell combat scene

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
