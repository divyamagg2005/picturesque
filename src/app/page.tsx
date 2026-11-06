import { CategorySection } from "@/components/home/CategorySection";
import { FeaturedPoses } from "@/components/home/FeaturedPoses";
import { HeroSection } from "@/components/home/HeroSection";
import { RecentlyViewedPoses } from "@/components/home/RecentlyViewedPoses";
import { Footer } from "@/components/common/footer";
import { Navbar } from "@/components/common/navbar";
import { poses } from "@/data/poses";

export default function Home() {
  const heroPose = poses.find((pose) => pose.id === "solo-natural-smile") ?? poses[0];
  const featuredPoses = poses.filter((pose) => pose.featured).slice(0, 3);

  return (
    <main className="app-main">
      <Navbar active="home" />
      <HeroSection pose={heroPose} />
      <FeaturedPoses poses={featuredPoses} />
      <CategorySection poses={poses} />
      <RecentlyViewedPoses poses={poses} />
      <Footer />
    </main>
  );
}
