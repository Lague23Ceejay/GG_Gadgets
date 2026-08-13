// Input.tsx
import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";
{/**
 * A reusable input component with a label. The label is optional and can be
 * styled via the className prop. The input itself can also be styled via the
 * className prop.
 */}
export function Input({ className = "", ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm
        text-zinc-900 placeholder:text-zinc-400 transition-theme
        focus:border-accent-500
        dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600
        ${className}`}
      {...rest}
    />
  );
}

export function Label({ className = "", ...rest }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300 ${className}`}
      {...rest}
    />
  );
}
