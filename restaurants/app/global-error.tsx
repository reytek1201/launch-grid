"use client";

// Last resort: the root layout itself failed, so this page brings its own html and body.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#2B1D14", color: "#F6EEDD", fontFamily: "Georgia, serif", textAlign: "center", padding: "2rem" }}>
        <main>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>The kitchen dropped a plate.</h1>
          <p style={{ margin: "1rem 0 2rem", fontSize: "1.1rem" }}>Something went wrong on our side.</p>
          <button type="button" onClick={reset} style={{ background: "#d9693f", color: "#2B1D14", border: 0, borderRadius: 999, padding: "0.8rem 1.6rem", fontSize: "1rem", cursor: "pointer" }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
