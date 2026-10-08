# WeshNakul (وش ناكل) - Disaster Recovery & Backup Guide

This document describes how to restore and run the application from this backup archive, along with an inventory of all core assets (algorithms, restaurant brands, branch data, and pictures).

---

## 1. Quick Start (Get App Running in 2 Minutes)

### Prerequisites
- **Node.js** (v20+ recommended) or **Bun** (v1.1+)
- **Git**

### Steps to Run
1. Open a terminal in this project root folder.
2. Install dependencies:
   ```bash
   bun install
   # OR
   npm install
   ```
3. Verify your `.env.local` file is present in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   GOOGLE_MAPS_KEY=your-google-maps-api-key
   ```
   *(Note: This backup archive includes your configured `.env.local`).*

4. Start the development server:
   ```bash
   bun run dev
   # OR
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 2. Inventory of Important Stuff

### A. The Algorithms
- **Consensus & Voting Engine**: [`src/lib/consensus.ts`](src/lib/consensus.ts)
  - Implements room voting tallying, top-5 wildcard selection, fair draw mechanics, and tiebreaker logic.
- **Deck Generation & Category Selection Algorithms**:
  - Live deck selection is handled via PostgreSQL stored procedures in [`supabase/migrations/`](supabase/migrations):
    - `20261008000300_pizza_controlled_crossover_selection.sql` (Pizza crossover)
    - `20261007000200_fried_chicken_deck_broast_rotation.sql` (Fried chicken / broast rotation)
    - `20260928000500_progressive_geography_widening.sql` (Progressive district widening algorithm)
    - `20261003000100_top5_wildcard_consensus_selection.sql` (Top-5 wildcard algorithm)
- **Local Simulation & Algorithm Verification**:
  - Fast embedded PostgreSQL engine tests in [`scripts/test-deck-generation-pglite.mjs`](scripts/test-deck-generation-pglite.mjs) and [`scripts/check-deck-reliability.mjs`](scripts/check-deck-reliability.mjs).

### B. Brands & Branch Information
The project includes a comprehensive, verified catalog of **450+ restaurant brands and 480+ active branches** across Jeddah with exact Google Place IDs, GPS coordinates, and district mappings.

- **Canonical SQL Seeds (Ready for Database Push)**:
  - Located in [`supabase/migrations/`](supabase/migrations):
    - `20260926000200_jeddah_broast_fried_chicken_catalog.sql`
    - `20260926000300_jeddah_shawarma_catalog.sql`
    - `20260926000400_jeddah_saudi_rice_kabsa_catalog.sql`
    - `20260927000100_jeddah_pizza_catalog.sql`
    - `20260927000200_jeddah_grills_catalog.sql`
    - `20260927000300_jeddah_fatayer_catalog.sql`
    - `20260927000400_jeddah_sandwiches_catalog.sql`
    - `20260927000500_jeddah_indian_catalog.sql`
    - `20260927000600_jeddah_italian_catalog.sql`
    - `20260928000100_jeddah_seafood_catalog.sql`
    - `20260928000100_jeddah_street_folk_food_catalog.sql`
    - `20260928000100_jeddah_sushi_catalog.sql`
    - `20260928000200_jeddah_mexican_catalog.sql`
    - `20260928000300_jeddah_asian_catalog.sql`
    - ...plus subsequent brand additions and taxonomies.
- **Raw Offline Datasets (JSON)**:
  - [`scripts/db_all_481_live_branches.json`](scripts/db_all_481_live_branches.json): Complete live branches data.
  - [`scripts/db_all_453_brands.json`](scripts/db_all_453_brands.json): All 453 brands.
  - [`scripts/db_all_30_districts.json`](scripts/db_all_30_districts.json): Jeddah 30 districts definitions.
- **Client District Data**: [`src/data/jeddahDistricts.ts`](src/data/jeddahDistricts.ts).

### C. Restaurant Pictures & Asset Mapping
- **Local High-Resolution Images**: Located in [`public/images/restaurants/`](public/images/restaurants/):
  - `burger/`: 19 curated burger restaurant images.
  - `fried_chicken/`: Broast and fried chicken images.
  - `grills/`: Grills and kebab images.
  - `pizza/`: Pizzeria and Italian crust images.
  - `shawarma/`: Shawarma brands and sandwich images.
- **Brand-to-Image Mappings**: Located in [`src/data/`](src/data/):
  - [`src/data/burgerBrandImages.ts`](src/data/burgerBrandImages.ts)
  - [`src/data/friedChickenBrandImages.ts`](src/data/friedChickenBrandImages.ts)
  - [`src/data/grillsBrandImages.ts`](src/data/grillsBrandImages.ts)
  - [`src/data/pizzaBrandImages.ts`](src/data/pizzaBrandImages.ts)
  - [`src/data/shawarmaBrandImages.ts`](src/data/shawarmaBrandImages.ts)
  - [`src/data/fallbackStaples.ts`](src/data/fallbackStaples.ts)
- **Normalization & Fallbacks**:
  - Handled by [`src/lib/restaurantNormalization.ts`](src/lib/restaurantNormalization.ts).

---

## 3. Database Restoration (If Starting a New Supabase Project)

If you need to connect this app to a completely new Supabase instance:
1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Copy the Project URL and Anon Public Key into `.env.local`.
3. Link your project and apply all migrations:
   ```bash
   npx supabase login
   npx supabase link --project-ref <your-new-project-ref>
   npx supabase db push
   ```
   All 48+ migrations (tables, algorithms, stored procedures, brands, and branches) will be applied sequentially to your new database.

---

## 4. Git Repository Sync
This project is connected to:
- Remote: `https://github.com/Hash-Encryption/WeshNakul.git`
- Branch: `main`
