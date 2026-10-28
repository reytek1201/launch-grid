import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy", description: "How LaunchGrid Studio uses what you send through the project form, and what analytics the site runs.", alternates: { canonical: "/privacy" } };

export default function Privacy() {
  return (
    <main className="prose">
      <span className="label">Privacy</span>
      <h1>How I use what you send.</h1>
      <p>When you fill in the Start a project form, I use what you send only to reply to you and to prepare a proposal. I don&rsquo;t sell it, and I don&rsquo;t add you to a mailing list.</p>
      <p>To stop the same person sending dozens of messages, the site keeps a scrambled code made from your connection. It cannot be turned back into your address.</p>
      <p>To see which pages people visit, the site uses Vercel Web Analytics. It sets no cookies and doesn&rsquo;t identify you: it counts visits, pages and the kind of device, and nothing more.</p>
      {process.env.NEXT_PUBLIC_GA_ID ? (
        <p>The site also uses Google Analytics, which sets cookies to count visits and see how people find the site. Google&rsquo;s own policy explains what it collects: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">how Google uses information from sites that use its services<span className="sr-only"> (opens in a new tab)</span></a>. You can block it with your browser&rsquo;s cookie settings or <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener">Google&rsquo;s opt-out add-on<span className="sr-only"> (opens in a new tab)</span></a>.</p>
      ) : null}
      <p>Ask me any time at reytek@launchgrid.studio and I&rsquo;ll delete what you sent.</p>
    </main>
  );
}
