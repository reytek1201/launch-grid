"use client";

import { useSyncExternalStore } from "react";
import { todayIn } from "@/lib/reserve";

const subscribe = () => () => {};

/** Today's date (YYYY-MM-DD) in the restaurant's time zone, or undefined while the page is rendered ahead of time.
 *  Read in the browser so the build date never ends up in the HTML. */
export function useToday(timeZone: string): string | undefined {
  return useSyncExternalStore(subscribe, () => todayIn(timeZone).date, () => undefined);
}
