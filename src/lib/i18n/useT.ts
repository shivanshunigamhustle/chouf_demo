"use client";

import { useChoufStore } from "../store";
import messages from "./messages";

function getPath(obj: unknown, path: string): string {
  const val = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  return typeof val === "string" ? val : path;
}

export function useT() {
  const locale = useChoufStore((s) => s.locale);
  const dict = messages[locale];
  const t = (path: string) => getPath(dict, path);
  return { t, locale };
}
