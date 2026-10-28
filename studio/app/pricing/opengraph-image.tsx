import { ogImage, ogSize, ogType } from "@/lib/og";
import { BAND_TIERS, RESTAURANT_TIERS, usd } from "@/lib/pricing";

export const alt = "LaunchGrid Studio pricing: band websites from $900, restaurant websites from $1,500";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogImage({
    kicker: "Pricing",
    title: "Fixed prices, set in writing.",
    sub: `Band sites from ${usd(BAND_TIERS[0].price)}. Restaurant sites from ${usd(RESTAURANT_TIERS[0].price)}. Each with a back office you run from your phone.`,
    tags: ["Bands", "Restaurants", "In writing"],
  });
}
