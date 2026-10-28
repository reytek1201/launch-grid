import { ogImage, ogSize, ogType } from "@/lib/og";

export const alt = "LaunchGrid Studio for restaurants, cafés and food trucks: your restaurant, open on every phone";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogImage({
    kicker: "For restaurants, cafés and food trucks",
    title: "Your restaurant, open on every phone.",
    sub: "Menu, specials, hours and reservation requests you change from your phone.",
    tags: ["Menu", "Hours", "Reservations"],
  });
}
