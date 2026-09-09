/** Shared motion: quiet navigation; a little momentum only for gestures. */
export const navigationSpring = { type: "spring", bounce: 0, duration: .3 } as const;
export const gestureSpring = { type: "spring", bounce: .15, duration: .35 } as const;
