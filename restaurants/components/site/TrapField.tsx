/**
 * A field real visitors never see or reach by keyboard. Bots that fill every input fill it, and the
 * server then drops the request without telling them (see sendRequest in app/actions.ts).
 */
export function TrapField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
      <label>
        Leave this field empty
        <input type="text" name="website" data-trap tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
