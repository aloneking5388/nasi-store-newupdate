"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { formatPrice } from "@/utils/formatPrice";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BsCurrencyDollar } from "react-icons/bs";
import { RiProductHuntLine } from "react-icons/ri";

const DashboardCard = () => {
  const { userInfo } = useAppSelector((state) => state.auth);
  const { totalProducts, totalRevenue, totalOrders, totalPendingOrders} = useAppSelector((state) => state.homeDashboard)
  const role = userInfo?.role;
  const getSummaryCardsByRole = (role: string) => {
    if (role === "admin") {
      return [
        {
          title: "Total Revenue",
          value: formatPrice(totalRevenue) || 0,
          icon: <BsCurrencyDollar className="text-green-500 text-xl" />,
        },
        {
          title: "Products",
          value: totalProducts || 0,
          icon: <RiProductHuntLine className="text-pink-500 text-xl" />,
        },
        {
          title: "Orders",
          value: totalOrders || 0,
          icon: <AiOutlineShoppingCart className="text-cyan-500 text-xl" />,
        },
        {
          title: "Pending Orders",
          value: totalPendingOrders || 0,
          icon: <AiOutlineShoppingCart className="text-indigo-500 text-xl" />,
        },
      ];
    } else if (role === "seller") {
      return [
        {
          title: "Total Sales",
          value: formatPrice(totalRevenue) || 0,
          icon: <BsCurrencyDollar className="text-green-500 text-xl" />,
        },
        {
          title: "Products",
          value: totalProducts || 0,
          icon: <RiProductHuntLine className="text-pink-500 text-xl" />,
        },
        {
          title: "Orders",
          value: totalOrders || 0,
          icon: <AiOutlineShoppingCart className="text-cyan-500 text-xl" />,
        },
        {
          title: "Pending Orders",
          value: totalPendingOrders || 0,
          icon: <AiOutlineShoppingCart className="text-indigo-500 text-xl" />,
        },
      ];
    }
  };

  const getSummaryCards = getSummaryCardsByRole(role as string);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {getSummaryCards?.map((card, index) => (
        <Card key={index} className="bg-[#283046] text-[#d0d2d6]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardCard;
