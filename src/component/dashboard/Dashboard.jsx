"use client";

import React from "react";
import {
    FaBox,
    FaShoppingCart,
    FaArrowUp,
    FaArrowDown,
    FaUsers,
    FaWallet,
    FaSearch,
} from "react-icons/fa";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    ArcElement,
    PointElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar, Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    ArcElement,
    PointElement,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const stats = [
        { title: "Total Products", value: "1,240", icon: <FaBox />, trend: "+12%" },
        { title: "Total Orders", value: "856", icon: <FaShoppingCart />, trend: "+8%" },
        { title: "Raw Inward", value: "320", icon: <FaArrowDown />, trend: "+6%" },
        { title: "Raw Outward", value: "295", icon: <FaArrowUp />, trend: "-2%" },
        { title: "Customers", value: "540", icon: <FaUsers />, trend: "+15%" },
        { title: "Revenue", value: "₹3.2L", icon: <FaWallet />, trend: "+18%" },
    ];

    const barData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Orders",
                data: [120, 180, 150, 240, 200, 280],
                backgroundColor: "#327A89",
                borderRadius: 10,
            },
        ],
    };

    const lineData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Revenue",
                data: [12000, 16000, 19000, 24000, 28000, 34000],
                borderColor: "#006d77",
                backgroundColor: "rgba(50,122,137,0.25)",
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const donutData = {
        labels: ["Sold", "In Stock", "Returned"],
        datasets: [
            {
                data: [65, 25, 10],
                backgroundColor: ["#006d77", "#327A89", "#e5e7eb"],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { labels: { color: "#334155", font: { size: 12 } } },
        },
    };

    return (
        <div className="flex-1 pt-16 lg:pt-2 bg-grey h-dvh overflow-hidden">
            <div className="h-full overflow-y-auto p-6 space-y-8 custom-scrollbar">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-primary">Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Welcome back to your dashboard
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-4 pr-10 py-2.5 rounded-lg bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.map((item, i) => (
                        <div
                            key={i}
                            className="bg-white p-6 rounded-2xl shadow-md transition-all"
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-gray-500 text-sm">{item.title}</p>
                                    <h2 className="text-2xl font-bold text-primary">
                                        {item.value}
                                    </h2>
                                    <span
                                        className={`text-xs ${item.trend.includes("-")
                                            ? "text-red-500"
                                            : "text-green-600"
                                            }`}
                                    >
                                        {item.trend}
                                    </span>
                                </div>
                                <div className="h-14 w-14 rounded-xl bg-[#327A89] text-white flex items-center justify-center text-xl shadow-lg">
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-primary font-semibold mb-4">Monthly Orders</h3>
                        <div className="h-70">
                            <Bar data={barData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-primary font-semibold mb-4">Revenue Growth</h3>
                        <div className="h-70">
                            <Line data={lineData} options={chartOptions} />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-primary font-semibold mb-4">
                            Inventory Status
                        </h3>
                        <div className="h-70">
                            <Doughnut data={donutData} options={chartOptions} />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
