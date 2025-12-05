import { Skeleton } from "@/components/ui/skeleton";
import { Tag, MapPin, Map } from "lucide-react";

const InternalNavigationSkeleton = () => {
  return (
    <section className="container mx-auto px-4 py-12 space-y-12 animate-fade-in-up">
      {/* Especialidades Skeleton */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Especialidades
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 20 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-8 w-32 rounded-full animate-pulse" 
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Bairros Skeleton */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Bairros
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-2">
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-6 w-full animate-pulse" 
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Outras Cidades Skeleton */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
          <Map className="h-5 w-5 text-primary" />
          Outras Cidades
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-8 w-28 rounded-full animate-pulse" 
              style={{ animationDelay: `${i * 50}ms` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InternalNavigationSkeleton;
