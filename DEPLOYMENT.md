# Deployment

## Requirements

- GitHub repository connected to Vercel
- Node.js 20+
- a public HTTPS URL
- a Vercel Hobby plan
- no backend service required

## Vercel setup

1. Push the repository to GitHub.
2. In Vercel, import the repository.
3. Choose the root folder as the project root.
4. Use the default Next.js settings.
5. Keep the project framework as Next.js.
6. Deploy the project without adding extra environment variables unless needed for a specific browser feature.

## Build checks

Before deployment, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

If the build passes locally, the same configuration should work on Vercel.

## HTTPS and PWA requirements

The PWA install flow depends on HTTPS. Localhost is accepted for development, but a public HTTPS deployment is required for real Home Screen installation on iPhone Safari.

## MediaPipe and camera safety

- camera access is local to the device
- pose matching remains client-side
- captured media is kept on-device unless the browser share API is used
- no server-side AI image processing is required

## Manual deployment instructions

If the repository is not yet connected to Vercel, follow this flow:

```bash
npm install
npm run build
```

Then import the project in the Vercel dashboard and deploy it using the default framework settings.

## iPhone installation notes

For Safari on iPhone:

1. open the deployed HTTPS URL
2. tap the Share icon
3. choose Add to Home Screen
4. confirm the app name and save

The app will then launch in a standalone, app-like experience.
