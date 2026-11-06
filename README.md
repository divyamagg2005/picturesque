# Picturesque

Picturesque is an AI-guided photography application built with the Next.js App Router, TypeScript, and Tailwind CSS 4. It includes a searchable pose library, local recently viewed history, a browser-native camera, and adjustable reference pose overlays.

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
- `/camera?poseId=[poseId]` - Local camera preview, composition grid, reference guide, capture, review, and download/share.

## Project Structure

```text
src/
	app/                 Home, explore, pose detail, camera placeholder, and error UI
	components/
		common/            Shared presentation components
		home/              Homepage sections
		poses/             Pose discovery and detail components
		camera/            Camera preview, capture, and pose overlay components
	hooks/               Client-side hooks, including recent history
	lib/
		camera/            Browser camera and capture utilities
		vision/            Computer vision integration boundary
		pose/              Pose data, coordinate mapping, skeleton, and browser storage helpers
	data/                Typed local pose dataset
	types/               Shared domain contracts
	utils/               Small cross-cutting utilities
```

Use the `@/*` alias for imports from `src/`. Keep routes as Server Components by default. Isolate browser APIs and interactive state in Client Components. Recently viewed pose IDs are stored in `localStorage` under `picturesque.recently-viewed.v1`; unavailable storage is treated as an optional feature. Camera access is requested only after the user presses Enable camera and requires HTTPS or localhost.

Tailwind's default breakpoints are mobile-first; the global theme adds `xs` and `3xl`. Shared CSS variables for the dark photography palette live in `src/app/globals.css`. Pose references use images available under the Unsplash License, with photographer attribution and source links stored alongside each record.

## Validation

```bash
npm run lint
npm run build
```

The 16 initial pose references are served from Unsplash URLs available under the Unsplash License. Photographer attribution and source pages are included in each pose record. An internet connection is required to load these remote photographs.

## On-Device Pose Detection

Phase 4 uses `@mediapipe/tasks-vision` 1.2.2 with the official Pose Landmarker Lite float16 bundle from [Google MediaPipe model storage](https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task?generation=1682624738331272). This immutable generation is 5,777,746 bytes, reports ETag `04a75ddf7c811ac7a1a4523266dd7d88` and was last modified April 27, 2023. The official [BlazePose GHUM 3D model card](https://storage.googleapis.com/mediapipe-assets/Model%20Card%20BlazePose%20GHUM%203D.pdf) identifies the model as Apache License 2.0. The WASM runtime is pinned to the same npm package version.

The model bytes are cached in browser Cache Storage under an ETag-versioned cache name. PoseLandmarker runs in VIDEO mode with up to 12 inferences per second and at most two returned poses. Multiple people are not identity-tracked; the most visible candidate is selected and the interface cautions users to frame one subject. Camera frames remain on-device; only static WASM and model assets are downloaded.

The pose dataset currently contains no verified reference landmark annotations. Detection and the live skeleton work, but comparison scores and correction feedback are intentionally unavailable for these poses until verified normalized landmarks and source aspect ratios are supplied.

## Scope

Camera streams and captured images stay on the device. Photos are held temporarily for review and are not persisted by the app. Reference overlays support photo and named-landmark skeleton modes, opacity, scale, manual position, mirroring, and responsive coordinate mapping. Skeleton mode accepts normalized MediaPipe-compatible landmarks, but the initial pose dataset has no verified landmark annotations, so photo mode is available and reference comparison is disabled until those annotations are supplied. The app is deployable on Vercel using the standard Next.js deployment flow.
