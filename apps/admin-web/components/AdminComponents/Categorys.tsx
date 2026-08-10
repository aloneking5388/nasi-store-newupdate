"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import Image from "next/image";
import Link from "next/link";
import { FaEdit, FaTrash } from "react-icons/fa";
import { get_category } from "@/store/Categoris/categorySlice";
import Pagination from "@/components/DashboardComponents/Pagination";
import Search from "@/components/DashboardComponents/Search";

const Categories = () => {
  const dispatch = useAppDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(5);
  const { successMessage, categorys, totalCategory } = useAppSelector(
    (state) => state.category,
  );

  useEffect(() => {
    dispatch(
      get_category({
        parPage,
        page: currentPage,
        searchValue,
      }),
    );
  }, [searchValue, currentPage, parPage, successMessage]);

  return (
    <div className="w-full p-4  bg-[#283046]rounded-md">
      <Search
        setParPage={setParPage}
        setSearchValue={setSearchValue}
        searchValue={searchValue}
      />
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-[#d0d2d6]">
          <thead className="text-sm text-[#d0d2d6] uppercase border-b border-slate-700">
            <tr>
              <th scope="col" className="py-3 px-4">
                No
              </th>
              <th scope="col" className="py-3 px-4">
                Image
              </th>
              <th scope="col" className="py-3 px-4">
                Name
              </th>
              <th scope="col" className="py-3 px-4">
                Subcategories
              </th>
              <th scope="col" className="py-3 px-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {categorys.map((d, i) => (
              <tr key={i}>
                <td
                  scope="row"
                  className="py-1 px-4 font-medium whitespace-nowrap"
                >
                  {i + 1}
                </td>
                <td
                  scope="row"
                  className="py-1 px-4 font-medium whitespace-nowrap"
                >
                  <Image width={45} height={45} src={d.image} alt="category" />
                </td>
                <td
                  scope="row"
                  className="py-1 px-4 font-medium whitespace-nowrap"
                >
                  <span>{d.name}</span>
                </td>
                <td
                  scope="row"
                  className="py-1 px-4 font-medium whitespace-nowrap"
                >
                  <span>{(d.subcategories || []).join(", ") || "-"}</span>
                </td>
                <td
                  scope="row"
                  className="py-1 px-4 font-medium whitespace-nowrap"
                >
                  <div className="flex justify-start items-center gap-4">
                    <Link
                      href={"#"}
                      className="p-1.5 bg-yellow-500 rounded hover:shadow-lg hover:shadow-yellow-500/50"
                    >
                      <FaEdit />
                    </Link>
                    <Link
                      href={"#"}
                      className="p-1.5 bg-red-500 rounded hover:shadow-lg hover:shadow-red-500/50"
                    >
                      <FaTrash />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="w-full flex justify-end mt-4 bottom-4 right-4">
        <Pagination
          pageNumber={currentPage}
          setPageNumber={setCurrentPage}
          totalItem={totalCategory}
          parPage={parPage}
          showItem={4}
        />
      </div>
    </div>
  );
};

export default Categories;
