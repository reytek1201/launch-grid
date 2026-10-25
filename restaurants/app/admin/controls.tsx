import { moveRow, setHidden } from "./actions";
import { Submit } from "./submit";
import { btn } from "./ui";

const arrow = "grid h-9 w-9 place-items-center rounded-full border border-espresso/20 text-espresso/75 transition-colors duration-[250ms] hover:border-espresso hover:text-espresso active:scale-95";

/** Move up / move down for a row inside its list. */
export function Arrows({ table, id, first, last, what }: { table: string; id: string; first: boolean; last: boolean; what: string }) {
  return (
    <span className="inline-flex gap-1.5">
      <form action={moveRow.bind(null, table, id, -1)}>
        <Submit busy="…" className={`${arrow} ${first ? "pointer-events-none opacity-30" : ""}`}><span className="sr-only">Move {what} up</span><span aria-hidden>↑</span></Submit>
      </form>
      <form action={moveRow.bind(null, table, id, 1)}>
        <Submit busy="…" className={`${arrow} ${last ? "pointer-events-none opacity-30" : ""}`}><span className="sr-only">Move {what} down</span><span aria-hidden>↓</span></Submit>
      </form>
    </span>
  );
}

export function HideButton({ table, id, hidden, what }: { table: string; id: string; hidden: boolean; what: string }) {
  return (
    <form action={setHidden.bind(null, table, id, !hidden)}>
      <Submit busy="…" className={`${btn} !min-h-9`}>
        {hidden ? "Show" : "Hide"}<span className="sr-only"> {what}</span>
      </Submit>
    </form>
  );
}
