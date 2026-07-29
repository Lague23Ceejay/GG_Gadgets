import { useTheme } from "@/context/ThemeContext";

/**
 * Signature element: styled like a physical rocker power switch rather than
 * a generic sun/moon icon toggle — ties into the "gadgets" brand identity.
 */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      onClick={toggleTheme}
      className="group relative inline-flex h-8 w-14 items-center rounded-full border transition-theme
        border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
    >
      <span className="sr-only">Toggle theme</span>

      {/* Track labels: tiny power glyphs for a physical-switch feel */}
      <span
        aria-hidden
        className="absolute left-1.5 text-[9px] font-mono text-zinc-400 dark:text-accent-300 select-none"
      >
        ON
      </span>
      <span
        aria-hidden
        className="absolute right-1.5 text-[9px] font-mono text-zinc-400 dark:text-zinc-600 select-none"
      >
        OFF
      </span>

      {/* Rocker knob */}
      <span
        aria-hidden
        className={`z-10 inline-block h-6 w-6 transform rounded-full shadow-card transition-theme
          bg-white dark:bg-accent-500
          ${isDark ? "translate-x-7" : "translate-x-1"}`}
      />
    </button>
  );
}
