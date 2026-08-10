import { Skeleton } from "@/components/ui/skeleton";

const FromShopSkeleton = () => {
  return (
    <div className="w-full lg:w-[28%] mt-8">
      <div className="pl-4 max-md:pl-0">
        <div className="px-3 rounded-md py-2 font-semibold text-slate-600 bg-slate-200">
          <Skeleton className="h-6 w-full max-w-75" />
        </div>

        <div className="grid justify-center items-center rounded-md grid-cols-1 lg:grid-cols-2 gap-5 mt-3 border p-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 w-full">
              <Skeleton className="w-full h-50 rounded-md" />
              <Skeleton className="h-4 w-32.5" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FromShopSkeleton;
