import Link from "next/link";

export default function NotFound() {
  return (
    <main className="prose">
      <span className="label">404</span>
      <h1>Nothing here.</h1>
      <p>The page may have moved.</p>
      <p><Link className="btn" href="/">Back to the home page</Link></p>
    </main>
  );
}
