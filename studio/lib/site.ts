export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://launchgrid.studio").replace(/\/$/, "");
/** Until launchgrid.studio is the real address, search engines are asked to stay away. */
export const isLive = () => process.env.SITE_LIVE === "1";
