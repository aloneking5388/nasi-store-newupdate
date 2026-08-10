import { Skeleton } from "@/components/ui/skeleton";

const SkeletonProductCarouselItem = () => {
  return (
    <div className="flex flex-row lg:h-[180px] bg-slate-200 rounded-md overflow-hidden items-center p-4">
      <Skeleton className="w-[100px] h-[100px] mr-4 rounded" />
      <div className="flex flex-col justify-between items-start gap-2 w-full">
        <Skeleton className="w-2/3 h-4" />
        <Skeleton className="w-1/3 h-5" />
      </div>
    </div>
  );
};

export default SkeletonProductCarouselItem;
