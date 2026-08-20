export const SHELL_QUICK_ADD_EVENT = "bearvault:shell-quick-add";

export type ShellQuickAddAction =
  | "account"
  | "account-transfer"
  | "category"
  | "goal"
  | "income";

export function requestShellQuickAdd(action: ShellQuickAddAction) {
  window.dispatchEvent(
    new CustomEvent<ShellQuickAddAction>(SHELL_QUICK_ADD_EVENT, {
      detail: action,
    }),
  );
}
