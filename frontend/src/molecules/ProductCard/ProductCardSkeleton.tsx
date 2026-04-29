import { Skeleton } from "@/atoms/Skeleton/Skeleton";

/**
 * ProductCardSkeleton — placeholder shown while product data loads.
 * Matches the exact dimensions of ProductCard to prevent layout shift.
 */
export function ProductCardSkeleton() {
  return (
    <div aria-hidden="true">
      {/* Image area — matches aspect-[4/5] */}
      <Skeleton className="aspect-[4/5] w-full rounded-xl mb-4" />
      {/* Name line */}
      <Skeleton className="h-5 w-3/4 mb-2" />
      {/* Tagline + price row */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}
