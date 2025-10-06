"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  blur?: string;
  yOffset?: number;
  inView?: boolean;
}

export default function BlurFade({
  children,
  className,
  delay = 0,
  duration = 0.4,
  blur = "6px",
  yOffset = 6,
  inView = true,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !inView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          ref.current?.style.setProperty("--blur-fade-delay", `${delay}s`);
          ref.current?.style.setProperty("--blur-fade-duration", `${duration}s`);
          ref.current?.style.setProperty("--blur-fade-blur", blur);
          ref.current?.style.setProperty("--blur-fade-y", `${yOffset}px`);
          ref.current?.classList.add("blur-fade-in");
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [delay, duration, blur, yOffset, inView]);

  return (
    <div
      ref={ref}
      className={cn("blur-fade", className)}
      style={{
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
}
