import ChartComponent from "@/components/DashboardComponents/ChartComponent";
import DashboardCard from "@/components/DashboardComponents/DashboardCard";
import Orderlist from "@/components/DashboardComponents/Orderlist";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import AdminSellerPaymentsOverview from "@/components/AdminComponents/SellerPaymentsOverview";

const AdminDashboard = () => {
  return (
    <div className="px-4 py-6 space-y-6">
      <DashboardCard />
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="w-full lg:w-7/12 bg-[#283046]">
          <CardContent>
            <ChartComponent />
          </CardContent>
        </Card>
        <Card className="w-full lg:w-5/12 lg:pl-4 bg-[#283046] text-[#d0d2d6] mt-6 lg:mt-0">
          <CardContent>
            <AdminSellerPaymentsOverview />
          </CardContent>
        </Card>
      </div>
      <Orderlist />
    </div>
  );
};

export default AdminDashboard;

