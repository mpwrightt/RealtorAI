"use client";

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  return (
    <button
      style={
        {
          "--spread": "90deg",
        } as CSSProperties
      }
      className={cn(
        "group relative inline-flex h-14 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-950 px-8 font-medium text-neutral-50 transition-all duration-500 hover:bg-gradient-to-l hover:from-neutral-800 hover:to-neutral-900",
        "dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900 dark:hover:from-neutral-700 dark:hover:to-neutral-800",
        // Shiny effect
        "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      
      {/* Rainbow border effect on hover */}
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-70" />
    </button>
  );
}

export default ShinyButton;
