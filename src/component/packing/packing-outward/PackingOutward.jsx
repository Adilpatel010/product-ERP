"use client";

import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoSearch, IoTrashOutline } from "react-icons/io5";
import { FiEdit, FiEye } from "react-icons/fi";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { deletePackingOutward, getAllPackingOutward } from "@/lib/fetcher";
import DeleteConfirmModal from "@/component/models/DeleteConfirmModal";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const PackingOutward = () => {
  const { user, loading } = useAuth();
  const [packingOutward, setPackingOutward] = useState([]);
  const [search, setSearch] = useState("");
  const [outwardLoading, setOutwardLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const isEmpty = totalItems === 0;
  const router = useRouter();

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-GB");
  };

  /* ================= FETCH RAW OUTWARD ================= */
  const fetchPackingOutward = async (page = 1, size = 10, searchText = "") => {
    try {
      setOutwardLoading(true); // Loader start
      setServerError(false);

      const res = await getAllPackingOutward(page, size, searchText);

      if (res?.success) {
        const data = res.data || [];
        setPackingOutward(data);

        setTotalItems(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 0);
      } else {
        setPackingOutward([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error("FETCH ERROR:", error);
      setServerError(true);
      toast.error("Failed to fetch data");
    } finally {
      setOutwardLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      fetchPackingOutward(pageNo, pageSize, search);
    }
  }, [loading, user, pageNo, pageSize]);
  const handleDelete = async (id) => {
    try {
      const res = await deletePackingOutward(id);
      if (res?.success) {
        toast.success("Packing outward deleted successfully");

        const isLastItemOnPage = packingOutward.length === 1 && pageNo > 1;
        const targetPage = isLastItemOnPage ? pageNo - 1 : pageNo;

        if (isLastItemOnPage) {
          setPageNo(targetPage);
        }
        fetchPackingOutward(targetPage, pageSize, search);
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch (err) {
      toast.error("Server error while deleting");
    } finally {
      setOpenDeleteModel(false);
      setSelectedId(null);
    }
  };
  /* ================= PAGINATION LOGIC ================= */
  const goToPage = (p) => {
    if (isEmpty) return;
    const next = Math.max(1, Math.min(totalPages, p));
    if (next === pageNo) return;
    setPageNo(next);
    fetchPackingOutward(next, pageSize, search);
  };

  const handlePrev = () => goToPage(pageNo - 1);
  const handleNext = () => goToPage(pageNo + 1);

  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    setPageSize(size);
    setPageNo(1);
    fetchPackingOutward(1, size, search);
  };

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

  return (
    <div className="flex-1 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 pt-16 lg:pt-4 overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold text-black">Packing Outward</h1>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by product or fitter name"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              if (searchTimeout) clearTimeout(searchTimeout);
              const timeout = setTimeout(() => {
                setPageNo(1);
                if (!user) return;
                fetchPackingOutward(1, pageSize, value);
              }, 500);
              setSearchTimeout(timeout);
            }}
            className="w-full pl-4 pr-10 py-2 rounded-lg border-2 border-gray-300 text-sm transition-all hover:border-secondary focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
          <IoSearch
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <Link
          href="/packing/packing-outward/add-outward"
          className="px-6 py-2 w-fit bg-secondary text-sm text-white rounded-lg hover:bg-primary transition-all font-semibold shadow-md hover:shadow-lg cursor-pointer sm:w-auto text-center"
        >
          Add Packing Outward
        </Link>
      </div>

      {/* ================= TABLE ================= */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          {outwardLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
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
                    Outward Date
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Product Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Color
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Fitter
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Created By
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Updated By
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Action
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
                        <button
                          onClick={() =>
                            fetchPackingOutward(pageNo, pageSize, search)
                          }
                          className="mt-2 text-secondary underline text-sm cursor-pointer"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : packingOutward.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-400 font-semibold text-lg">
                          No Data Found
                        </span>
                        <p className="text-gray-400 text-sm">
                          There are no packing outward to display.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  packingOutward.map((outward, index) => (
                    <tr
                      key={outward.id}
                      className={`border-b whitespace-nowrap border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      {/* 1. Outward Date */}
                      <td className="px-6 py-4 text-sm">
                        {formatDate(outward.outward_date)}
                      </td>

                      {/* 2. Product Name */}
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {outward.product?.product_name || "-"}
                      </td>

                      {/* 3. Color */}
                      <td className="px-6 py-4 text-sm">
                        {outward.product?.color || "All Color"}
                      </td>

                      {/* 3. Fitter */}
                      <td className="px-6 py-4 text-sm">
                        {outward.fitter?.user_name || "-"}
                      </td>

                      {/* 4. Created By */}
                      <td className="px-6 py-4 text-sm">
                        {outward.created_by?.username}
                        <span className="text-xs text-gray-400 ml-1">
                          ({outward.created_by?.role})
                        </span>
                      </td>

                      {/* 5. Updated By */}
                      <td className="px-6 py-4 text-sm">
                        {outward.updated_by?.username}
                        <span className="text-xs text-gray-400 ml-1">
                          ({outward.updated_by?.role})
                        </span>
                      </td>

                      {/* 6. Action */}
                      <td className="px-6 py-4">
                        <div className="flex gap-4">
                          <FiEye
                            className="cursor-pointer text-primary hover:text-blue-600"
                            title="View"
                            onClick={() =>
                              router.push(
                                `/packing/packing-outward/view-packing-outward/${outward.id}`,
                              )
                            }
                          />
                          <FiEdit
                            className="cursor-pointer text-primary hover:text-blue-600"
                            title="Edit"
                            onClick={() =>
                              router.push(
                                `/packing/packing-outward/edit-packing-outward/${outward.id}`,
                              )
                            }
                          />
                          <IoTrashOutline
                            className="cursor-pointer text-red-500 hover:text-red-700"
                            title="Delete"
                            onClick={() => {
                              setSelectedId(outward.id);
                              setOpenDeleteModel(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= FOOTER / PAGINATION ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t bg-white">
          <div className="text-sm text-gray-600">
            Showing <b>{packingOutward.length}</b> of <b>{totalItems}</b>
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
                    xmlns="http://www.w3.org/2000/svg"
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

      {/* ================= DELETE MODAL ================= */}
      <DeleteConfirmModal
        open={openDeleteModel}
        onClose={() => {
          setOpenDeleteModel(false);
          setSelectedId(null);
        }}
        onConfirm={() => handleDelete(selectedId)}
        title="Delete Packing Outward"
        message="Are you sure you want to delete this record? This action cannot be undone."
      />




    </div>
  );
};

export default PackingOutward;
