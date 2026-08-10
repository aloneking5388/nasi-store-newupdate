"use client";
import { useEffect, useState, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaEye } from "react-icons/fa";
import Pagination from "@/components/DashboardComponents/Pagination";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { get_sellers_customes } from "@/store/Admin/adminSlice";

interface UserTableProps {
  type: "customer" | "seller";
  parPageOptions?: number[];
  initialParPage?: number;
}

const parPageOptionsDefault = [5, 15, 25];

const UserTable: React.FC<UserTableProps> = ({
  type,
  parPageOptions = parPageOptionsDefault,
  initialParPage = 5,
}) => {
  const dispatch = useAppDispatch();
  const [parPage, setParPage] = useState<number>(initialParPage);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchValue, setSearchValue] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const { customers, totalCustomers, sellers, totalSellers } = useAppSelector((s) => s.admin);

  const config = {
    customer: {
      data: customers,
      total: totalCustomers,
      extraFilter: (
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#283046] border border-slate-700 rounded px-2 py-1 text-sm text-[#d0d2d6] outline-none"
          value={statusFilter}
        >
          <option value="">Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      ),
      columns: [
        {
          header: "No",
          render: (_: any, idx: number) => idx + 1,
        },
        {
          header: "Image",
          render: (row: any) => (
            <Image
              src={row?.profileImage || "/images/seller.png"}
              alt={row?.name || "user"}
              width={45}
              height={45}
            />
          ),
        },
        { header: "Name", render: (row: any) => row.name },
        { header: "Status", render: (row: any) => row.status },
        { header: "Email", render: (row: any) => row.email },
        { header: "Level", render: (row: any) => row.level },
        { header: "Earning", render: (row: any) => row.earnings },
        { header: "Balance", render: (row: any) => row.invested },
        {
          header: "View",
          render: (row: any) => (
            <Link
              href={`/admin/customers/${row._id}`}
              className="flex flex-col justify-center items-center bg-green-500 p-[6px] rounded hover:shadow-lg hover:shadow-green-500/50"
            >
              <FaEye />
            </Link>
          ),
        },
      ],
    },
    seller: {
      data: sellers,
      total: totalSellers,
       extraFilter: (
        <select
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#283046] border border-slate-700 rounded px-2 py-1 text-sm text-[#d0d2d6] outline-none"
          value={statusFilter}
        >
          <option value="">Status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      ),
      columns: [
        { header: "No", render: (_: any, idx: number) => idx + 1 },
        {
          header: "Image",
          render: (row: any) => (
            <Image
              src={row?.profileImage || "/images/seller.png"}
              alt={row?.name || "seller"}
              width={45}
              height={45}
            />
          ),
        },
        { header: "Name", render: (row: any) => row.name },
        { header: "Shop Name", render: (row: any) => row.shopInfo?.shopName },
        { header: "Status", render: (row: any) => row.status },
        { header: "Email", render: (row: any) => row.email },
        { header: "Division", render: (row: any) => row.shopInfo?.division },
        { header: "District", render: (row: any) => row.shopInfo?.district },
        {
          header: "Action",
          render: (row: any) => (
            <Link
              href={`/admin/sellers/${row._id}`}
              className="flex flex-col justify-center items-center bg-green-500 p-[6px] rounded hover:shadow-lg hover:shadow-green-500/50"
            >
              <FaEye />
            </Link>
          ),
        },
      ],
    },
  } as const;

  const { data, total, columns, extraFilter } = config[type];

  useEffect(() => {
    const payload: any = {
      parPage,
      page: currentPage,
      searchValue,
      status: statusFilter,
    };
    dispatch(get_sellers_customes(payload));
  }, [
    searchValue,
    currentPage,
    parPage,
    statusFilter,
    dispatch,
    type,
  ]);
 
  return (
    <div className="px-2 lg:px-7 pt-5">
      <div className="w-full p-4 bg-[#283046] rounded-md">
        {/* Toolbar */}
        <div className="flex justify-between items-center mb-2">
          <select
            onChange={(e) => setParPage(parseInt(e.target.value))}
            value={parPage}
            className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]"
          >
            {parPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {extraFilter}
            <Input
              onChange={(e) => setSearchValue(e.target.value)}
              value={searchValue}
              className="px-4 py-2 focus:border-indigo-500 outline-none bg-[#283046] border border-slate-700 rounded-md text-[#d0d2d6]"
              type="text"
              placeholder="search"
            />
          </div>
        </div>

        {/* Table */}
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-left text-[#d0d2d6]">
            <thead className="text-xs text-[#d0d2d6] uppercase border-b border-slate-700">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} scope="col" className="py-3 px-4">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm font-normal">
              {data.map((row: any, idx: number) => (
                <tr key={row._id || idx}>
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      scope="row"
                      className="py-1 px-4 font-medium whitespace-nowrap"
                    >
                      {col.render(row, idx)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > parPage && (
          <div className="w-full flex justify-end mt-4 bottom-4 right-4">
            <Pagination
              pageNumber={currentPage}
              setPageNumber={setCurrentPage}
              totalItem={total}
              parPage={parPage}
              showItem={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;
