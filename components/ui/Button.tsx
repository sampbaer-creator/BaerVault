"use client";

import { Button as MantineButton, type ButtonProps } from "@mantine/core";
import styles from "./Button.module.css";

type Props = Omit<ButtonProps, "variant" | "size"> & {
  variant?: "primary" | "secondary" | "subtle" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({ variant = "primary", ...props }: Props) {
  const mantineVariant = variant === "primary" ? "filled" : variant === "danger" ? "light" : variant === "secondary" ? "outline" : "subtle";
  return <MantineButton {...props} className={`${styles.button} ${props.className ?? ""}`} variant={mantineVariant} color={variant === "danger" ? "red" : "baerTeal"} />;
}
