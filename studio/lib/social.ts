/** LaunchGrid's own social accounts. One list: footer tiles and the structured data (sameAs) both read it. */
export const SOCIAL = [
  { id: "instagram", name: "Instagram", handle: "@launchgrid.studio", url: "https://www.instagram.com/launchgrid.studio/" },
  { id: "tiktok", name: "TikTok", handle: "@launchgrid.studio", url: "https://www.tiktok.com/@launchgrid.studio" },
  { id: "facebook", name: "Facebook", handle: "LaunchGrid Studio", url: "https://www.facebook.com/people/LaunchGrid-Studio/61596078538745/" },
] as const;

export type SocialId = (typeof SOCIAL)[number]["id"];
