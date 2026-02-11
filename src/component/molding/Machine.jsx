"use client";
import React, { useEffect, useState } from "react";
import { IoSearch, IoTrashOutline } from "react-icons/io5";
import { FiEdit, FiEye } from "react-icons/fi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { toast } from "react-toastify";
import {
  getAllMachines,
  createMachine,
  updateMachine,
  deleteMachine,
  toggleMachine,
} from "@/lib/fetcher";
import DeleteConfirmModal from "../models/DeleteConfirmModal";
import { useAuth } from "@/context/AuthContext";

const Machine = () => {
  const { user } = useAuth();
  const [machines, setMachines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [machineForm, setMachineForm] = useState({
    name: "",
    description: "",
  });

  const [editId, setEditId] = useState(null);

  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);

  // ===== PAGINATION STATE  =====
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const isEmpty = totalItems === 0;

  const fetchMachines = async (page = 1, size = 10, searchTerm = "") => {
    try {
      setLoading(true);
      const res = await getAllMachines(page, size, searchTerm);

      if (res && res.data) {
        setMachines(res.data);
        setTotalItems(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setMachines([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      toast.error("Failed to load machines");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchMachines(1, pageSize);
  }, []);

  const goToPage = (p) => {
    if (isEmpty) return;
    const next = Math.max(1, Math.min(totalPages, p));
    if (next === pageNo) return;
    setPageNo(next);
    fetchMachines(next, pageSize, search);
  };

  const handlePrev = () => goToPage(pageNo - 1);
  const handleNext = () => goToPage(pageNo + 1);

  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    setPageSize(size);
    setPageNo(1);
    fetchMachines(1, size, search);
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



  // ===== TOGGLE STATUS =====

  const handleToggleStatus = async (id) => {
    try {
      await toggleMachine(id);
      toast.success("Status updated");
      fetchMachines(pageNo, pageSize, search);
    } catch {
      toast.error("Failed to update status");
    }
  };


  // ====== DELETE MACHINE =====

  const handleDelete = async (id) => {
    try {
      await deleteMachine(id);
      toast.success("Machine deleted successfully");

      const isLastItem = machines.length === 1 && pageNo > 1;
      const targetPage = isLastItem ? pageNo - 1 : pageNo;

      if (isLastItem) setPageNo(targetPage);

      fetchMachines(targetPage, pageSize, search);
    } catch (err) {
      toast.error("Failed to delete machine");
    } finally {
      setOpenDeleteModel(false);
      setSelectedId(null);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMachineForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!machineForm.name || !machineForm.name.trim()) {
      toast.error("Machine name is required");
      return;
    }

    if (!machineForm.description || !machineForm.description.trim()) {
      toast.error("Machine description is required");
      return;
    }

    const payload = {
      name: machineForm.name.trim(),
      description: machineForm.description.trim(),
    };

    try {
      setIsSubmitting(true);

      if (editId) {
        await updateMachine(editId, payload);
        toast.success("Machine updated successfully");
      } else {
        await createMachine(payload);
        toast.success("Machine added successfully");
      }

      setMachineForm({ name: "", description: "" });
      setEditId(null);

      const targetPage = editId ? pageNo : 1;
      if (!editId) setPageNo(1);

      fetchMachines(targetPage, pageSize, search);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setMachineForm({
      name: "",
      description: "",
    });
    setEditId(null);
  };

  return (
    <div className=" bg-grey flex flex-col pb-1 overflow-hidden gap-4">
      {/* ================= ADD MACHINE (TOP / FIXED) ================= */}
      <div className="bg-white rounded-2xl shadow-sm px-4 py-3  shrink-0">
        <h1 className="text-xl font-semibold text-black mb-2">
          {editId ? "Edit Machine" : "Add Machine"}
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Machine Name
              </label>
              <input
                type="text"
                name="name"
                value={machineForm.name}
                onChange={handleChange}
                placeholder="Enter machine name"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 text-sm
               focus:outline-none focus:border-secondary
              focus:ring-2 focus:ring-secondary/20"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Machine Description
              </label>
              <input
                type="text"
                name="description"
                value={machineForm.description}
                onChange={handleChange}
                placeholder="Enter machine description"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-300 text-sm
               focus:outline-none focus:border-secondary
              focus:ring-2 focus:ring-secondary/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleCancel}
              className="w-28 px-4 py-2 text-secondary rounded-lg border-2 border-gray-300 text-sm font-semibold hover:bg-gray-100 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-28 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-semibold hover:bg-primary shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {/* {isSubmitting && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )} */}

              {isSubmitting
                ? editId
                  ? "Updating..."
                  : "Adding..."
                : editId
                  ? "Update"
                  : "Add"}
            </button>

          </div>
        </form>
      </div>

      {/* ================= SEARCH (FIXED LIKE SUPPLIER FILTERS) ================= */}
      <div className="shrink-0">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search machine"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);

              if (searchTimeout) clearTimeout(searchTimeout);

              const timeout = setTimeout(() => {
                setPageNo(1);
                fetchMachines(1, pageSize, value);
              }, 500);

              setSearchTimeout(timeout);
            }}
            className="w-full pl-4 pr-10 py-2 rounded-lg border-2 border-gray-300 text-sm
            hover:border-secondary focus:outline-none focus:border-secondary
            focus:ring-2 focus:ring-secondary/20"
          />
          <IoSearch
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* ================= MACHINE LIST (FLEX-1) ================= */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* TABLE */}
        <div className="overflow-auto flex-1 custom-scrollbar">

          <table className="min-w-200 w-full border-collapse">
            <thead className="sticky top-0 bg-secondary text-white z-10">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Machine Name
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Description
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  status
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {" "}
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-20">
                    <div className="flex items-center justify-center w-full">
                      <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
                      </div>
                    </div>
                  </td>
                </tr>
              ) : machines.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-gray-400 font-semibold text-lg">No Data Found</span>
                      <p className="text-gray-400 text-sm">There are no machine to display.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                machines.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b whitespace-nowrap border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {item.name}
                    </td>

                    <td className="px-6 py-4 text-sm">{item.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* TOGGLE */}
                        <div
                          onClick={() => handleToggleStatus(item.id)}
                          className={`w-9 h-5 px-0.5 flex items-center rounded-full cursor-pointer transition-colors ${item.status === "active"
                            ? "bg-secondary justify-end"
                            : "bg-gray-300 justify-start"
                            }`}
                        >
                          <div className="w-4 h-4 bg-white rounded-full transition-all duration-200" />
                        </div>

                        <span
                          className={`text-sm font-semibold ${item.status === "active"
                            ? "text-green-600"
                            : "text-gray-500"
                            }`}
                        >
                          {item.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-4">
                        <FiEdit
                          className="cursor-pointer text-primary hover:text-blue-600"
                          onClick={() => {
                            setEditId(item.id);
                            setMachineForm({
                              name: item.name,
                              description: item.description || "",
                            });

                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                        />

                        <IoTrashOutline
                          className="cursor-pointer text-red-500 hover:text-red-700"
                          onClick={() => {
                            setSelectedId(item.id);
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
          {/* )} */}
        </div>

        {/* ================= PAGINATION ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t bg-white">
          {/* INFO */}
          <div className="text-sm text-gray-600">
            Showing <b>{machines.length}</b> of <b>{totalItems}</b>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* PER PAGE */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page</span>
              <div className="relative inline-block">
                <select
                  disabled={isEmpty}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="appearance-none border-2 border-gray-300 rounded-lg px-2 py-1 pr-7 text-sm focus:outline-none focus:border-secondary disabled:opacity-50"
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

            {/* PREV */}
            <button
              onClick={handlePrev}
              disabled={pageNo <= 1 || isEmpty}
              className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded
      ${pageNo <= 1 || isEmpty
                  ? "border-gray-300 opacity-50 cursor-not-allowed"
                  : "border-gray-300 hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <MdKeyboardArrowLeft />
            </button>

            {/* PAGE NUMBERS */}
            {getPageWindow().map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                disabled={isEmpty}
                className={`w-8 h-8 border-2 rounded text-sm transition-colors
        ${p === pageNo && !isEmpty
                    ? "bg-secondary text-white font-semibold border-secondary"
                    : "border-gray-300 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
                  }`}
              >
                {p}
              </button>
            ))}

            {/* NEXT */}
            <button
              onClick={handleNext}
              disabled={pageNo >= totalPages || isEmpty}
              className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded
      ${pageNo >= totalPages || isEmpty
                  ? "border-gray-300 opacity-50 cursor-not-allowed"
                  : "border-gray-300 hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        open={openDeleteModel}
        onClose={() => setOpenDeleteModel(false)}
        onConfirm={() => handleDelete(selectedId)}
        title="Delete Machine"
        message="Are you sure you want to delete this machine? This action cannot be undone."
      />
    </div>
  );
};

export default Machine;
