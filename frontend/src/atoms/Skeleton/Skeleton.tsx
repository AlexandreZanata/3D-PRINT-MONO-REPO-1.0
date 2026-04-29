import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton atom — animated placeholder for loading states.
 * Uses a shimmer animation that respects the design token colors.
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className,
      )}
      aria-hidden="true"
    />
  );
}
