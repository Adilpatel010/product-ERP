import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoSearch, IoTrashOutline } from "react-icons/io5";
import { FiEdit, FiEye } from "react-icons/fi";
import { toast } from "react-toastify";
import {
    deleteSupplier,
    getAllSuppliers,
    getSupplierById,
} from "@/lib/fetcher";
import CreateSupplierModel from "../models/supplier/CreateSupplierModel";
import DeleteConfirmModal from "../models/DeleteConfirmModal";
import EditSupplierModel from "../models/supplier/EditSupplierModel";
import ViewSupplierModel from "../models/supplier/ViewSupplierModel";
import { useAuth } from "@/context/AuthContext";

const Supplier = () => {
    const { user, loading } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [search, setSearch] = useState("");
    const [supplierLoading, setSupplierLoading] = useState(true);
    const [serverError, setServerError] = useState(false);

    const [openAddModal, setOpenAddModal] = useState(false);
    const [openEditModel, setOpenEditModel] = useState(false);
    const [openViewModel, setOpenViewModel] = useState(false);
    const [openDeleteModel, setOpenDeleteModel] = useState(false);

    const [editSupplier, setEditSupplier] = useState(null);
    const [viewId, setViewId] = useState(null);
    const [selectedId, setSelectedId] = useState(null);

    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [searchTimeout, setSearchTimeout] = useState(null);

    const isEmpty = totalItems === 0;

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-GB");
    };

    /* ================= FETCH SUPPLIERS ================= */
    const fetchSuppliers = async (page = 1, size = 10, searchTerm = "") => {
        try {
            setSupplierLoading(true);
            setServerError(false);
            const res = await getAllSuppliers(page, size, searchTerm);

            if (res && res.data) {
                setSuppliers(res.data);
                setTotalItems(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            } else {
                setSuppliers([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (err) {
            console.error("FETCH SUPPLIERS ERROR:", err);
            setServerError(true);
            toast.error("Failed to connect to server");
        } finally {
            setSupplierLoading(false);
        }
    };

    /* ================= EDIT ================= */
    const handleEdit = async (id) => {
        try {
            const res = await getSupplierById(id);
            setEditSupplier(res.data);
            setOpenEditModel(true);
        } catch (err) {
            toast.error("Failed to load supplier data");
        }
    };

    /* ================= DELETE ================= */
    const handleDelete = async (id) => {
        try {
            await deleteSupplier(id);
            toast.success("Supplier deleted");

            const isLastItem = suppliers.length === 1 && pageNo > 1;
            const targetPage = isLastItem ? pageNo - 1 : pageNo;

            if (isLastItem) setPageNo(targetPage);
            fetchSuppliers(targetPage, pageSize, search);
        } catch (err) {
            toast.error("Delete failed");
        } finally {
            setOpenDeleteModel(false);
            setSelectedId(null);
        }
    };

    useEffect(() => {
        if (!user) return
        fetchSuppliers(1, pageSize);
    }, [loading]);

    /* ================= PAGINATION LOGIC ================= */
    const goToPage = (p) => {
        if (isEmpty) return;
        const next = Math.max(1, Math.min(totalPages, p));
        if (next === pageNo) return;
        setPageNo(next);
        fetchSuppliers(next, pageSize, search);
    };

    const handlePrev = () => goToPage(pageNo - 1);
    const handleNext = () => goToPage(pageNo + 1);

    const handlePageSizeChange = (e) => {
        const size = Number(e.target.value);
        setPageSize(size);
        setPageNo(1);
        fetchSuppliers(1, size, search);
    };

    const getPageWindow = () => {
        if (isEmpty) return [1];
        const pages = [];
        for (let i = Math.max(1, pageNo - 2); i <= Math.min(totalPages, pageNo + 2); i++) {
            pages.push(i);
        }
        return pages.length > 0 ? pages : [1];
    };

    return (
        <div className="flex-1 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 pt-16 lg:pt-4 overflow-hidden">

            {/* ================= HEADER ================= */}
            <div className="mb-4 shrink-0">
                <h1 className="text-2xl font-semibold text-black">Supplier</h1>
            </div>

            {/* ================= FILTERS ================= */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0">
                <div className="relative w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Search by name or contact"
                        value={search}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            if (searchTimeout) clearTimeout(searchTimeout);
                            const timeout = setTimeout(() => {
                                setPageNo(1);
                                if (!user) return;
                                fetchSuppliers(1, pageSize, value);
                            }, 500);
                            setSearchTimeout(timeout);
                        }}
                        className="w-full pl-4 pr-10 py-2 rounded-lg border-2 border-gray-300 text-sm transition-all hover:border-secondary focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                    />
                    <IoSearch size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>

                <button
                    onClick={() => setOpenAddModal(true)}
                    className="px-6 py-2 w-fit bg-secondary text-sm text-white rounded-lg hover:bg-primary transition-all font-semibold shadow-md hover:shadow-lg cursor-pointer sm:w-auto"
                >
                    Add Supplier
                </button>
            </div>

            {/* ================= TABLE ================= */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    {supplierLoading ? (
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
                                    <th className="text-left px-6 py-4 text-sm font-semibold">Supplier Name</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">Contact</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">Created By</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">Updated By</th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {serverError ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-red-500 font-semibold text-lg">Server Connection Issue</span>
                                                <p className="text-gray-500 text-sm">We're having trouble connecting to the database.</p>
                                                <button onClick={() => fetchSuppliers(pageNo, pageSize, search)} className="mt-2 text-secondary underline text-sm cursor-pointer">Retry</button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : suppliers.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-gray-400 font-semibold text-lg">No Data Found</span>
                                                <p className="text-gray-400 text-sm">There are no suppliers to display.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    suppliers.map((supplier, index) => (
                                        <tr key={supplier.id} className={`border-b whitespace-nowrap border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                            <td className="px-6 py-4 text-sm font-semibold text-primary">{supplier.supplier_name}</td>
                                            <td className="px-6 py-4 text-sm">{supplier.contact}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {supplier?.created_by?.username}
                                                <span className="text-xs text-gray-400" style={{ marginLeft: "2px" }}>
                                                    ({supplier?.created_by?.role})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm ">
                                                {supplier?.updated_by?.username}
                                                <span className="text-xs text-gray-400" style={{ marginLeft: "2px" }}>
                                                    ({supplier?.updated_by?.role})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-4">
                                                    <FiEye className="cursor-pointer text-primary hover:text-blue-600" onClick={() => {
                                                        setViewId(supplier.id); setOpenViewModel(true);
                                                    }}
                                                    />
                                                    <FiEdit className="cursor-pointer text-primary hover:text-blue-600" onClick={() => handleEdit(supplier.id)} />
                                                    <IoTrashOutline className="cursor-pointer text-red-500 hover:text-red-700" onClick={() => {
                                                        setSelectedId(supplier.id); setOpenDeleteModel(true);
                                                    }} />
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
                        Showing <b>{suppliers.length}</b> of <b>{totalItems}</b>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
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
                                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handlePrev}
                            disabled={pageNo <= 1 || isEmpty}
                            className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded ${(pageNo <= 1 || isEmpty) ? "border-gray-300 opacity-50 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50 cursor-pointer"}`}
                        >
                            <MdKeyboardArrowLeft />
                        </button>

                        {getPageWindow().map((p) => (
                            <button
                                key={p}
                                onClick={() => goToPage(p)}
                                disabled={isEmpty}
                                className={`w-8 h-8 border-2 rounded text-sm transition-colors ${p === pageNo && !isEmpty ? 'bg-secondary text-white font-semibold border-secondary' : 'border-gray-300 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed'}`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            onClick={handleNext}
                            disabled={pageNo >= totalPages || isEmpty}
                            className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded ${(pageNo >= totalPages || isEmpty) ? "border-gray-300 opacity-50 cursor-not-allowed" : "border-gray-300 hover:bg-gray-50 cursor-pointer"}`}
                        >
                            <MdKeyboardArrowRight />
                        </button>
                    </div>
                </div>
            </div>


            <CreateSupplierModel
                open={openAddModal}
                onClose={() => setOpenAddModal(false)}
                fetchSuppliers={fetchSuppliers}
            />

            <ViewSupplierModel
                open={openViewModel}
                onClose={() => setOpenViewModel(false)}
                supplierId={viewId}
            />

            <EditSupplierModel
                open={openEditModel}
                onClose={() => setOpenEditModel(false)}
                fetchSuppliers={fetchSuppliers}
                editSupplierData={editSupplier}
            />

            <DeleteConfirmModal
                open={openDeleteModel}
                onClose={() => setOpenDeleteModel(false)}
                onConfirm={() => handleDelete(selectedId)}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier? This action cannot be undone."
            />

        </div>
    );
};

export default Supplier;