import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileCardSkeleton = () => {
  return (
    <Card className="overflow-hidden animate-fade-in-up">
      {/* Image skeleton */}
      <Skeleton className="aspect-[3/4] w-full" />
      
      <div className="p-4">
        {/* Name + Rating skeleton */}
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-6 w-32 animate-pulse" style={{ animationDelay: '100ms' }} />
          <Skeleton className="h-6 w-12 animate-pulse" style={{ animationDelay: '150ms' }} />
        </div>

        {/* Location + Age + Price skeleton */}
        <div className="flex items-center gap-3 mb-3">
          <Skeleton className="h-4 w-20 animate-pulse" style={{ animationDelay: '200ms' }} />
          <Skeleton className="h-4 w-16 animate-pulse" style={{ animationDelay: '250ms' }} />
          <Skeleton className="h-4 w-16 animate-pulse" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Badges skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Skeleton className="h-6 w-16 animate-pulse" style={{ animationDelay: '350ms' }} />
          <Skeleton className="h-6 w-20 animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>

        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <Skeleton className="h-4 w-full animate-pulse" style={{ animationDelay: '450ms' }} />
          <Skeleton className="h-4 w-3/4 animate-pulse" style={{ animationDelay: '500ms' }} />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <Skeleton className="h-5 w-16 animate-pulse" style={{ animationDelay: '550ms' }} />
          <Skeleton className="h-5 w-20 animate-pulse" style={{ animationDelay: '600ms' }} />
          <Skeleton className="h-5 w-14 animate-pulse" style={{ animationDelay: '650ms' }} />
        </div>
      </div>
    </Card>
  );
};

export default ProfileCardSkeleton;
