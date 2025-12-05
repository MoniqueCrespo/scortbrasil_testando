import { Skeleton } from "@/components/ui/skeleton";

const FeedCardSkeleton = () => {
  return (
    <div className="relative h-screen w-full snap-start animate-fade-in-up">
      <Skeleton className="absolute inset-0 rounded-none" />
      
      {/* Info skeleton at bottom */}
      <div className="absolute bottom-24 left-4 right-4 space-y-3">
        <Skeleton className="h-10 w-48 animate-pulse" style={{ animationDelay: '100ms' }} />
        <Skeleton className="h-6 w-32 animate-pulse" style={{ animationDelay: '200ms' }} />
        <Skeleton className="h-8 w-24 animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
      
      {/* Action buttons skeleton */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-3">
        <Skeleton className="h-14 w-14 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
        <Skeleton className="h-14 w-14 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
        <Skeleton className="h-14 w-14 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};

export default FeedCardSkeleton;
