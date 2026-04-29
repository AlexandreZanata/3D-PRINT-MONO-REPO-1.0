import { Skeleton } from "@/atoms/Skeleton/Skeleton";

/**
 * HeroSkeleton — placeholder for the homepage hero section while
 * site settings load from the API. Prevents layout shift.
 */
export function HeroSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-10 md:pt-16 pb-12 md:pb-20">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-end">
          {/* Text column */}
          <div className="md:col-span-6 lg:col-span-5 space-y-4">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-4/5" />
            <Skeleton className="h-5 w-full mt-4" />
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-3 mt-6">
              <Skeleton className="h-12 w-44 rounded-full" />
              <Skeleton className="h-12 w-24 rounded-full" />
            </div>
          </div>
          {/* Image column */}
          <div className="md:col-span-6 lg:col-span-7">
            <Skeleton className="aspect-[5/4] md:aspect-[6/5] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
}
