"use client";

import {
    getPackingInwardById,
    updatePackingInwardData
} from "@/lib/fetcher";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    IoArrowBackOutline,
    IoCalendarOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

const EditPackingInward = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();
    const isAdmin = user?.role === "superAdmin";
    // ================= MAIN STATE =================
    const [inwardData, setInwardData] = useState({
        packing_inward_date: "",
        fitter_id: "",
        product_id: "",
        receive_gurus: "",
        amount: "",
        rate: "",
        remark: "",
    });
    const [expectation, setExpectation] = useState({
        exp_gurus: 0,
        delivered_qty: 0,
        pending_qty: 0,
    });

    const formatDDMMYYYY = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const [difference, setDifference] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [expectedGurus, setExpectedGurus] = useState(0);
    const [pageLoading, setPageLoading] = useState(true);

    // ================= PRODUCT SEARCH STATE =================
    const [products, setProducts] = useState([]);

    // ================ FITTER SEARCH STATE ==================
    const [fitterSearch, setFitterSearch] = useState("");

    // ================= LOAD INITIAL DATA =================
    useEffect(() => {
        if (id) {
            fetchInwardDetails();
        }
    }, [id]);

    const fetchInwardDetails = async () => {
        try {
            setPageLoading(true);

            const res = await getPackingInwardById(id);
            const data = res.data;

            setFitterSearch(data.fitter?.user_name || "");

            setProducts([
                {
                    product: data.product,
                    exp_gurus: data.outward.exp_gurus,
                },
            ]);

            const exp = data.outward?.expectation;

            setExpectation({
                exp_gurus: Number(exp?.exp_gurus || 0),
                delivered_qty: Number(exp?.delivered_qty || 0),
                pending_qty: Number(exp?.pending_qty || 0),
            });

            // For difference & validation, use pending
            setExpectedGurus(Number(exp?.pending_qty || 0));


            // SET FORM DATA
            setInwardData({
                packing_inward_date: data.inward_date?.split("T")[0] || "",
                fitter_id: data.fitter?.id || "",
                product_id: data.product?.id || "",
                receive_gurus: data.receive_gurus || "",
                amount: data.amount || "",
                rate: data.rate || "",
                remark: data.remark || "",
            });

        } catch (err) {
            toast.error("Failed to load inward data");
        } finally {
            setPageLoading(false);
        }
    };

    // ================= CALC DIFFERENCE & AMOUNT =================
    useEffect(() => {
        const received = Number(inwardData.receive_gurus || 0);
        const expected = Number(expectedGurus || 0);
        const rate = Number(inwardData.rate || 0);

        setDifference(expected - received);

        const newAmount = (received * rate).toFixed(2);

        setInwardData(prev => ({
            ...prev,
            amount: newAmount,
        }));
    }, [inwardData.receive_gurus, inwardData.rate, expectedGurus]);

    // ================= INPUT CHANGE =================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setInwardData((prev) => ({ ...prev, [name]: value }));
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!id) {
            toast.error("Invalid inward id");
            return;
        }

        if (!inwardData.receive_gurus) {
            toast.error("Please enter receive gross");
            return;
        }

        try {
            setUpdating(true);

            await updatePackingInwardData(id, {
                packing_inward_date: inwardData.packing_inward_date,
                receive_gurus: inwardData.receive_gurus,
                amount: inwardData.amount,
                rate: inwardData.rate,
                remark: inwardData.remark,
            });

            toast.success("Packing inward updated successfully");
            router.push("/packing/packing-inward");

        } catch (err) {
            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setUpdating(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex-1 bg-grey flex items-center justify-center h-dvh">
                <div className="flex items-center justify-center h-full w-full">
                    <div className="relative w-12 h-12 animate-spin">
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
                <h1 className="text-lg md:text-2xl font-semibold">Edit Packing Inward</h1>
                <Link
                    href="/packing/packing-inward"
                    className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
                >
                    <IoArrowBackOutline size={18} />
                    Back
                </Link>
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden"
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* DATE */}
                    {/* DATE */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Date</label>

                        <div className="relative">
                            <input
                                type="date"
                                name="packing_inward_date"
                                value={inwardData.packing_inward_date}
                                onChange={handleChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <input
                                type="text"
                                readOnly
                                value={formatDDMMYYYY(inwardData.packing_inward_date)}
                                className={`${inputClass} pr-10`}
                            />

                            {/* CALENDAR ICON */}
                            <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                                <IoCalendarOutline size={18} />
                            </div>
                        </div>
                    </div>

                    {/* FITTER NAME - DISABLED */}
                    <div className="relative w-full">
                        <label className="block text-sm font-semibold mb-1">Fitter Name</label>
                        <input
                            type="text"
                            value={fitterSearch}
                            disabled={true}
                            className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                        />
                    </div>

                    {/* PRODUCT NAME - DISABLED */}
                    <div className="relative w-full">
                        <label className="block text-sm font-semibold mb-1">Product Name</label>
                        <select
                            name="product_id"
                            value={inwardData.product_id}
                            disabled={true}
                            className={`${inputClass} appearance-none bg-gray-100 cursor-not-allowed`}
                        >
                            {products.map((row) => (
                                <option key={row?.product?.id} value={row?.product?.id}>
                                    {row.product.product_name} - {row.product.color || "All Color"} - {row.exp_gurus} Gross
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                    {/* QTY */}
                    <div>
                        <label className="block text-sm font-semibold mb-1 flex flex-wrap items-center gap-2">
                            <span>Qty in Gross</span>
                        </label>

                        <input
                            type="number"
                            name="receive_gurus"
                            placeholder="qty"
                            value={inwardData.receive_gurus}
                            onChange={handleChange}
                            className={inputClass}
                        />
                        {expectation.exp_gurus > 0 && (
                            <span className="text-xs font-medium text-gray-600">
                                (
                                <span className="text-gray-700">
                                    Expected: {expectation.exp_gurus}
                                </span>
                                {" | "}
                                <span className="text-green-600">
                                    Delivered: {expectation.delivered_qty}
                                </span>
                                {" | "}
                                <span className="text-red-600">
                                    Pending: {expectation.pending_qty}
                                </span>
                                )
                            </span>
                        )}
                    </div>

                    {/* RATE - READ ONLY */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Rate</label>
                        <input
                            type="number"
                            name="rate"
                            value={inwardData.rate}
                            disabled={!isAdmin}
                            onChange={handleChange}
                            className={`${inputClass} ${!isAdmin ? "bg-gray-100" : ""}`}
                        />

                    </div>

                    {/* AMOUNT - READ ONLY */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Amount</label>
                        <input
                            type="text"
                            value={inwardData.amount}
                            disabled
                            className={`${inputClass} bg-gray-100`}
                        />
                    </div>

                    {/* DIFFERENCE - READ ONLY */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Difference</label>
                        <input
                            type="text"
                            value={difference}
                            disabled
                            className={`${inputClass} bg-gray-100`}
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Remark</label>
                    <textarea
                        name="remark"
                        placeholder="Remark"
                        value={inwardData.remark}
                        rows={4}
                        onChange={handleChange}
                        className={inputClass}
                    />
                </div>

                <div className="flex flex-row gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={updating}
                        className="flex-1 px-6 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {updating ? "Updating..." : "Update"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPackingInward;


