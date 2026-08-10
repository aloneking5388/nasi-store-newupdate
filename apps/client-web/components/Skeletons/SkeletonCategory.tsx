import { Skeleton } from "@/components/ui/skeleton";

const SkeletonCategory = () => {
  return (
    <div className="block p-[2px] border w-full rounded-md bg-slate-200 aspect-square">
      <div className="w-full h-full gap-y-2 flex-col relative flex justify-center items-center">
        <Skeleton className="w-[50%] h-[50%] rounded-md" />
        <Skeleton className="w-[60%] h-3 mt-2" />
      </div>
    </div>
  );
};

export default SkeletonCategory;
