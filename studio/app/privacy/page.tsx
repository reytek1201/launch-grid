import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", description: "How LaunchGrid Studio uses what you send." };

export default function Privacy() {
  return (
    <main className="prose">
      <span className="label">Privacy</span>
      <h1>How I use what you send.</h1>
      <p>When you fill in the Start a project form, I use what you send only to reply to you and to prepare a proposal. I don&rsquo;t sell it, and I don&rsquo;t add you to a mailing list.</p>
      <p>To stop the same person sending dozens of messages, the site keeps a scrambled code made from your connection. It cannot be turned back into your address.</p>
      <p>To see which pages people visit, the site uses Vercel Web Analytics. It sets no cookies and doesn&rsquo;t identify you: it counts visits, pages and the kind of device, and nothing more.</p>
      <p>Ask me any time at reytek@launchgrid.studio and I&rsquo;ll delete what you sent.</p>
    </main>
  );
}
