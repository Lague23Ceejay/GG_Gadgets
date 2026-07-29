import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-surface-light shadow-card
        dark:border-zinc-800 dark:bg-surface-dark dark:shadow-card-dark ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}