# ZETATRAVELER

## Overview

ZETATRAVELER is a single-player desktop RPG inspired by Earthbound, Undertale, and Deltarune. The game combines top-down 2D exploration with 3D real-time bullet-hell combat across 50 alien planets. Players must collect Nebuli shards, defeat or spare enemies, and seal planetary cores to prevent a galaxy-threatening fracture. The game features three distinct endings (Pacifist, Genocide, Neutral) determined by player moral choices throughout the journey.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript
- Built using Vite as the build tool and development server
- React Three Fiber (@react-three/fiber) and React Three Drei for 3D rendering in battle scenes
- React Three Postprocessing for visual effects
- TanStack Query for state management and data fetching
- Zustand for global client-side state management

**UI Components**:
- Radix UI primitives for accessible, unstyled component foundation
- Tailwind CSS for styling with custom theming support
- shadcn/ui component patterns for consistent design system
- GLSL shader support for advanced visual effects

**State Management**:
- Game state managed through Zustand stores (`useRPG`, `useGame`, `useAudio`)
- Separates concerns between game phases, player data, combat state, and audio
- LocalStorage integration for save/load functionality

**Game Phases**:
- `vessel`: Character/vessel creation sequence
- `menu`: Main menu navigation
- `hub`: Central hub for NPC interaction and planet travel
- `planet`: 2D top-down exploration with enemy encounters
- `battle`: 2D bullet-hell combat system

**Planet System**:
- 50 unique planets across 5 regions (Verdant Cluster, Frozen Expanse, Inferno Sector, Void Realm, Celestial Heights)
- Each planet has unique biome, color theme, and 3 distinct enemy types
- Planet data stored in `client/src/lib/data/planets.ts`
- Galaxy Map component (`GalaxyMap.tsx`) for browsing and selecting planets
- Difficulty scaling from 1-5 stars across regions
- 150 unique enemy types total with spare dialogue

**Multi-Room Planet System** (NEW):
- Each planet now contains 3-6 interconnected areas based on difficulty
- Biome catalog (`client/src/lib/data/biomes.ts`) with 10 visual themes: forest, cave, ruins, crystalline, desert, ice, volcanic, void, tech, garden
- Area generation system (`client/src/lib/data/planetAreas.ts`) creates procedural layouts with unique content per room
- Room connections via doors, portals, and gates with directional arrows (north, south, east, west)
- Content distribution: enemies, shards, keys spread across rooms; boss spawns only in final "boss lair" area
- Environmental lore system with discoverable lore objects (tablets, terminals, memories, inscriptions, echoes, relics)
- Each planet has a thematic story arc revealed through lore pieces across areas
- Store tracks: current area ID, visited areas, enemies defeated per area, collected items, discovered lore
- UI shows current area name, description, and area progress (e.g., "Area 2/4")

### Backend Architecture

**Server Framework**: Express.js with TypeScript
- Modular route registration system
- Separate development and production entry points
- In-memory storage abstraction layer for flexible database integration
- Session management prepared (connect-pg-simple dependency present)

**Development vs Production**:
- Development: Vite middleware integration with HMR support
- Production: Pre-built static file serving from dist/public
- TypeScript compilation using tsx for development, esbuild for production builds

**Storage Interface**:
- Abstract `IStorage` interface defines CRUD operations
- `MemStorage` provides in-memory implementation for development
- Designed to be replaced with persistent database storage (PostgreSQL expected)
- Currently implements basic user management methods

### Data Storage Solutions

**Database Configuration**:
- Drizzle ORM configured for PostgreSQL dialect
- Schema defined in shared/schema.ts for type-safe database operations
- Neon serverless PostgreSQL client (@neondatabase/serverless)
- Migration support through drizzle-kit
- Environment variable-based database URL configuration

**Schema Design**:
- Users table with username/password authentication
- Zod integration for runtime validation through drizzle-zod
- Type inference for Insert and Select operations
- Schema shared between client and server for consistent types

**Current Implementation**:
- In-memory storage active for development
- Database migration path: `npm run db:push`
- Production expects PostgreSQL connection via DATABASE_URL environment variable

### Authentication and Authorization

**Planned Authentication**:
- User schema supports username/password credentials
- Session storage configured with connect-pg-simple
- Steam account integration mentioned in requirements (not yet implemented)
- Save slot system (3 slots per user) referenced in game design
- Export/import save as JSON for backup and sharing

**Current State**:
- Basic user CRUD methods in storage interface
- No active authentication middleware or routes
- Session management dependencies installed but not configured
- Routes file prepared but empty (authentication to be added)

### External Dependencies

**Third-party Services**:
- Neon Database: Serverless PostgreSQL hosting
- Steam integration planned for authentication and cloud saves (not yet implemented)

**Key NPM Packages**:
- React ecosystem: react, react-dom, react-router-dom
- 3D rendering: @react-three/fiber, @react-three/drei, @react-three/postprocessing, three
- UI framework: @radix-ui/* components, tailwindcss
- State management: zustand, @tanstack/react-query
- Database: drizzle-orm, @neondatabase/serverless, drizzle-kit
- Build tools: vite, esbuild, typescript
- Server: express, connect-pg-simple
- Validation: zod
- Utilities: date-fns, nanoid, clsx, class-variance-authority

**Development Tools**:
- tsx for TypeScript execution in development
- Vite plugins: @vitejs/plugin-react, vite-plugin-glsl, @replit/vite-plugin-runtime-error-modal
- PostCSS with Tailwind and Autoprefixer

**Asset Support**:
- GLSL shaders for custom visual effects
- 3D models: .gltf, .glb formats
- Audio files: .mp3, .ogg, .wav formats
- Font loading: @fontsource/inter for typography