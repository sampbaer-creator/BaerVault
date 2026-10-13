"use client";


type AnimatedNumberProps = {
  value: number;
  format: (value: number) => string;
};

export function AnimatedNumber({ value, format }: AnimatedNumberProps) {
  return <span>{format(value)}</span>;
}
