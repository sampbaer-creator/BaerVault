import { notifications } from "@mantine/notifications";
import { Button } from "@mantine/core";
import type { ReactNode } from "react";

export const notify = {
  success(message: ReactNode, options: { undo?: () => void } = {}) {
    notifications.show({ color: "baerTeal", message: <span>{message}{options.undo && <Button variant="subtle" size="compact-sm" onClick={options.undo} aria-label="Undo this action">Undo</Button>}</span> });
  },
};
