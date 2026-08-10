import { Skeleton } from "../ui/skeleton";

const RelatedProductSkeleton = () => {
  return (
    <div className="flex flex-wrap justify-center gap-6">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div
          key={idx}
          className="flex lg:flex-row flex-col min-w-[230px] max-w-[350px] bg-slate-100 rounded-md shadow-md"
        >
          <div className="relative h-[200px] w-[200px]">
            <Skeleton className="h-full w-full rounded object-cover" />
            <div className="absolute top-2 left-2">
              <Skeleton className="w-9 h-9 rounded-full bg-red-400 opacity-70" />
            </div>
          </div>
          <div className="p-4 flex flex-col gap-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-6 w-[100px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        </div>
      ))}
      <div className="w-full flex justify-center items-center py-10">
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="w-4 h-4 rounded-full bg-slate-300" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProductSkeleton;
