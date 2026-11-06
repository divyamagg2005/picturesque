import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <p className="hero-kicker">Pose not found</p>
      <h1>That pose could not be found.</h1>
      <p>It may have moved. The rest of the library is ready to explore.</p>
      <Link className="button button-primary" href="/explore">Explore poses</Link>
    </main>
  );
}