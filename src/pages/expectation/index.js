import Expectation from "@/component/expectation/Expectation";
import Sidebar from "@/component/sidebar/Sidebar";
import React from "react";

const ExpectationPage = () => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <Expectation />
    </div>
  );
};

export default ExpectationPage;
