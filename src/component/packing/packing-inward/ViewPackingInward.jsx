"use client";

import {
  getMapperRatePerGurus,
  getPackingInwardById
} from "@/lib/fetcher";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none bg-gray-100 cursor-not-allowed";

const ViewPackingInward = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = router.query;

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

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


  const [difference, setDifference] = useState(0);
  const [expectedGurus, setExpectedGurus] = useState(0);
  const [ratePerGurus, setRatePerGurus] = useState("");
  const [pageLoading, setPageLoading] = useState(true);
  const [productId, setProductId] = useState(null);
  // ================= PRODUCT STATE =================
  const [products, setProducts] = useState([]);
  const [fitterSearch, setFitterSearch] = useState("");

  // ================= LOAD INITIAL DATA =================
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

      setProductId(data.product?.id);

      const exp = data.outward?.expectation;

      setExpectation({
        exp_gurus: Number(exp?.exp_gurus || 0),
        delivered_qty: Number(exp?.delivered_qty || 0),
        pending_qty: Number(exp?.pending_qty || 0),
      });

      // For difference & validation, use pending
      setExpectedGurus(Number(exp?.pending_qty || 0));

      setInwardData({
        packing_inward_date: data.inward_date
          ? data.inward_date.split("T")[0]
          : "",
        fitter_id: data.fitter?.id || "",
        product_id: data.product?.id || "",
        amount: data.amount || "",
        rate: data.rate || "",
        receive_gurus: data.receive_gurus || "",
        remark: data.remark || "",
      });

    } catch (err) {
      toast.error("Failed to load inward data");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInwardDetails();
    }
  }, [id]);

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


  // ================= CALC DIFFERENCE =================
  // useEffect(() => {
  //   const received = Number(inwardData.receive_gurus || 0);
  //   const expected = Number(expectedGurus || 0);
  //   setDifference(expected - received);
  // }, [inwardData.receive_gurus, expectedGurus]);

  if (pageLoading) {
    return (
      <div className="flex-1 bg-grey flex items-center justify-center h-dvh">
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
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">View Packing Inward</h1>
        <Link
          href="/packing/packing-inward"
          className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
        >
          <IoArrowBackOutline size={18} />
          Back
        </Link>
      </div>

      {/* CONTENT */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {/* DATE */}
          <div>
            <label className="block text-sm font-semibold mb-1">Date</label>
            <input
              type="text"
              value={formatDate(inwardData.packing_inward_date)}
              disabled
              className={inputClass}
            />
          </div>

          {/* FITTER NAME */}
          <div className="relative w-full">
            <label className="block text-sm font-semibold mb-1">Fitter Name</label>
            <input
              type="text"
              value={fitterSearch}
              disabled
              className={inputClass}
            />
          </div>

          {/* PRODUCT NAME */}
          <div className="relative w-full">
            <label className="block text-sm font-semibold mb-1">Product Name</label>
            <select
              value={inwardData.product_id}
              disabled
              className={`${inputClass} appearance-none`}
            >
              <option value="">Select product</option>
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
            <label className="block text-sm font-semibold mb-1">
              Qty in Gross
            </label>
            <input
              type="number"
              value={inwardData.receive_gurus}
              disabled
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

          <div>
            <label className="block text-sm font-semibold mb-1">Rate</label>
            <input
              type="text"
              value={inwardData.rate}
              disabled
              className={`${inputClass} bg-gray-100`}
            />

          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Amount</label>
            <input
              type="text"
              value={inwardData.amount}
              disabled
              className={`${inputClass} bg-gray-100`}
            />
          </div>

          {/* DIFFERENCE */}
          <div>
            <label className="block text-sm font-semibold mb-1">Difference</label>
            <input
              type="text"
              value={difference}
              disabled
              className={inputClass}
            />
          </div>

        </div>

        {/* REMARK */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">Remark</label>
          <textarea
            value={inwardData.remark}
            rows={4}
            disabled
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* BOTTOM BACK BUTTON */}
        <div className="flex flex-row gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Back to List
          </button>
        </div>
      </div>
    </div >
  );
};

export default ViewPackingInward;