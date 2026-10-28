import { ogImage, ogSize, ogType } from "@/lib/og";

export const alt = "Start a project with LaunchGrid Studio: tell me what you're launching";
export const size = ogSize;
export const contentType = ogType;

export default function Image() {
  return ogImage({
    kicker: "Start a project",
    title: "Tell me what you’re launching.",
    sub: "A few lines is enough. I reply in writing by the next business day.",
    tags: ["No calls", "In writing"],
  });
}
