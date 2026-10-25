// A new template instance mounts on every navigation, so each page eases in.
// Pure CSS on purpose: the server-rendered text is visible without waiting for JavaScript,
// which keeps first paint fast on slow phones. (See .page-in in globals.css.)
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
