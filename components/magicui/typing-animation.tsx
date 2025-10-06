"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TypingAnimationProps {
  text?: string;
  texts?: string[];
  duration?: number;
  className?: string;
}

export default function TypingAnimation({
  text,
  texts,
  duration = 50,
  className,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState<string>("");
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(0);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const textArray = texts || (text ? [text] : []);
  const currentText = textArray[currentTextIndex] || "";

  useEffect(() => {
    if (textArray.length === 0) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          // Typing
          if (displayedText.length < currentText.length) {
            setDisplayedText(currentText.slice(0, displayedText.length + 1));
          } else {
            // Finished typing, wait then start deleting (only if multiple texts)
            if (textArray.length > 1) {
              setTimeout(() => setIsDeleting(true), 2000);
            }
          }
        } else {
          // Deleting
          if (displayedText.length > 0) {
            setDisplayedText(displayedText.slice(0, -1));
          } else {
            // Finished deleting, move to next text
            setIsDeleting(false);
            setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? duration / 2 : duration
    );

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentText, textArray, duration]);

  return (
    <span className={cn("inline-block", className)}>
      {displayedText}
      <span className="animate-pulse">|</span>
    </span>
  );
}
