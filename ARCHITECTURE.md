# Architecture

## Overview

Picturesque is a client-first photography guidance app. The app uses the Next.js App Router for routes, a local pose dataset for reference framing, and direct browser camera access for the live preview and capture flow.

## Runtime layers

1. Route layer
   - Home, explore, pose detail, and camera pages
   - Server-rendered shell and static content
2. UI layer
   - Pose discovery cards and detail views
   - Camera stage, overlay controls, capture button, and review panel
3. Browser camera layer
   - local camera permission and stream lifecycle management
   - live preview, camera switching, and capture helpers
4. Vision layer
   - MediaPipe PoseLandmarker in VIDEO mode
   - landmark validation and normalization
   - pose comparison and body-part scoring
5. Guidance layer
   - readiness evaluation
   - mismatch feedback generation
   - ready-to-capture indicator
6. Asset layer
   - pose image references
   - local app shell and static assets
   - cached MediaPipe model and WASM assets in browser storage

## Privacy model

The app keeps camera footage on-device. No photo or frame is uploaded to a backend. The capture pipeline remains local to the browser and provides manual save/share actions if the browser supports them.

## Camera lifecycle

The browser camera is opened only after the user chooses to enable it. The `useCamera` hook manages stream creation, teardown, switching, and error state. Camera streams are no longer retained when the document background state changes or the user leaves the page.

## Pose matching model

The MediaPipe detection pipeline outputs normalized 33-landmark data. The result goes through a landmark validation and normalization layer before comparison against the selected pose reference. The output is then converted to a weighted alignment score and body-part-specific mismatch guidance.

## Readiness engine

The readiness engine only transitions to `ready` when:

- the camera is active
- a person is detected
- visibility is sufficient
- alignment exceeds the configured threshold
- the pose remains stable for the stabilization window

This prevents false-ready states and keeps the green indicator honest.

## Asset caching strategy

The service worker caches the application shell, static pages, and selected asset routes. MediaPipe model files and related WASM resources are also cached once fetched; this keeps repeated visits from re-downloading the same model data while avoiding private or dynamic camera streams.

## Deployment model

The app is intended to run as a PWA over HTTPS on Vercel. It requires no dedicated backend service or paid API. The camera and computer vision remain entirely on the end-user device.
