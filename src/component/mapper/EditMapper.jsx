"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    IoArrowBackOutline,
    IoCloseCircleOutline,
    IoSearch,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import {
    searchProduct,
    getUserByPermission,
    getMapperById,
    updateMapper,
} from "@/lib/fetcher";
import { FiPlusCircle } from "react-icons/fi";
import CreateProductModel from "../models/product/CreateProductModel";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all";

const EditMapper = () => {
    const router = useRouter();
    const { id } = router.query;

    const [isUpdating, setIsUpdating] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [productModal, setProductModal] = useState(false);

    // Form State
    const [mapper, setMapper] = useState({
        product_id: "",
        user_id: "",
        rate_per_gurus: "",
    });

    // User State
    const [selectedUser, setSelectedUser] = useState("");
    const [userList, setUserList] = useState([]);

    // Product Search State
    const [productSearch, setProductSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const [productLoading, setProductLoading] = useState(false);
    const [productTimeout, setProductTimeout] = useState(null);
    const [productActive, setProductActive] = useState(0);
    const [productShowNotFound, setProductShowNotFound] = useState(false);


    // 1. Fetch Users List and Mapper Data on Load
    useEffect(() => {
        const initData = async () => {
            if (!id) return;
            try {
                setPageLoading(true);

                const users = await getUserByPermission();
                setUserList(users);

                const res = await getMapperById(id);
                const data = res.data;

                setMapper({
                    product_id: data.product_id,
                    user_id: data.user_id,
                    rate_per_gurus: data.rate_per_gurus.toString(),
                });

                if (data.user_id) {
                    setSelectedUser(data.user_id);
                }

                // AUTO SELECT PRODUCT ON EDIT
                setSelectedProduct({
                    id: data.product_id,
                    name: data.product_name,
                    color: data.product_color || null,
                });

                setProductSearch(
                    `${data.product_name}${data.color ? " - " + data.color : " - All Color"}`
                );


            } catch (err) {
                toast.error("Failed to load data");
                router.push("/packing/mapper");
            } finally {
                setPageLoading(false);
            }
        };

        initData();
    }, [id]);

    /* ================= SEARCH LOGIC ================= */
    const getProducts = async (value) => {
        try {
            const res = await searchProduct(value);
            const data = res?.data || [];
            setProducts(data);
            setProductShowNotFound(data.length === 0);
        } catch {
            setProducts([]);
            setProductShowNotFound(true);
        } finally {
            setProductLoading(false);
        }
    };


    const handleChange = (field, value) => {
        setMapper((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedProduct) return toast.error("Please select product");
        if (!mapper.rate_per_gurus || Number(mapper.rate_per_gurus) <= 0)
            return toast.error("Please enter a valid rate");
        if (!selectedUser) return toast.error("Please select a user");

        try {
            setIsUpdating(true);
            const payload = {
                product_id: selectedProduct.id,
                rate_per_gurus: Number(mapper.rate_per_gurus),
                user_id: selectedUser,
            };

            await updateMapper(id, payload);
            toast.success("Mapper updated successfully");
            router.push("/packing/mapper");
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong";

            toast.error(message);

        } finally {
            setIsUpdating(false);
        }
    };

    if (pageLoading) {
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
                <h1 className="text-lg md:text-2xl font-semibold">Edit Mapper</h1>
                <Link href="/packing/mapper" className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit">
                    <IoArrowBackOutline size={18} /> Back
                </Link>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                    {/* PRODUCT SEARCH */}
                    <div className="relative">
                        <div className=" flex items-center justify-between mb-1">
                            <label className=" block text-sm font-semibold ">
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
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search Product"
                                value={productSearch}
                                readOnly={!!selectedProduct}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setProductSearch(val);
                                    setProductActive(0);
                                    setProductShowNotFound(false);
                                    if (productTimeout) clearTimeout(productTimeout);

                                    if (!val.trim()) {
                                        setProducts([]);
                                        setProductLoading(false);
                                        return;
                                    }
                                    setProductLoading(true);
                                    setProductTimeout(setTimeout(() => getProducts(val), 500));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Escape") setProducts([]);
                                    if (!products.length) return;
                                    if (e.key === "ArrowDown")
                                        setProductActive((p) =>
                                            p < products.length - 1 ? p + 1 : p
                                        );
                                    if (e.key === "ArrowUp")
                                        setProductActive((p) => (p > 0 ? p - 1 : 0));
                                    if (e.key === "Enter") {
                                        const p = products[productActive];
                                        if (p) {
                                            setSelectedProduct(p);
                                            setProductSearch(
                                                `${p.name} - ${p.color ? `${p.color}` : "All Color"}`
                                            );
                                            setProducts([]);
                                        }
                                    }
                                }}
                                className={`${inputClass} ${selectedProduct ? "bg-gray-100 cursor-not-allowed" : ""}`}
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center">
                                {productLoading && (
                                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                                )}
                                {!productLoading && selectedProduct && (
                                    <IoCloseCircleOutline
                                        size={20}
                                        className="text-gray-400 cursor-pointer hover:text-red-500"
                                        onClick={() => {
                                            setSelectedProduct(null);
                                            setProductSearch("");
                                            setProductShowNotFound(false);
                                            setProducts([]);
                                        }}
                                    />
                                )}
                                {!productLoading && !selectedProduct && !productSearch && (
                                    <IoSearch size={18} className="text-gray-400" />
                                )}
                            </div>
                        </div>

                        {/* DROPDOWN RESULTS */}
                        {!selectedProduct && productSearch && (
                            <>
                                {products.length > 0 && (
                                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {products.map((p, i) => (
                                            <div
                                                key={p.id}
                                                onMouseEnter={() => setProductActive(i)}
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setProductSearch(
                                                        `${p.name} - ${p.color ? `${p.color}` : "All Color"}`
                                                    );
                                                    setMapper((prev) => ({
                                                        ...prev,
                                                        product_id: p.id,
                                                    }));
                                                    setProducts([]);
                                                }}
                                                className={`px-3 py-2 text-sm cursor-pointer transition ${i === productActive ? "bg-primary text-white" : "hover:bg-secondary/10"}`}
                                            >
                                                {p.name} - {p.color ? `${p.color}` : "All Color"}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {productShowNotFound && !productLoading && (
                                    <div className="absolute z-50 w-full mt-1 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 shadow-lg rounded-lg">
                                        No product found
                                    </div>
                                )}
                            </>
                        )}
                    </div>


                    {/* RATE PER GURUS */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Rate per Gross</label>
                        <input
                            type="text"
                            value={mapper.rate_per_gurus}
                            onChange={(e) => handleChange("rate_per_gurus", e.target.value)}
                            placeholder="0"
                            className={inputClass}
                        />
                    </div>

                    {/* USER SELECTION */}
                    <div className="relative">
                        <label className="block text-sm font-semibold mb-1">
                            User
                        </label>

                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className={`${inputClass} appearance-none cursor-pointer pr-9`}
                        >
                            <option value="">Select User</option>
                            {userList.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>

                        {/* DROPDOWN ARROW */}
                        <div className="pointer-events-none absolute right-3 top-9 text-gray-500">
                            <svg
                                className="h-4 w-4"
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
                        </div>
                    </div>

                </div>

                <div className="flex flex-row gap-4">
                    <button onClick={() => router.push("/packing/mapper")} className="flex-1 text-secondary border-2 cursor-pointer border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50">
                        Back
                    </button>
                    <button onClick={handleSubmit}
                        disabled={isUpdating}
                        className="flex-1 py-2 rounded-lg bg-secondary cursor-pointer text-white font-semibold hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        {isUpdating ? "Updating..." : "Update"}
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
};

export default EditMapper;