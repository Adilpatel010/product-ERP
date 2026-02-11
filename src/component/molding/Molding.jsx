"use client";

import React, { useState } from "react";
import Working from "./Working";
import Machine from "./Machine";

const Molding = () => {
    const [activeTab, setActiveTab] = useState("working");

    return (
        <div className="flex-1 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 pt-16 lg:pt-4 overflow-hidden">

            {/* ================= HEADER (LEFT TITLE + RIGHT TABS) ================= */}
            <div className="mb-4 shrink-0">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3">

                    {/* LEFT TITLE */}
                    <h1 className="text-2xl font-semibold text-black">
                        Molding
                    </h1>

                    {/* RIGHT TABS */}
                    <div className="flex items-center gap-2 bg-white px-2 py-2 rounded-full shadow-inner">
                        <button
                            onClick={() => setActiveTab("working")}
                            className={`px-8 cursor-pointer py-2 rounded-full text-sm font-semibold transition-all duration-200
            ${activeTab === "working"
                                    ? "bg-secondary text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Working
                        </button>

                        <button
                            onClick={() => setActiveTab("machine")}
                            className={`px-8 cursor-pointer py-2 rounded-full text-sm font-semibold transition-all duration-200
            ${activeTab === "machine"
                                    ? "bg-secondary text-white shadow-md"
                                    : "text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            Machine
                        </button>
                    </div>

                </div>
            </div>


            {activeTab === "working" && <Working />}
            {activeTab === "machine" && <Machine />}
        </div>
    );
};

export default Molding;
