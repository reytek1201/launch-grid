import type { Photo } from "@/lib/types";
import images from "./images.json";

export { trattoria as site } from "./fixtures/trattoria";
export const images_ = images as Record<string, Photo>;
export { images_ as images };
