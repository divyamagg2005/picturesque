import Link from "next/link";

export function Footer() {
  return (
    <footer className="app-footer">
      <Link className="footer-wordmark" href="/">
        picturesque<span>.</span>
      </Link>
      <p>Good photographs begin with feeling at ease.</p>
      <Link href="/explore">Explore the pose library</Link>
    </footer>
  );
}