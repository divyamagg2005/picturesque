# Picturesque

Picturesque is an AI-guided photography application built with the Next.js App Router, TypeScript, and Tailwind CSS 4. Phase 1 provides a pose library, searchable discovery, pose instructions, and local recently viewed history. Camera, vision, and pose comparison remain out of scope until later phases.

## Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` - Homepage, featured poses, categories, and recently viewed poses.
- `/explore` - Searchable pose library with category filters.
- `/poses/[poseId]` - Reference image, instructions, tips, and related poses.
- `/camera?poseId=[poseId]` - Phase 1 placeholder; no camera APIs are used.

## Project Structure

```text
src/
	app/                 Home, explore, pose detail, camera placeholder, and error UI
	components/
		common/            Shared presentation components
		home/              Homepage sections
		poses/             Pose discovery and detail components
		camera/            Camera experience components
	hooks/               Client-side hooks, including recent history
	lib/
		camera/            Camera integration boundary
		vision/            Computer vision integration boundary
		pose/              Pose domain helpers and browser storage
	data/                Typed local pose dataset
	types/               Shared domain contracts
	utils/               Small cross-cutting utilities
```

Use the `@/*` alias for imports from `src/`. Keep routes as Server Components by default. Isolate browser APIs and interactive state in Client Components. Recently viewed pose IDs are stored in `localStorage` under `picturesque.recently-viewed.v1`; unavailable storage is treated as an optional feature.

Tailwind's default breakpoints are mobile-first; the global theme adds `xs` and `3xl`. Shared CSS variables for the dark photography palette live in `src/app/globals.css`. Pose references use images available under the Unsplash License, with photographer attribution and source links stored alongside each record.

## Validation

```bash
npm run lint
npm run build
```

The 16 initial pose references are served from Unsplash URLs available under the Unsplash License. Photographer attribution and source pages are included in each pose record. An internet connection is required to load these remote photographs.

## Scope

The camera route is a static placeholder only. MediaDevices, MediaPipe, alignment, AI feedback, and backend services are not implemented. The app is deployable on Vercel using the standard Next.js deployment flow.
