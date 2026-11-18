"use client";

import { useEffect } from "react";

/** Removes a server-rendered node after hydration (used for the sr-only profile copy). */
export function RemoveOnMount({ id }: { id: string }) {
  useEffect(() => {
    document.getElementById(id)?.remove();
  }, [id]);
  return null;
}
