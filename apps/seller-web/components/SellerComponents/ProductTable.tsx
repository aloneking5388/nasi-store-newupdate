"use client";

import Search from "@/components/DashboardComponents/Search";
import { useCurrency } from "@/components/Wrappers/CurrencyProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import { GiKnightBanner } from "react-icons/gi";
import Pagination from "@/components/DashboardComponents/Pagination";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { formatPrice } from "@/utils/formatPrice";

type Props = {
  products: any[];
  totalProducts: number;
  fetchFunction: (params: any) => void;
  onDelete: (id: string) => void;
  successMessage?: string | null;
  errorMessage?: string | null;
  clearMessage: () => void;
  showOnlyDiscounted?: boolean;
};

const ProductTable = ({
  products,
  totalProducts,
  fetchFunction,
  onDelete,
  successMessage,
  errorMessage,
  clearMessage,
  showOnlyDiscounted = false,
}: Props) => {
  const { formatCurrency } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [parPage, setParPage] = useState(5);

  useEffect(() => {
    fetchFunction({
      parPage: Number(parPage),
      page: Number(currentPage),
      searchValue,
    });
  }, [currentPage, searchValue, parPage]);

  useEffect(() => {
    if (errorMessage) {
      toast.error(errorMessage);
      clearMessage();
    }
    if (successMessage) {
      toast.success(successMessage);
      clearMessage();
    }
  }, [errorMessage, successMessage]);

  const filteredProducts = showOnlyDiscounted
    ? products.filter((p) => p.discount > 0)
    : products;

  return (
    <div className="w-full p-4 bg-[#283046] rounded-md">
      <Search
        setParPage={setParPage}
        setSearchValue={setSearchValue}
        searchValue={searchValue}
      />
      <div className="relative overflow-x-auto mt-5">
        <Table className="w-full text-sm text-left text-[#d0d2d6]">
          <TableHeader className="text-sm text-white uppercase border-b border-slate-700">
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((d, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <Image
                    src={d.images[0]}
                    alt={d.brand}
                    width={45}
                    height={45}
                  />
                </TableCell>
                <TableCell>{d.name?.slice(0, 16)}...</TableCell>
                <TableCell>{d.category}</TableCell>
                <TableCell>{d.brand}</TableCell>
                <TableCell>{formatCurrency(d.price)}</TableCell>
                <TableCell>
                  {d.discount === 0 ? "No Discount" : `${d.discount}%`}
                </TableCell>
                <TableCell>{d.stock}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link
                      href={`/seller/allproducts/editproduct/${d.id}`}
                      className="p-1.5 bg-yellow-500 rounded"
                    >
                      <FaEdit />
                    </Link>
                    <Link
                      href={`/seller/allproducts/editproduct/${d.id}`}
                      className="p-1.5 bg-green-500 rounded"
                    >
                      <FaEye />
                    </Link>
                    <Button
                      onClick={() => onDelete(d.id)}
                      className="p-1.5 w-7 h-7 bg-red-500 rounded"
                    >
                      <FaTrash />
                    </Button>
                    <Link
                      href={`/seller/banner/${d.id}`}
                      className="p-1.5 bg-cyan-500 rounded"
                    >
                      <GiKnightBanner />
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalProducts > parPage && (
        <div className="w-full flex justify-end mt-4">
          <Pagination
            pageNumber={currentPage}
            setPageNumber={setCurrentPage}
            totalItem={totalProducts}
            parPage={parPage}
            showItem={4}
          />
        </div>
      )}
    </div>
  );
};

export default ProductTable;
