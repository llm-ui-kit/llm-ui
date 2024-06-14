import { cn } from "@/lib/utils";
import React from "react";

export const BackgroundCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn(
        "bg-background group relative overflow-hidden rounded-2xl border p-5 md:p-8",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 aspect-video -translate-y-1/2 rounded-full border bg-gradient-to-b from-purple-500/80 to-white opacity-25 blur-2xl duration-300 group-hover:-translate-y-1/4 dark:from-white dark:to-white dark:opacity-5 dark:group-hover:opacity-10"
      />
      {children}
    </div>
  );
});

BackgroundCard.displayName = "BackgroundCard";
