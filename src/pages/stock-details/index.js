import Sidebar from "@/component/sidebar/Sidebar";
import StockDetails from "@/component/stock_details/StockDetails";
import React from "react";

const PackingPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <StockDetails />
    </div>
  );
};

export default PackingPage;
