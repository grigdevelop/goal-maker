import { WelcomeHero } from "@/components/welcome";
import { RecommendationsDashboard } from "@/components/recommendations";


export default function Home() {
  return (
    <div>
      <WelcomeHero />
      <br />
      <RecommendationsDashboard />
    </div>
  );
}
