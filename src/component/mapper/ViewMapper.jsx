"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    IoArrowBackOutline,
    IoSearch,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import {
    getUserByPermission,
    getMapperById,
} from "@/lib/fetcher";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 bg-gray-100 cursor-not-allowed text-gray-600 focus:outline-none transition-all";

const ViewMapper = () => {
    const router = useRouter();
    const { id } = router.query;

    const [pageLoading, setPageLoading] = useState(true);

    // Form State
    const [mapper, setMapper] = useState({
        product_id: "",
        user_id: "",
        rate_per_gurus: "",
    });

    // User State
    const [selectedUser, setSelectedUser] = useState("");
    const [userList, setUserList] = useState([]);
    const [productSearch, setProductSearch] = useState("");

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

                setProductSearch(
                    `${data.product_name}${data.product_color ? " - " + data.product_color : ""}`
                );

            } catch (err) {
                toast.error("Failed to load data");
                router.push("/mapper");
            } finally {
                setPageLoading(false);
            }
        };

        initData();
    }, [id]);

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
                <h1 className="text-lg md:text-2xl font-semibold">View Mapper</h1>
                <Link href="/packing/mapper" className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit">
                    <IoArrowBackOutline size={18} /> Back
                </Link>
            </div>

            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">

                    {/* PRODUCT DISPLAY */}
                    <div className="relative">
                        <label className="block text-sm font-semibold mb-1">
                            Product
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={productSearch}
                                disabled
                                className={inputClass}
                            />

                        </div>
                    </div>

                    {/* RATE PER GURUS */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Rate per Gross</label>
                        <input
                            type="text"
                            value={mapper.rate_per_gurus}
                            disabled
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
                            disabled
                            className={`${inputClass} appearance-none pr-9`}
                        >
                            <option value="">Select User</option>
                            {userList.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className="flex flex-row gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
                    >
                        Back to List
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewMapper;