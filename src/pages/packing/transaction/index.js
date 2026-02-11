import Sidebar from "@/component/sidebar/Sidebar";
import Transaction from "@/component/transaction/Transaction"
import React from "react";

const TransactionPage = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <Transaction />
        </div>
    );
};

export default TransactionPage;
