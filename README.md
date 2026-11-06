# Picturesque

Picturesque is a local-first photography guidance app built with Next.js App Router, TypeScript, and a browser-native camera flow. It includes a searchable pose library, reference overlays, on-device MediaPipe pose detection, alignment guidance, and a smart ready-to-capture state.

## Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

- `/` - Homepage and featured poses
- `/explore` - Searchable pose library
- `/poses/[poseId]` - Pose detail page
- `/camera?poseId=[poseId]` - Camera preview, pose guidance, capture, and review

## Production-ready PWA notes

Picturesque is configured as a lightweight installable web app with:

- a valid web app manifest
- installation banner support for supported browsers
- a service worker for caching the app shell and static assets
- cached MediaPipe model and WASM assets where compatible with browser storage
- offline fallback handling for navigation requests

## Validation

```bash
npm run lint
npm run build
```

## Deployment

The app is ready to deploy to Vercel without introducing a backend service. See [DEPLOYMENT.md](DEPLOYMENT.md) for exact instructions.

## Testing

Use the checklist in [TESTING.md](TESTING.md) for desktop, iPhone Safari, and PWA installation verification.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the local-first camera lifecycle, pose system, and privacy model.

## On-device pose detection

The app uses `@mediapipe/tasks-vision` 1.2.2 with the official Pose Landmarker Lite float16 model from Google MediaPipe storage in VIDEO mode. The model is cached in browser storage and the detection flow remains on-device.

## Scope

Camera streams and captured images remain on-device. No backend service is required for the MVP. The app is intentionally designed to work as a PWA over HTTPS with a public Vercel deployment.
