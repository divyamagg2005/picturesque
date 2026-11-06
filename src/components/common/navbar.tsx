import Link from "next/link";

type NavbarProps = {
  active: "home" | "explore";
};

export function Navbar({ active }: NavbarProps) {
  return (
    <header className="app-header">
      <Link aria-label="Picturesque home" className="wordmark" href="/">
        picturesque<span>.</span>
      </Link>
      <nav aria-label="Primary navigation" className="desktop-nav">
        <Link aria-current={active === "home" ? "page" : undefined} href="/">
          Home
        </Link>
        <Link aria-current={active === "explore" ? "page" : undefined} href="/explore">
          Explore
        </Link>
        <Link className="nav-cta" href="/explore">
          Start shooting
        </Link>
      </nav>
      <nav aria-label="Mobile navigation" className="mobile-nav">
        <Link aria-current={active === "home" ? "page" : undefined} href="/">
          Home
        </Link>
        <Link aria-current={active === "explore" ? "page" : undefined} href="/explore">
          Explore
        </Link>
        <Link href="/explore">Start</Link>
      </nav>
    </header>
  );
}