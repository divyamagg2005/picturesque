import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="studio-page">
      <header className="studio-header">
        <Link aria-label="Photogenic home" className="wordmark" href="/">
          photogenic<span aria-hidden="true">.</span>
        </Link>
        <p className="studio-edition">PORTRAIT PRACTICE <span>01</span></p>
      </header>

      <section aria-labelledby="hero-title" className="studio-hero">
        <Image
          alt="A close-up portrait photographed in soft natural light"
          className="studio-image"
          fill
          priority
          sizes="100vw"
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=2400&q=85"
        />
        <div aria-hidden="true" className="studio-scrim" />
        <div className="studio-copy">
          <p className="studio-kicker">A QUIETER KIND OF CAMERA CONFIDENCE</p>
          <h1 id="hero-title">Find your <em>frame.</em></h1>
          <p className="studio-description">
            A little guidance. A little room to be yourself. Portraits begin
            with how you feel.
          </p>
        </div>
        <p className="image-caption">PORTRAIT STUDY <span>·</span> 001</p>
      </section>

      <footer className="studio-footer">
        <span>Made for the moments in between.</span>
        <span className="availability"><span aria-hidden="true" /> YOUR PRIVATE STUDIO</span>
      </footer>
    </main>
  );
}
