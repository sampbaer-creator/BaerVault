export const SHELL_QUICK_ADD_EVENT = "bearvault:shell-quick-add";

export const shellQuickAddActions = ["purchase", "income", "account-transfer", "account", "goal", "category", "account-connect"] as const;
export type ShellQuickAddAction = (typeof shellQuickAddActions)[number];

export function requestShellQuickAdd(action: ShellQuickAddAction) {
  window.dispatchEvent(
    new CustomEvent<ShellQuickAddAction>(SHELL_QUICK_ADD_EVENT, {
      detail: action,
    }),
  );
}
