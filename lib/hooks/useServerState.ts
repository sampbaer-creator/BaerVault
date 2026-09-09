"use client";

import { useState } from "react";

/** Accept a new server snapshot without remounting the screen or losing its UI state. */
export function useServerState<T>(snapshot: T) {
  const [previous, setPrevious] = useState(snapshot);
  const [value, setValue] = useState(snapshot);
  if (previous !== snapshot) {
    setPrevious(snapshot);
    setValue(snapshot);
  }
  return [value, setValue] as const;
}
