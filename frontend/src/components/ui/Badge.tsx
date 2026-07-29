import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "neutral" | "accent" | "spark" | "success" | "danger";
  children: ReactNode;
}

const toneStyles: Record<string, string> = {
  neutral: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  accent: "bg-accent-50 text-accent-700 dark:bg-accent-500/15 dark:text-accent-300",
  spark: "bg-spark-400/20 text-amber-800 dark:text-spark-400",
  success: "bg-success-500/15 text-success-600 dark:text-success-500",
  danger: "bg-danger-500/15 text-danger-600 dark:text-danger-500",
};

export function Badge({ tone = "neutral", className = "", children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneStyles[tone]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
