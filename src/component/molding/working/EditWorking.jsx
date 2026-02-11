"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    IoArrowBackOutline,
    IoCalendarOutline,
    IoCloseCircleOutline,
    IoSearch,
} from "react-icons/io5";
import { GoPlusCircle } from "react-icons/go";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import {
    getWorkingById,
    searchMachine,
    searchProduct,
    updateWorking,
} from "@/lib/fetcher";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiPlusCircle } from "react-icons/fi";
import CreateProductModel from "@/component/models/product/CreateProductModel";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

const createRow = (data = {}) => ({
    product: data.product || "",
    product_id: data.product_id || null,
    qty_in_bag: data.qty_in_bag || "",
    qty_in_kg: data.qty_in_kg || "",
    electricity_unit: data.electricity_unit || "",
    total: data.total || 0,
    locked: !!data.product_id,
    results: [],
    searchLoading: false,
    searchTimeout: null,
    activeIndex: 0,
    dropdownPos: null,
});

export default function EditWorking() {
    const router = useRouter();
    const { id } = router.query;

    const [date, setDate] = useState("");
    const [update, setUpdate] = useState(false);
    const [loading, setLoading] = useState(true);
    const [productModal, setProductModal] = useState(false);

    const [machineSearch, setMachineSearch] = useState("");
    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [machineLoading, setMachineLoading] = useState(false);
    const [machineTimeout, setMachineTimeout] = useState(null);
    const [machineActive, setMachineActive] = useState(0);

    const [description, setDescription] = useState("");
    const [rows, setRows] = useState([createRow()]);

    const formatDDMMYYYY = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    /* ================= LOAD ================= */
    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                const res = await getWorkingById(id);
                const w = res.data;

                setDate(w.date.split("T")[0]);
                setDescription(w.description || "");

                setMachineSearch(w.machine.name);
                setSelectedMachine({
                    id: w.machine.id,
                    name: w.machine.name,
                });

                setRows(
                    w.products.map((p) =>
                        createRow({
                            product: p.product_name + " - " + p.color,
                            product_id: p.product_id,
                            qty_in_bag: String(p.qty_in_bag),
                            qty_in_kg: String(p.qty_in_kg),
                            electricity_unit: String(p.electricity_unit || ""),
                            total: Number(p.total),
                        })
                    )
                );
            } catch {
                toast.error("Failed to load working");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    /* ================= MACHINE SEARCH ================= */
    const getMachineByName = async (value) => {
        try {
            const res = await searchMachine(value);
            setMachines(res?.data || []);
        } finally {
            setMachineLoading(false);
        }
    };

    /* ================= PRODUCT SEARCH ================= */
    const getProductByName = async (value, index) => {
        try {
            const res = await searchProduct(value);
            setRows((prev) => {
                const u = [...prev];
                u[index].results = res?.data || [];
                u[index].searchLoading = false;
                return u;
            });
        } catch {
            setRows((prev) => {
                const u = [...prev];
                u[index].searchLoading = false;
                return u;
            });
        }
    };

    const updateDropdownPos = (e, index) => {
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

    const handleProductFocus = (e, index) => {
        if (rows[index].locked) return;
        updateDropdownPos(e, index);
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
        setRows((prev) => {
            const u = [...prev];
            u[index] = {
                ...u[index],
                product: p.color ? `${p.name} - ${p.color}` : `${p.name} - All Color`,
                product_id: p.id,
                locked: true,
                results: [],
                dropdownPos: null, // Close dropdown
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
            const p = row.results[row.activeIndex];
            if (p) selectProduct(p, index);
        }

        if (e.key === "Escape") {
            setRows((prev) => {
                const u = [...prev];
                u[index].results = [];
                u[index].dropdownPos = null;
                return u;
            });
        }
    };

    const removeProductSelection = (index) => {
        setRows((prev) => {
            const u = [...prev];
            const currentPos = u[index].dropdownPos;
            u[index] = {
                ...createRow(),
                dropdownPos: currentPos,
            };
            return u;
        });
    };

    /* ================= BAG × KG ================= */
    const handleChange = (index, field, value) => {
        const updated = [...rows];
        value = value.replace(/[^0-9.]/g, "");
        if (value.split(".").length > 2) return;

        updated[index][field] = value;

        const bag = parseFloat(updated[index].qty_in_bag) || 0;
        const kg = parseFloat(updated[index].qty_in_kg) || 0;

        updated[index].total = parseFloat((bag * kg).toFixed(2));
        setRows(updated);
    };

    const addRow = () => setRows((p) => [...p, createRow()]);
    const removeRow = (i) => setRows((p) => p.filter((_, x) => x !== i));

    /* ================= UPDATE ================= */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedMachine) return toast.error("Please Select machine");

        const emptyBagRow = rows.find((r) => {
            if (!r.product_id) return false;
            return r.qty_in_bag === "" || r.qty_in_bag === null || r.qty_in_bag === undefined;
        });

        if (emptyBagRow) {
            toast.error("Please enter quantity in bag");
            return;
        }

        const zeroBagRow = rows.find((r) => {
            if (!r.product_id) return false;
            const bag = parseFloat(r.qty_in_bag);
            return isNaN(bag) || bag <= 0;
        });

        if (zeroBagRow) {
            toast.error("Quantity in bag must be greater than 0");
            return;
        }
        const emptyKgRow = rows.find((r) => {
            if (!r.product_id) return false;
            return r.qty_in_kg === "" || r.qty_in_kg === null || r.qty_in_kg === undefined;
        });

        if (emptyKgRow) {
            toast.error("Please enter quantity in kg");
            return;
        }

        const zeroKgRow = rows.find((r) => {
            if (!r.product_id) return false;
            const kg = parseFloat(r.qty_in_kg);
            return isNaN(kg) || kg <= 0;
        });

        if (zeroKgRow) {
            toast.error("Quantity in kg must be greater than 0");
            return;
        }

        const items = rows
            .filter((r) => r.product_id && r.qty_in_bag > 0 && r.qty_in_kg > 0)
            .map((r) => ({
                product_id: r.product_id,
                qty_in_bag: Number(r.qty_in_bag),
                qty_in_kg: Number(r.qty_in_kg),
                electricity_unit: Number(r.electricity_unit),
            }));

        if (!items.length) return toast.error("Please add at least one valid product");

        try {
            setUpdate(true);
            const res = await updateWorking(id, {
                machine_id: selectedMachine.id,
                date,
                description,
                items,
            });

            if (res?.success) {
                toast.success("Working updated");
                router.push("/molding");
            } else toast.error(res?.message);
        } finally {
            setUpdate(false);
        }
    };

    const handleCancel = () => router.push("/molding");

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
            <div className="flex flex-row justify-between items-center gap-3 mb-4">
                <h1 className="text-lg md:text-2xl font-semibold">Edit Working</h1>
                <Link
                    href="/molding"
                    className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
                >
                    <IoArrowBackOutline size={18} />
                    Back
                </Link>
            </div>
            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {/* ================= MACHINE SEARCH ================= */}
                    <div className="w-full relative">
                        <label className="block text-sm font-semibold mb-1">
                            Machine Name
                        </label>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Machine name"
                                value={machineSearch}
                                readOnly={!!selectedMachine}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setMachineSearch(value);
                                    setMachineActive(0);

                                    if (machineTimeout) clearTimeout(machineTimeout);

                                    if (!value) {
                                        setMachines([]);
                                        setMachineLoading(false);
                                        return;
                                    }

                                    setMachineLoading(true);
                                    setMachineTimeout(
                                        setTimeout(() => {
                                            getMachineByName(value);
                                        }, 500)
                                    );
                                }}
                                onKeyDown={(e) => {
                                    if (!machines.length) return;

                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        setMachineActive((prev) =>
                                            prev < machines.length - 1 ? prev + 1 : prev
                                        );
                                    }

                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        setMachineActive((prev) => (prev > 0 ? prev - 1 : 0));
                                    }

                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        const machine = machines[machineActive];
                                        if (machine) {
                                            setMachineSearch(machine.name);
                                            setSelectedMachine(machine);
                                            setMachines([]);
                                            setMachineActive(0);
                                        }
                                    }

                                    if (e.key === "Escape") {
                                        setMachines([]);
                                    }
                                }}
                                className={`w-full pl-4 pr-10 py-2 rounded-lg border-2 text-sm transition-all
        ${selectedMachine
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "border-gray-300 hover:border-secondary"}
        focus:outline-none focus:border-secondary
        focus:ring-2 focus:ring-secondary/20`}
                            />

                            {/* RIGHT ICON */}
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                {machineLoading && (
                                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                                )}

                                {!machineLoading && selectedMachine && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (machineTimeout) clearTimeout(machineTimeout);
                                            setMachineSearch("");
                                            setMachines([]);
                                            setSelectedMachine(null);
                                            setMachineActive(0);
                                        }}
                                        className="text-gray-400 cursor-pointer hover:text-red-500"
                                    >
                                        <IoCloseCircleOutline size={22} />
                                    </button>
                                )}

                                {!machineLoading && !machineSearch && (
                                    <IoSearch size={18} className="text-gray-400" />
                                )}
                            </div>
                        </div>

                        {/* DROPDOWN */}
                        {!selectedMachine && (
                            <>
                                {machines.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 rounded-lg max-h-48 overflow-y-auto bg-white border border-gray-300 shadow-lg">
                                        {machines.map((m, index) => (
                                            <div
                                                key={m.id}
                                                onMouseEnter={() => setMachineActive(index)}
                                                onClick={() => {
                                                    setMachineSearch(m.name);
                                                    setSelectedMachine(m);
                                                    setMachines([]);
                                                    setMachineActive(0);
                                                }}
                                                className={`px-3 py-2 text-sm cursor-pointer transition
                ${index === machineActive
                                                        ? "bg-primary text-white"
                                                        : "hover:bg-secondary/10"
                                                    }`}
                                            >
                                                {m.name}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {!machineLoading && machineSearch && machines.length === 0 && (
                                    <div className="mt-1 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 shadow-lg rounded-lg">
                                        No machine found
                                    </div>
                                )}
                            </>
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
                    <div className="hidden sm:grid grid-cols-[repeat(5,1fr)_auto] gap-2 text-sm font-semibold text-gray-700">
                        <div className="px-2 py-2 -ml-1">Product Name</div>
                        <div className="-ml-2 py-2">Qty in bag</div>
                        <div className="-ml-4 py-2">Qty in kg</div>
                        <div className="-ml-5 py-2">Electricity Unit</div>
                        <div className="-ml-7 py-2">Total</div>
                        <div />
                    </div>

                    {rows.map((row, index) => (
                        <div
                            key={index}
                            className="grid grid-cols-1 sm:grid-cols-[repeat(5,1fr)_auto]
                gap-2 items-center border-b sm:border-0 pb-3 sm:pb-0 mb-3 sm:mb-0">

                            {/* ================= PRODUCT SEARCH ================= */}
                            <div className="relative w-full">
                                <div className="sm:hidden flex items-center justify-between mb-1">
                                    <label className="sm:hidden block text-xs font-semibold ">
                                        Product Name
                                    </label>

                                    <button
                                        type="button"
                                        className="cursor-pointer"
                                        onClick={() => setProductModal(true)}
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
                                    onChange={(e) => {
                                        updateDropdownPos(e, index);
                                        handleProductSearch(e.target.value, index);
                                    }}
                                    onKeyDown={(e) => handleProductKeyDown(e, index)}
                                    className={`${inputClass} pr-10 ${row.locked ? "bg-gray-100 cursor-not-allowed" : "border-gray-300 hover:border-secondary"
                                        } focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20`}
                                />

                                {/* ICONS - Matches Fitter Design */}
                                <div className="absolute right-3 top-7.5 md:top-2.5 text-gray-500">
                                    {row.searchLoading && !row.locked && (
                                        <AiOutlineLoading3Quarters className="animate-spin" />
                                    )}

                                    {!row.searchLoading && row.locked && (
                                        <button
                                            type="button"
                                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                                            onClick={() => removeProductSelection(index)}
                                        >
                                            <IoCloseCircleOutline size={22} />
                                        </button>
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
                                                    {p.name} - {p.color ? p.color : "All Color"}
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

                            {/* QTY IN BAG */}
                            <div>
                                <label className="sm:hidden block text-xs font-semibold mb-1">
                                    Qty In Bag
                                </label>
                                <input
                                    value={row.qty_in_bag}
                                    placeholder="Qty In Bag"
                                    onChange={(e) => handleChange(index, "qty_in_bag", e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            {/* QTY IN KG */}
                            <div>
                                <label className="sm:hidden block text-xs font-semibold mb-1">
                                    Qty In Kg
                                </label>
                                <input
                                    value={row.qty_in_kg}
                                    placeholder="Qty In Kg"
                                    onChange={(e) => handleChange(index, "qty_in_kg", e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            {/* ELECTRICITY UNIT */}
                            <div>
                                <label className="sm:hidden block text-xs font-semibold mb-1">
                                    Electricity Unit
                                </label>
                                <input
                                    value={row.electricity_unit}
                                    placeholder="Electricity Unit"
                                    onChange={(e) =>
                                        handleChange(index, "electricity_unit", e.target.value)
                                    }
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

                {/* DESCRIPTION */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-1">
                        Description
                    </label>
                    <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={inputClass}
                        placeholder="Description"
                    />

                </div>

                <div className="flex flex-row gap-4">
                    <button
                        onClick={handleCancel}
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
            {/* model */}
            <CreateProductModel
                open={productModal}
                onClose={() => setProductModal(false)}
            />

        </div>
    );
}
