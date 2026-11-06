# Photogenic

Photogenic is an AI-guided photography application built with the Next.js App Router, TypeScript, and Tailwind CSS 4. The current Phase 0 foundation establishes the app shell and shared contracts; camera, vision, pose data, and persistence behavior are intentionally not implemented yet.

## Development

Requirements: Node.js and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```text
src/
	app/                 App Router pages, layout, and route error UI
	components/
		common/            Shared presentation components
		home/              Home experience components
		poses/             Pose experience components
		camera/            Camera experience components
	hooks/               Shared client-side hooks
	lib/
		camera/            Camera integration boundary
		vision/            Computer vision integration boundary
		pose/              Pose domain logic boundary
	data/                Local JSON datasets
	types/               Shared domain contracts
	utils/               Small cross-cutting utilities
```

Use the `@/*` alias for imports from `src/`. Keep route pages as Server Components by default. Put browser APIs, event handlers, and state in focused Client Components, and only access browser globals after checking the runtime environment. Do not initialize camera or vision services during module evaluation or server rendering.

Tailwind's default breakpoints are mobile-first; the global theme adds `xs` and `3xl`. Shared CSS variables for the dark studio palette live in `src/app/globals.css`.

## Validation

```bash
npm run lint
npm run build
```

## Deployment

The app is configured for standard Next.js deployment, including Vercel. The home image is served by Unsplash and requires an internet connection to display.

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
