export type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let prompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

export function setInstallPrompt(next: InstallPromptEvent | null) {
  prompt = next;
  listeners.forEach((listener) => listener());
}

export const getInstallPrompt = () => prompt;
export const getServerInstallPrompt = () => null;
export function subscribeInstallPrompt(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
