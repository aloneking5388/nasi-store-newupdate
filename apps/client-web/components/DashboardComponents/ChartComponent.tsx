"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { get_home_dashboard_data } from "@/store/Dashboard/homeDashboardSlice";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const ChartComponent = () => {
  const dispatch = useAppDispatch();
  const { currencySymbol } = useCurrency();
  const { userInfo } = useAppSelector((state) => state.auth);
  const { monthlyCustomers, monthlyOrders, monthlyRevenue, monthlySales } =
    useAppSelector((state) => state.homeDashboard);
  const role = userInfo?.role;
  const formatChartCurrency = (value: number) =>
    currencySymbol === "UGX"
      ? `${currencySymbol} ${value.toFixed(0)}`
      : `${currencySymbol}${value.toFixed(0)}`;

  const options: ApexOptions = {
    chart: { background: "transparent", foreColor: "#d0d2d6" },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 0.5 },
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    legend: { position: "top" },

    yaxis: [
      {
        seriesName: "Revenue",
        title: { text: `Revenue (${currencySymbol})` },
        labels: {
          formatter: (value: number) => formatChartCurrency(value),
        },
      },
      {
        opposite: true,
        seriesName: "Orders",
        title: { text: "Orders / Customers" },
        labels: {
          formatter: (value: number) => value.toFixed(0),
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val, opts) {
          const { seriesIndex, w } = (opts as any) || {};
          const name = w?.globals?.seriesNames?.[seriesIndex];
          if (name === "Revenue") {
            if (currencySymbol === "UGX") {
              return `UGX ${val?.toLocaleString?.() ?? val}`;
            }
            return `${currencySymbol}${val?.toLocaleString?.() ?? val}`;
          } else {
            return val?.toLocaleString?.() ?? val;
          }
        },
      },
    },
  };

  useEffect(() => {
    dispatch(get_home_dashboard_data());
  }, [dispatch]);

  const getChartDataByRole = (role: string) => {
    if (role === "admin") {
      return {
        series: [
          { name: "Orders", data: monthlyOrders, yAxisIndex: 1 },
          { name: "Revenue", data: monthlyRevenue, yAxisIndex: 0 },
          { name: "Customers", data: monthlyCustomers, yAxisIndex: 1 },
        ],
      };
    } else if (role === "seller") {
      return {
        series: [
          { name: "Orders", data: monthlyOrders, yAxisIndex: 1 },
          { name: "Revenue", data: monthlyRevenue, yAxisIndex: 0 },
          { name: "Sales", data: monthlySales, yAxisIndex: 1 },
        ],
      };
    }
  };

  const chartData = getChartDataByRole(role as string);

  return (
    <ReactApexChart
      options={options}
      series={chartData?.series}
      type="bar"
      height={350}
    />
  );
};

export default ChartComponent;
