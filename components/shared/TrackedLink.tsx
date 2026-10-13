"use client";

import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";

import { track } from "@/lib/analytics/track";

type TrackedLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    event: string;
    eventProps?: Record<string, unknown>;
  };

export function TrackedLink({ event, eventProps, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        track(event, eventProps);
        onClick?.(e);
      }}
    />
  );
}
