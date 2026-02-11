"use client";

import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { getAllTransaction, searchPackingPaymentUser } from "@/lib/fetcher";
import { toast } from "react-toastify";
import {
    IoCalendarOutline,
    IoCloseCircleOutline,
    IoSearch,
} from "react-icons/io5";

const Transaction = () => {
    const [transaction, setTransaction] = useState([]);
    const [transactionLoading, setTransactionLoading] = useState(true);
    const [serverError, setServerError] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userLoading, setUserLoading] = useState(false);
    const [userActive, setUserActive] = useState(0);
    const [userTimeout, setUserTimeout] = useState(null);
    const [showNotFound, setShowNotFound] = useState(false);

    const [pageNo, setPageNo] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const [filters, setFilters] = useState({
        from_date: "",
        to_date: "",
        user_id: "",
    });
    const formatDDMMYYYY = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const inputClass =
        "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all";

    const isEmpty = totalItems === 0;
    const isResetDisabled =
        !filters.from_date &&
        !filters.to_date &&
        !filters.user_id;
    // ================= USER SEARCH LOGIC =================
    const getUsers = async (value) => {
        try {
            setUserLoading(true);
            const res = await searchPackingPaymentUser(value);
            const data = res?.data || [];
            setUsers(data);
            setShowNotFound(data.length === 0);
        } catch (error) {
            console.error("Search Error:", error);
            setUsers([]);
            setShowNotFound(true);
        } finally {
            setUserLoading(false);
        }
    };

    const selectUser = (user) => {
        setSelectedUser(user);
        setUserSearch(user.name);
        setUsers([]);

        setFilters((prev) => ({
            ...prev,
            user_id: user.id,
        }));

        setPageNo(1);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === "Escape") setUsers([]);
        if (!users.length) return;

        if (e.key === "ArrowDown") {
            setUserActive((p) => (p < users.length - 1 ? p + 1 : p));
        } else if (e.key === "ArrowUp") {
            setUserActive((p) => (p > 0 ? p - 1 : 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (users[userActive]) selectUser(users[userActive]);
        }
    };

    const handleUserSearchChange = (val) => {
        setUserSearch(val);
        setUserActive(0);
        setShowNotFound(false);
        if (userTimeout) clearTimeout(userTimeout);
        if (!val.trim()) {
            setUsers([]);
            setUserLoading(false);
            return;
        }
        setUserLoading(true);
        setUserTimeout(setTimeout(() => getUsers(val), 500));
    };

    // ================= FETCH DATA FUNCTION =================
    const fetchTransaction = async (page, size) => {
        try {
            setTransactionLoading(true);
            setServerError(false);

            const res = await getAllTransaction(
                page,
                size,
                filters.from_date,
                filters.to_date,
                filters.user_id
            );

            if (res?.success) {
                setTransaction(res.data || []);
                setTotalItems(res.pagination?.total || 0);
                setTotalPages(res.pagination?.totalPages || 1);
            } else {
                setTransaction([]);
                setTotalItems(0);
                setTotalPages(1);
            }
        } catch (error) {
            setServerError(true);
            toast.error("Failed to connect to server");
        } finally {
            setTransactionLoading(false);
        }
    };

    useEffect(() => {
        const delay = setTimeout(() => {
            fetchTransaction(pageNo, pageSize);
        }, 500);

        return () => clearTimeout(delay);
    }, [filters, pageNo, pageSize]);

    const handleResetFilters = () => {
        setSelectedUser(null);
        setUserSearch("");
        setUsers([]);

        setFilters({
            from_date: "",
            to_date: "",
            user_id: "",
        });

        setPageNo(1);
    };

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
        fetchTransaction(1, size);
    };

    const goToPage = (p) => {
        if (isEmpty) return;
        const next = Math.max(1, Math.min(totalPages, p));
        if (next === pageNo) return;
        setPageNo(next);
        fetchTransaction(
            next,
            pageSize,
            filters.from_date,
            filters.to_date,
            filters.user_id
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
                <h1 className="text-2xl font-semibold text-black">Transaction Details</h1>
            </div>

            {/* ================= FILTERS SECTION  ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-8 gap-4 mb-4 shrink-0 items-end">

                {/* From Date */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                        From Date
                    </label>
                    <div className="relative">
                        {/* REAL DATE INPUT (native picker) */}
                        <input
                            type="date"
                            name="from_date"
                            value={filters.from_date}
                            onChange={handleFilterChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {/* DISPLAY INPUT */}
                        <input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            readOnly
                            value={formatDDMMYYYY(filters.from_date)}
                            className="w-full px-3 py-2 pr-10 rounded-lg border-2 border-gray-300 text-sm
      focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                            <IoCalendarOutline size={18} />
                        </div>
                    </div>

                </div>

                {/* To Date */}
                <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                        To Date
                    </label>
                    <div className="relative">
                        {/* REAL DATE INPUT (native picker) */}
                        <input
                            type="date"
                            name="to_date"
                            value={filters.to_date}
                            onChange={handleFilterChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {/* DISPLAY INPUT */}
                        <input
                            type="text"
                            placeholder="DD/MM/YYYY"
                            readOnly
                            value={formatDDMMYYYY(filters.to_date)}
                            className="w-full px-3 py-2 pr-10 rounded-lg border-2 border-gray-300 text-sm
      focus:border-secondary focus:ring-2 focus:ring-secondary/20 outline-none"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                            <IoCalendarOutline size={18} />
                        </div>
                    </div>

                </div>

                {/* USER SEARCH */}
                <div className="relative sm:col-span-3">
                    <label className="block text-sm font-semibold mb-1 text-gray-600">
                        User
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search User"
                            value={userSearch}
                            autoComplete="off"
                            readOnly={!!selectedUser}
                            onChange={(e) => handleUserSearchChange(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className={`${inputClass} ${selectedUser ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                            {userLoading && (
                                <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                            )}
                            {selectedUser ? (
                                <IoCloseCircleOutline
                                    size={20}
                                    className="text-gray-400 cursor-pointer hover:text-red-500"
                                    onClick={() => {
                                        setSelectedUser(null);
                                        setUserSearch("");
                                        setUsers([]);

                                        setFilters((prev) => ({
                                            ...prev,
                                            user_id: "",
                                        }));

                                        setPageNo(1);
                                    }}
                                />
                            ) : (
                                !userLoading && <IoSearch size={18} className="text-gray-400" />
                            )}
                        </div>
                    </div>

                    {/* DROPDOWN RESULTS */}
                    {!selectedUser && userSearch && (
                        <>
                            {users.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                    {users.map((u, i) => (
                                        <div
                                            key={u.id}
                                            onMouseEnter={() => setUserActive(i)}
                                            onClick={() => selectUser(u)}
                                            className={`px-3 py-2 text-sm cursor-pointer transition ${i === userActive
                                                ? "bg-primary text-white"
                                                : "hover:bg-secondary/10"
                                                }`}
                                        >
                                            {u.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                            {showNotFound && !userLoading && (
                                <div className="absolute z-50 w-full mt-1 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 shadow-lg rounded-lg">
                                    No user found
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* RESET BUTTON */}
                <div className="sm:col-span-1">
                    <button
                        type="button"
                        onClick={handleResetFilters}
                        disabled={isResetDisabled}
                        className={`w-27 py-2 rounded-lg text-sm font-semibold border-2 transition-all
                ${isResetDisabled
                                ? "border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100"
                                : "border-secondary cursor-pointer text-secondary hover:bg-secondary hover:text-white"
                            }
            `}
                    >
                        Reset
                    </button>
                </div>

            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-auto flex-1 custom-scrollbar">
                    {transactionLoading ? (
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
                                        Transaction Date
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        User Name
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Debit
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Credit
                                    </th>
                                    <th className="text-left px-6 py-4 text-sm font-semibold">
                                        Balance
                                    </th>

                                </tr>
                            </thead>
                            <tbody>
                                {serverError ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className="text-red-500 font-semibold text-lg">
                                                    Server Connection Issue
                                                </span>
                                                <p className="text-gray-500 text-sm">
                                                    We&apos;re having trouble connecting to the database.
                                                </p>
                                                <button
                                                    onClick={() => fetchTransaction(pageNo, pageSize)}
                                                    className="mt-2 text-secondary underline text-sm cursor-pointer"
                                                >
                                                    Retry
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ) : transaction.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="text-gray-400 font-semibold text-lg">
                                                    No Data Found
                                                </span>
                                                <p className="text-gray-400 text-sm">
                                                    There are no transaction details to display.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    transaction.map((transaction, index) => (
                                        <tr
                                            key={transaction.id}
                                            className={`border-b whitespace-nowrap border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                }`}
                                        >
                                            {/* DATE */}
                                            <td className="px-6 py-4 text-sm">
                                                {formatDate(transaction.transaction_date)}
                                            </td>

                                            {/* USER */}
                                            <td className="px-6 py-4 text-sm">
                                                {transaction.username || "Admin"}
                                            </td>

                                            {/* DEBIT */}
                                            <td className="px-6 py-4 text-sm font-medium text-red-600">
                                                {transaction.debit > 0 ? `₹ ${transaction.debit}` : "-"}
                                            </td>

                                            {/* CREDIT */}
                                            <td className="px-6 py-4 text-sm font-medium text-green-600">
                                                {transaction.credit > 0 ? `₹ ${transaction.credit}` : "-"}
                                            </td>

                                            {/* BALANCE */}
                                            <td className="px-6 py-4 text-sm font-semibold text-primary">
                                                ₹ {transaction.balance}
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
                        Showing <b>{transaction.length}</b> of <b>{totalItems}</b>
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

export default Transaction;
