import { getSiteData } from "@/lib/config";
import { MealInScroll } from "@/themes/trattoria/signature/MealInScroll";

export default function Home() {
  const site = getSiteData();
  return (
    <main id="main">
      <MealInScroll site={site} />
    </main>
  );
}
