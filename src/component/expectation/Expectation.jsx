"use client";

import React, { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { getAllExpectation } from "@/lib/fetcher";
import { toast } from "react-toastify";

const Expectation = () => {
  const [expectation, setExpectation] = useState([]);
  const [expectationLoading, setExpectationLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
  });

  const isEmpty = totalItems === 0;

  // ================= FETCH DATA FUNCTION =================
  const fetchExpectation = async (page, size, searchText) => {
    try {
      setExpectationLoading(true);
      setServerError(false);
      const res = await getAllExpectation(page, size, searchText);
      if (res?.success) {
        setExpectation(res.data || []);
        setTotalItems(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setExpectation([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (error) {
      setServerError(true);
      toast.error("Failed to connect to server");
    } finally {
      setExpectationLoading(false);
    }
  };

  useEffect(() => {
    const { search } = filters;

    const delayDebounceFn = setTimeout(() => {
      fetchExpectation(pageNo, pageSize, search);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters, pageNo, pageSize]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPageNo(1);
  };

  // ================= PAGINATION HANDLERS =================
  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    setPageSize(size);
    setPageNo(1);
    fetchExpectation(1, size, filters.search, filters.fromDate, filters.toDate);
  };

  const goToPage = (p) => {
    if (isEmpty) return;
    const next = Math.max(1, Math.min(totalPages, p));
    if (next === pageNo) return;
    setPageNo(next);
    fetchExpectation(
      next,
      pageSize,
      filters.search,
      filters.fromDate,
      filters.toDate,
    );
  };
  const handlePrev = () => goToPage(pageNo - 1);
  const handleNext = () => goToPage(pageNo + 1);

  const getPageWindow = () => {
    if (isEmpty) return [1];
    const pages = [];
    for (
      let i = Math.max(1, pageNo - 2);
      i <= Math.min(totalPages, pageNo + 2);
      i++
    ) {
      pages.push(i);
    }
    return pages.length > 0 ? pages : [1];
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  return (
    <div className="flex-1 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 pt-16 lg:pt-4 overflow-hidden">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold text-black">Expectation Details</h1>
      </div>

      {/* ================= FILTERS SECTION  ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-4 shrink-0 items-end">
        {/* User Search */}
        <div className="relative w-full sm:w-72">
          <input
            name="search"
            type="text"
            placeholder="Search by product..."
            value={filters.search}
            onChange={handleFilterChange}
            className="w-full pl-4 pr-10 py-2 rounded-lg border-2 border-gray-300 text-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
          />
          <IoSearch
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          {expectationLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="relative w-12 h-12 animate-spin">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
              </div>
            </div>
          ) : (
            <table className="min-w-200 w-full border-collapse">
              <thead className="sticky whitespace-nowrap top-0 bg-secondary text-white z-10">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Packing Outward Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Expected Delivery Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Product Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Fitter Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Expected Quantity
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Delivered Quantity
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Pending Quantity
                  </th>
                </tr>
              </thead>
              <tbody>
                {serverError ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-red-500 font-semibold text-lg">
                          Server Connection Issue
                        </span>
                        <p className="text-gray-500 text-sm">
                          We&apos;re having trouble connecting to the database.
                        </p>
                        <button
                          onClick={() => fetchExpectation(pageNo, pageSize, search)}
                          className="mt-2 text-secondary underline text-sm cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : expectation.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-400 font-semibold text-lg">
                          No Data Found
                        </span>
                        <p className="text-gray-400 text-sm">
                          There are no expectation details to display.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  expectation.map((expectation, index) => (
                    <tr
                      key={expectation.id}
                      className={`border-b whitespace-nowrap border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="px-6 py-4 text-sm">
                        {formatDate(expectation.packing_outward_date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {formatDate(expectation.exp_delivery_date)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {expectation.product?.product_name || "-"}
                      </td>
                       <td className="px-6 py-4 text-sm font-medium">
                        {expectation.fitter?.user_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {expectation.exp_gurus || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {expectation.delivered_qty || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm truncate max-w-xs">
                        {expectation.pending_qty || "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t bg-white">
          <div className="text-sm text-gray-600">
            Showing <b>{expectation.length}</b> of <b>{totalItems}</b>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page</span>
              <div className="relative inline-block">
                <select
                  disabled={isEmpty}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="appearance-none border-2 border-gray-300 rounded-lg px-2 py-1 pr-7 text-sm focus:outline-none focus:border-secondary disabled:opacity-50 disabled:bg-gray-50"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <button
              onClick={handlePrev}
              disabled={pageNo <= 1 || isEmpty}
              className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded 
              ${pageNo <= 1 || isEmpty ? "border-gray-300 opacity-50 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50 cursor-pointer"}`}
            >
              <MdKeyboardArrowLeft />
            </button>

            {getPageWindow().map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                disabled={isEmpty}
                className={`w-8 h-8 border-2 rounded text-sm transition-colors ${p === pageNo && !isEmpty
                  ? "bg-secondary text-white font-semibold border-secondary"
                  : "border-gray-300 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={pageNo >= totalPages || isEmpty}
              className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded 
              ${pageNo >= totalPages || isEmpty ? "border-gray-300 opacity-50 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50 cursor-pointer"}`}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expectation;
