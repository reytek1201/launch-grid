import { ogImage, ogSize, ogType } from "@/lib/og";

export const alt = "LaunchGrid Studio: custom websites for bands and restaurants, with a back office you run from your phone";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogImage({
    kicker: "Websites · Atlanta",
    title: "A website you run from your phone.",
    sub: "Custom sites for bands, restaurants and small businesses, each with its own back office.",
    tags: ["Bands", "Restaurants", "Back office"],
  });
}
