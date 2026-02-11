"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
    IoArrowBackOutline,
    IoCloseCircleOutline,
    IoSearch,
    IoCalendarOutline
} from "react-icons/io5";
import { GoPlusCircle } from "react-icons/go";
import { AiOutlineMinusCircle } from "react-icons/ai";
import {
    getRawInwardById,
    updateRawInward,
    searchRawProduct,
    searchSupplier,
} from "@/lib/fetcher";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiPlusCircle } from "react-icons/fi";
import CreateRawProductModel from "@/component/models/raw-product/CreateRawProductModel";
import CreateSupplierModel from "@/component/models/supplier/CreateSupplierModel";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

/* ================= ROW STRUCTURE ================= */
const createRow = (data = {}) => ({
    product: data.product || "",
    product_id: data.product_id || null,
    qty: data.qty || "",
    unit: data.unit || "",
    rate: data.rate || "",
    total: data.total || 0,

    locked: !!data.product_id,
    searchLoading: false,
    searchTimeout: null,
    results: [],
    activeIndex: 0,
    dropdownPos: null,
});

export default function EditRawInward() {
    const router = useRouter();
    const { id } = router.query;
    const [loading, setLoading] = useState(true);
    const [update, setUpdate] = useState(false)
    const [date, setDate] = useState("");
    const [remark, setRemark] = useState("");
    const [search, setSearch] = useState("");
    const [suppliers, setSuppliers] = useState([]);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchTimeout, setSearchTimeout] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [rawProductModal, setRawProductModal] = useState(false);
    const [supplierModal, setSupplierModal] = useState(false);

    const [rows, setRows] = useState([createRow()]);

    const formatDDMMYYYY = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    /* ================= FETCH EXISTING DATA ================= */
    useEffect(() => {
        if (!id) return;

        const fetchInward = async () => {
            try {
                setLoading(true);
                const res = await getRawInwardById(id);

                if (!res?.success) {
                    toast.error("Failed to load raw inward");
                    return;
                }

                const data = res.data;

                setDate(data.inward_date.split("T")[0]);
                setRemark(data.remark || "");

                setSearch(data.supplier.supplier_name);
                setSelectedSupplier(data.supplier);

                setRows(
                    data.products.map((p) =>
                        createRow({
                            // inward_product_id: p.id,
                            product: p.product_name,
                            product_id: p.product_id,
                            qty: String(p.qty),
                            unit: p.unit.toUpperCase(),
                            rate: String(p.rate),
                            total: Number(p.total),
                        })
                    )
                );

            } catch (err) {
                console.error(err);
                toast.error("Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        fetchInward();
    }, [id]);

    /* ===== FETCH SUPPLIERS ===== */
    const getSupplierByName = async (value) => {
        try {
            setSearchLoading(true);
            const res = await searchSupplier(value);
            setSuppliers(res?.data || []);
        } catch (error) {
            console.error("Supplier search error", error);
        } finally {
            setSearchLoading(false);
        }
    };

    /* ================= FIELD CHANGE ================= */
    const handleChange = (index, field, value) => {
        const updated = [...rows];

        if (field === "qty" || field === "rate") {
            value = value.replace(/[^0-9.]/g, "");
            if (value.split(".").length > 2) return;
        }

        updated[index][field] = value;

        const qty = Number(updated[index].qty || 0);
        const rate = Number(updated[index].rate || 0);

        if (updated[index].product_id) {
            updated[index].total = parseFloat((qty * rate).toFixed(2));
        }

        setRows(updated);
    };

    const addRow = () => setRows((p) => [...p, createRow()]);
    const removeRow = (i) => setRows((p) => p.filter((_, idx) => idx !== i));

    // search product
    const getProductByName = async (value, rowIndex) => {
        try {
            const res = await searchRawProduct(value);

            setRows((prev) => {
                const updated = [...prev];
                updated[rowIndex].results = res?.data || [];
                updated[rowIndex].searchLoading = false;
                return updated;
            });
        } catch {
            setRows((prev) => {
                const updated = [...prev];
                updated[rowIndex].searchLoading = false;
                return updated;
            });
        }
    };

    // ================= PRODUCT SEARCH FUNCTIONS =================

    const handleProductFocus = (e, index) => {
        const r = e.target.getBoundingClientRect();
        setRows((prev) => {
            const u = [...prev];
            u[index].dropdownPos = {
                top: r.bottom + window.scrollY,
                left: r.left + window.scrollX,
                width: r.width,
            };
            return u;
        });
    };

    const handleProductSearch = (value, index) => {
        if (rows[index].locked) return;

        setRows((prev) => {
            const u = [...prev];
            u[index].product = value;
            u[index].activeIndex = 0;
            u[index].searchLoading = true;
            return u;
        });

        if (rows[index].searchTimeout) clearTimeout(rows[index].searchTimeout);

        if (!value) {
            setRows((prev) => {
                const u = [...prev];
                u[index].results = [];
                u[index].searchLoading = false;
                return u;
            });
            return;
        }

        const timeout = setTimeout(() => {
            getProductByName(value, index);
        }, 500);

        setRows((prev) => {
            const u = [...prev];
            u[index].searchTimeout = timeout;
            return u;
        });
    };

    const selectProduct = (p, index) => {
        if (!p) return;
        setRows((prev) => {
            const u = [...prev];
            u[index] = {
                ...u[index],
                product: p.product_name,
                product_id: p.id,
                rate: p.rate,
                unit: p.unit,
                total: (Number(u[index].qty) || 0) * p.rate,
                locked: true,
                results: [],
            };
            return u;
        });
    };

    const handleProductKeyDown = (e, index) => {
        const row = rows[index];
        if (!row.results.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setRows((p) => {
                const u = [...p];
                u[index].activeIndex = Math.min(u[index].activeIndex + 1, u[index].results.length - 1);
                return u;
            });
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setRows((p) => {
                const u = [...p];
                u[index].activeIndex = Math.max(u[index].activeIndex - 1, 0);
                return u;
            });
        }

        if (e.key === "Enter") {
            e.preventDefault();
            selectProduct(row.results[row.activeIndex], index);
        }

        if (e.key === "Escape") {
            setRows((prev) => {
                const u = [...prev];
                u[index].results = [];
                return u;
            });
        }
    };

    const removeProductSelection = (index) => {
        setRows((prev) => {
            const u = [...prev];
            u[index] = createRow();
            return u;
        });
    };

    /* ================= SUBMIT ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (update) return

        if (!selectedSupplier) {
            toast.error("Please select a supplier");
            return;
        }

        const emptyQtyRow = rows.find((r) => {
            if (!r.product_id) return false;
            return r.qty === "" || r.qty === null || r.qty === undefined;
        });

        if (emptyQtyRow) {
            toast.error("Please enter quantity");
            return;
        }

        const zeroQtyRow = rows.find((r) => {
            if (!r.product_id) return false;
            const qty = parseFloat(r.qty);
            return isNaN(qty) || qty <= 0;
        });

        if (zeroQtyRow) {
            toast.error("Quantity must be greater than 0");
            return;
        }
        const emptyRateRow = rows.find((r) => {
            if (!r.product_id) return false;
            return r.rate === "" || r.rate === null || r.rate === undefined;
        });

        if (emptyRateRow) {
            toast.error("Please enter rate");
            return;
        }

        const zeroRateRow = rows.find((r) => {
            if (!r.product_id) return false;
            const rate = parseFloat(r.rate);
            return isNaN(rate) || rate <= 0;
        });

        if (zeroRateRow) {
            toast.error("Rate must be greater than 0");
            return;
        }

        const products = rows
            .filter(r => r.product_id && Number(r.qty) > 0 && Number(r.rate) > 0)
            .map(r => ({
                product_id: r.product_id,
                qty: Number(r.qty),
                unit: r.unit.toLowerCase(),
                rate: Number(r.rate),
            }));

        const invalidRow = rows.find(
            (r) =>
                r.product_id &&
                (!r.qty || Number(r.qty) <= 0)
        );
        if (!products.length) {
            toast.error("Please add at least one valid product");
            return;
        }

        const payload = {
            inward_date: date,
            supplier_id: selectedSupplier.id,
            remark,
            products,
        };

        try {
            setUpdate(true)
            const res = await updateRawInward(id, payload);
            if (res?.success) {
                toast.success("Raw inward updated successfully");
                router.push("/raw-material/raw-inward");
            } else {
                toast.error(res?.message || "Update failed");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setUpdate(false)
        }
    };

    // Custom Loader
    if (loading) {
        return (
            <div className="flex-1 bg-grey flex items-center justify-center">
                <div className="flex items-center justify-center h-full w-full">
                    <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
            {/* HEADER */}
            <div className="flex flex-row justify-between items-center gap-3 mb-4">
                <h1 className="text-lg md:text-2xl font-semibold">
                    Edit Raw Inward
                </h1>
                <Link
                    href="/raw-material/raw-inward"
                    className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
                >
                    <IoArrowBackOutline size={18} />
                    Back
                </Link>
            </div>

            {/* CONTENT */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden">
                {/* TOP SECTION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

                    {/* SUPPLIER SEARCH */}
                    <div className="w-full relative">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-semibold">
                                Supplier Name
                            </label>

                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => setSupplierModal(true)}
                            >
                                <FiPlusCircle className="text-secondary hover:text-primary transition-all duration-300" size={22} />
                            </button>
                        </div>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Supplier name"
                                value={search}
                                readOnly={!!selectedSupplier}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearch(value);
                                    setActiveIndex(0);

                                    if (searchTimeout) clearTimeout(searchTimeout);

                                    if (!value) {
                                        setSuppliers([]);
                                        setSearchLoading(false);
                                        return;
                                    }

                                    setSearchLoading(true);

                                    setSearchTimeout(
                                        setTimeout(() => {
                                            getSupplierByName(value);
                                        }, 500)
                                    );
                                }}
                                onKeyDown={(e) => {
                                    if (!suppliers.length) return;

                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setActiveIndex((p) => Math.min(p + 1, suppliers.length - 1));
                                    }

                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        setActiveIndex((p) => Math.max(p - 1, 0));
                                    }

                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const s = suppliers[activeIndex];
                                        if (s) {
                                            setSearch(s.supplier_name);
                                            setSelectedSupplier(s);
                                            setSuppliers([]);
                                        }
                                    }

                                    if (e.key === "Escape") setSuppliers([]);
                                }}
                                className={`w-full pl-3 pr-10 py-2 rounded-lg border-2 text-sm
        ${selectedSupplier
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "border-gray-300 hover:border-secondary"}
        focus:outline-none focus:border-secondary
        focus:ring-2 focus:ring-secondary/20`}
                            />

                            {/* RIGHT ICON */}
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                {searchLoading && (
                                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                                )}

                                {!searchLoading && selectedSupplier && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch("");
                                            setSelectedSupplier(null);
                                            setSuppliers([]);
                                            setActiveIndex(0);
                                        }}
                                        className="text-gray-400 cursor-pointer hover:text-red-500"
                                    >
                                        <IoCloseCircleOutline size={22} />
                                    </button>
                                )}

                                {!searchLoading && !search && (
                                    <IoSearch size={18} className="text-gray-400" />
                                )}
                            </div>
                        </div>

                        {!selectedSupplier && suppliers.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 rounded-lg max-h-48 overflow-y-auto bg-white border border-gray-300 shadow-lg">
                                {suppliers.map((s, i) => (
                                    <div
                                        key={s.id}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onClick={() => {
                                            setSearch(s.supplier_name);
                                            setSelectedSupplier(s);
                                            setSuppliers([]);
                                        }}
                                        className={`px-3 py-2 text-sm cursor-pointer
            ${i === activeIndex
                                                ? "bg-primary text-white"
                                                : "hover:bg-secondary/10"}`}
                                    >
                                        {s.supplier_name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* DATE */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">
                            Date
                        </label>
                        <div className="relative">
                            {/* REAL DATE INPUT (opens native picker) */}
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {/* DISPLAY INPUT */}
                            <input
                                type="text"
                                readOnly
                                value={formatDDMMYYYY(date)}
                                className={`${inputClass} pr-10`}
                            />

                            {/* CALENDAR ICON */}
                            <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                                <IoCalendarOutline size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* PRODUCT GRID */}
                <div className="border-2 border-gray-300 rounded-xl mb-6 p-2">

                    {/* HEADER (Desktop only) */}
                    <div className="hidden sm:grid grid-cols-[repeat(5,1fr)_auto] gap-2 text-sm font-semibold text-gray-700 -mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-semibold ">
                                Product Name
                            </label>

                            <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() => setRawProductModal(true)}
                            >
                                <FiPlusCircle className="text-secondary hover:text-primary transition-all duration-300" size={22} />
                            </button>
                        </div>
                        <div className="py-2 -ml-2">Qty</div>
                        <div className="-ml-4 py-2">Unit</div>
                        <div className="-ml-6 py-2">Rate</div>
                        <div className="-ml-8 py-2">Total</div>
                        <div />
                    </div>

                    {rows.map((row, index) => (
                        <div
                            key={index}
                            className="
                grid
                grid-cols-1
                sm:grid-cols-[repeat(5,1fr)_auto]
                gap-2
                items-center
                border-b sm:border-0
                pb-3 sm:pb-0
                mb-3 sm:mb-0
              "
                        >


                            {/* PRODUCT SEARCH */}
                            <div className="relative w-full">
                                <div className="sm:hidden flex items-center justify-between mb-1">
                                    <label className="sm:hidden block text-xs font-semibold ">
                                        Product Name
                                    </label>

                                    <button
                                        type="button"
                                        className="cursor-pointer"
                                        onClick={() => setRawProductModal(true)}
                                    >
                                        <FiPlusCircle className="text-secondary hover:text-primary transition-all duration-300" size={22} />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search product name"
                                    value={row.product}
                                    readOnly={row.locked}
                                    onFocus={(e) => handleProductFocus(e, index)}
                                    onChange={(e) => handleProductSearch(e.target.value, index)}
                                    onKeyDown={(e) => handleProductKeyDown(e, index)}
                                    className={`${inputClass} pr-10 ${row.locked ? "bg-gray-100 cursor-not-allowed" : ""
                                        }`}
                                />

                                {/* ICONS - Matches Fitter Design */}
                                <div className="absolute right-3 top-9 sm:top-2.5 text-gray-500">
                                    {row.searchLoading && !row.locked && (
                                        <AiOutlineLoading3Quarters className="animate-spin" />
                                    )}

                                    {!row.searchLoading && row.locked && (
                                        <IoCloseCircleOutline
                                            size={22}
                                            className="cursor-pointer hover:text-red-500"
                                            onClick={() => removeProductSelection(index)}
                                        />
                                    )}

                                    {!row.searchLoading && !row.locked && !row.product && (
                                        <IoSearch size={18} className="text-gray-400" />
                                    )}
                                </div>

                                {/* DROPDOWN - Styled like Fitter Dropdown */}
                                {!row.locked && row.dropdownPos && (row.results.length > 0 || (row.product && !row.searchLoading)) && (
                                    <ul
                                        className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto"
                                    >
                                        {row.results.length > 0 ? (
                                            row.results.map((p, i) => (
                                                <li
                                                    key={p.id}
                                                    onMouseEnter={() => {
                                                        setRows((prev) => {
                                                            const u = [...prev];
                                                            u[index].activeIndex = i;
                                                            return u;
                                                        });
                                                    }}
                                                    onClick={() => selectProduct(p, index)}
                                                    className={`px-3 py-2 cursor-pointer text-sm transition-all ${i === row.activeIndex
                                                        ? "bg-primary text-white"
                                                        : "hover:bg-secondary/10 text-gray-700"
                                                        }`}
                                                >
                                                    {p.product_name}
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-3 py-2 text-sm text-gray-400 text-center">
                                                No product found
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>

                            {/* QTY */}
                            <div>
                                <label className="sm:hidden block text-xs font-semibold mb-1">
                                    Qty
                                </label>
                                <input
                                    value={row.qty}
                                    onChange={(e) => handleChange(index, "qty", e.target.value)}
                                    placeholder="Qty"
                                    className={inputClass}
                                />
                            </div>

                            {/* UNIT */}
                            <div>
                                <label className="sm:hidden block text-xs font-semibold mb-1">
                                    Unit
                                </label>
                                <input
                                    value={row.unit}
                                    readOnly
                                    className={`${inputClass} bg-gray-100 font-semibold`}
                                />
                            </div>

                            {/* RATE */}
                            <div>
                                <label className="sm:hidden block text-xs font-semibold mb-1">
                                    Rate
                                </label>
                                <input
                                    value={row.rate}
                                    onChange={(e) => handleChange(index, "rate", e.target.value)}
                                    placeholder="Rate"
                                    className={inputClass}
                                />
                            </div>

                            {/* TOTAL */}
                            <div>
                                <label className="sm:hidden block text-xs font-semibold mb-1">
                                    Total
                                </label>
                                <input
                                    readOnly
                                    value={row.total}
                                    className={`${inputClass} md:m-1 bg-gray-100 font-semibold`}
                                />
                            </div>

                            {/* ACTION BUTTONS */}
                            <div className="flex justify-end sm:justify-center mt-2 sm:mt-0">
                                {index === 0 ? (
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="bg-secondary text-white px-3 py-3 rounded-md hover:bg-primary cursor-pointer"
                                    >
                                        <GoPlusCircle size={16} />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => removeRow(index)}
                                        className="bg-red-500 text-white px-3 py-3 rounded-md hover:bg-red-700 cursor-pointer"
                                    >
                                        <AiOutlineMinusCircle size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* REMARK */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-1">
                        Remark
                    </label>
                    <textarea
                        rows={4}
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        className={inputClass}
                        placeholder="Remark"
                    />
                </div>

                {/* BUTTONS */}
                <div className="flex flex-row gap-4">
                    <button
                        onClick={() => router.back()}
                        disabled={update}
                        className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                        Back
                    </button>
                    <button
                        onClick={handleSubmit}
                        type="submit"
                        disabled={update}
                        className="flex-1 px-6 py-2 rounded-lg bg-secondary text-white font-semibold cursor-pointer
             hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {update ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>

            <CreateSupplierModel
                open={supplierModal}
                onClose={() => setSupplierModal(false)}
            />

            <CreateRawProductModel
                open={rawProductModal}
                onClose={() => setRawProductModal(false)}
            />
        </div>
    );
}