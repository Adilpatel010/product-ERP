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
    createMapper,
} from "@/lib/fetcher";
import CreateProductModel from "../models/product/CreateProductModel";
import { FiPlusCircle } from "react-icons/fi";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all";

const AddMapper = () => {
    const router = useRouter();
    const [create, setCreate] = useState(false);
    const [allUser, setAllUser] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [productModal, setProductModal] = useState(false);
    // Form State
    const [mapper, setMapper] = useState({
        product_id: "",
        rate_per_gurus: "",
        user_id: "",
    });

    // Product Search State
    const [productSearch, setProductSearch] = useState("");
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(false);
    const [productTimeout, setProductTimeout] = useState(null);
    const [productActive, setProductActive] = useState(0);
    const [productShowNotFound, setProductShowNotFound] = useState(false);

    const [loadingUsers, setLoadingUsers] = useState(false);
    const [user, setUser] = useState([]);


    useEffect(() => {
        setMapper((prev) => ({
            ...prev,
            date: new Date().toISOString().split("T")[0],
        }));
    }, []);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                const users = await getUserByPermission();
                setUser(users);
            } catch (err) {
                toast.error("Failed to load users");
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, []);


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
        setMapper((prev) => ({
            ...prev,
            [field]: value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        // ---------------- VALIDATION ----------------
        if (!selectedProduct)
            return toast.error("Please select product");

        if (!mapper.rate_per_gurus)
            return toast.error("Please enter rate per gurus");

        if (Number(mapper.rate_per_gurus) <= 0)
            return toast.error("Rate per gurus must be greater than 0");

        if (!allUser && !selectedUser)
            return toast.error("Please select user");

        // ---------------- USER IDS ARRAY ----------------
        let userIds = [];

        if (allUser) {
            userIds = user.map(u => u.id);
        } else {
            userIds = [selectedUser];
        }
        try {
            setCreate(true);

            const payload = {
                product_id: selectedProduct.id,
                rate_per_gurus: Number(mapper.rate_per_gurus),
                user_ids: userIds,
            };

            const res = await createMapper(payload);

            toast.success("Mapper payload ready");
            router.push("/packing/mapper");

        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                "Something went wrong";

            toast.error(message);

        } finally {
            setCreate(false);
        }
    };

    const handleCancel = () => {
        setMapper({
            product_id: "",
            rate_per_gurus: "",
            user_id: "",
        });

        setSelectedProduct(null);
        setProductSearch("");
        setSelectedUser("");
        setAllUser(false);
    };

    return (
        <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
            <div className="flex flex-row justify-between items-center gap-3 mb-4">
                <h1 className="text-lg md:text-2xl font-semibold">
                    Add Mapper
                </h1>
                <Link
                    href="/packing/mapper"
                    className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
                >
                    <IoArrowBackOutline size={18} /> Back
                </Link>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                    {/* PRODUCT SEARCH */}
                    <div className="relative">
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-semibold ">
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
                                            p < products.length - 1 ? p + 1 : p,
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
                                        }}
                                    />
                                )}
                                {!productLoading && !productSearch && (
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
                                                        `${p.name} - ${p.color ? `${p.color}` : "All Color"}`,
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
                            onChange={(e) =>
                                handleChange("rate_per_gurus", e.target.value)
                            }
                            placeholder="0"
                            className={inputClass}
                        />
                    </div>

                    {/* USER DROPDOWN */}
                    <div>
                        <div className="w-full relative">
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-semibold">
                                    User
                                </label>

                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={allUser}
                                        onChange={(e) => {
                                            setAllUser(e.target.checked);
                                            setSelectedUsers([]);
                                            setSelectedUser("");
                                        }}
                                        className="w-4 h-4 rounded border-gray-300 text-secondary focus:ring-secondary"
                                    />
                                    <span>All User</span>
                                </label>
                            </div>

                            {/* SELECT */}
                            <select
                                value={selectedUser}
                                disabled={loadingUsers || allUser}
                                onChange={(e) => {
                                    const userId = e.target.value;
                                    setSelectedUser(userId);

                                    const findUser = user.find((u) => u.id === userId);

                                    if (
                                        findUser &&
                                        !selectedUsers.some((u) => u.id === userId)
                                    ) {
                                        setSelectedUsers((prev) => [...prev, findUser]);
                                    }
                                }}
                                className={`${inputClass} appearance-none cursor-pointer 
        ${loadingUsers || allUser
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : ""
                                    }
      `}
                            >
                                <option value="">
                                    {loadingUsers
                                        ? "Loading users..."
                                        : allUser
                                            ? "All users selected"
                                            : "Select User"}
                                </option>

                                {user.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>

                            {!allUser && (
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
                            )}

                        </div>
                    </div>

                    {/* SELECTED USERS */}
                    <div className="bg-gray-50 rounded-xl border-2 border-gray-300 p-3 h-fit">

                        <h2 className="text-sm font-semibold mb-2">
                            Selected Users
                        </h2>

                        {allUser ? (
                            <div className="text-sm text-secondary font-semibold">
                                ✔ All users selected
                            </div>
                        ) : selectedUsers.length === 0 ? (
                            <div className="text-sm text-gray-400">
                                No user selected
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedUsers.map((u) => (
                                    <div
                                        key={u.id}
                                        className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border-2 border-gray-300"
                                    >
                                        <span className="text-sm font-medium text-secondary">
                                            {u.name}
                                        </span>

                                        <IoCloseCircleOutline
                                            size={18}
                                            className="text-gray-400 hover:text-red-500 cursor-pointer"
                                            onClick={() => {
                                                setSelectedUsers((prev) =>
                                                    prev.filter((x) => x.id !== u.id)
                                                );

                                                if (selectedUser === u.id) {
                                                    setSelectedUser("");
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                <div className="flex flex-row gap-4">
                    <button
                        onClick={handleCancel}
                        disabled={create}
                        className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={create}
                        className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                        {create ? "Creating..." : "Create"}
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

export default AddMapper;
