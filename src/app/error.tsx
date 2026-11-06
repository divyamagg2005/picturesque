"use client";

import { Button } from "@/components/common/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main aria-live="assertive" className="error-page">
      <p className="studio-kicker">PICTURESQUE</p>
      <h1>That moment got away.</h1>
      <p>Something unexpected interrupted the page. You can try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}