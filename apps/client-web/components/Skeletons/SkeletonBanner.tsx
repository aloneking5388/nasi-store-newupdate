import { Skeleton } from "@/components/ui/skeleton";

const SkeletonBanner = () => {
  return (
    <div className="w-full sm:h-[400px] h-[110px] rounded-sm overflow-hidden">
      <Skeleton className="w-full h-full rounded-sm" />
    </div>
  );
};

export default SkeletonBanner;
