import { ogImage, ogSize, ogType } from "@/lib/og";

export const alt = "LaunchGrid Studio for bands and artists: a band site that doesn't look like a template";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogImage({
    kicker: "For bands and artists",
    title: "A band site that doesn’t look like a template.",
    sub: "Shows, music, videos and a booking inbox, all run from your phone.",
    tags: ["Shows", "Music", "Bookings"],
  });
}
