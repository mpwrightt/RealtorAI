import { Skeleton } from "@/components/ui/skeleton";

export default function SellerLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-12 w-96" />
        <Skeleton className="h-6 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>

      <Skeleton className="h-96" />
    </div>
  );
}
