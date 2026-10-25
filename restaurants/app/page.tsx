import { getSiteData } from "@/lib/config";
import { MealInScroll } from "@/themes/trattoria/signature/MealInScroll";

export default async function Home() {
  const site = await getSiteData();
  return (
    <main id="main">
      <MealInScroll site={site} />
    </main>
  );
}
