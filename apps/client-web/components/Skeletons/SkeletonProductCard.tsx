import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonProductCard = ({ layout = "grid" }: { layout?: "grid" | "list" }) => {
  return (
    <Card
      className={`bg-slate-100 rounded-xl overflow-hidden ${
        layout === "list" ? "flex flex-row items-center" : ""
      }`}
    >
      <div
        className={`relative flex justify-center items-center p-4 ${
          layout === "list" ? "w-[60%] h-[180px]" : ""
        }`}
      >
        <Skeleton className="w-28 h-28 sm:w-32 sm:h-32 rounded-md" />
      </div>

      <CardContent className="px-4 py-2 text-center">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-1/2 mx-auto" />
      </CardContent>
    </Card>
  );
};

export default SkeletonProductCard;
