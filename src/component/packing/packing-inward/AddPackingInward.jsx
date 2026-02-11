"use client";

import { createPackingInward, getMapperRatePerGurus, getPackingProductByFitterId, searchOutwardUser, updatePackingInward } from "@/lib/fetcher";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoSearch,
  IoCloseCircleOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

const AddPackingInward = () => {

  // ================= MAIN STATE =================
  const [inwardData, setInwardData] = useState({
    packing_inward_date: "",
    fitter_id: "",
    product_id: "",
    outward_id: "",
    amount: "",
    rate: "",
    receive_gurus: "",
    remark: "",
  });

  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role === "superAdmin";
  const [difference, setDifference] = useState(0);
  const [ratePerGurus, setRatePerGurus] = useState(0);
  const [expectedGurus, setExpectedGurus] = useState(0);
  const [amount, setAmount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [noProductFound, setNoProductFound] = useState(false);

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

  // ================= PRODUCT SEARCH STATE =================
  const [products, setProducts] = useState([]);
  const [create, setCreate] = useState(false);

  // ================ FITTER SEARCH STATE ==================
  const [fitterSearch, setFitterSearch] = useState("");
  const [fitterId, setFitterId] = useState("");
  const [fitters, setFitters] = useState([]);
  const [showFitterDropdown, setShowFitterDropdown] = useState(false);
  const [activeFitterIndex, setActiveFitterIndex] = useState(0);
  const [fitterLoading, setFitterLoading] = useState(false);

  // ================= TODAY DATE =================
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setInwardData((prev) => ({
      ...prev,
      packing_inward_date: today,
    }));
  }, []);

  useEffect(() => {
    if (user?.id) {
      setSelectedUserId(user.id);
    }
  }, [user]);
  // ================= AUTO CALCULATE AMOUNT =================
  useEffect(() => {
    const qty = Number(inwardData.receive_gurus || 0);
    const rate = Number(ratePerGurus || 0);

    const total = qty * rate;

    setAmount(total);
  }, [inwardData.receive_gurus, ratePerGurus]);


  // ================= INPUT CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInwardData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= FITTER SEARCH =================
  const handleFitterSearch = async (value) => {
    setFitterSearch(value);

    if (!value.trim()) {
      setFitters([]);
      setShowFitterDropdown(false);
      return;
    }

    setFitterLoading(true);

    try {
      const res = await searchOutwardUser(value);

      setFitters(res?.data || []);
      setActiveFitterIndex(0);
      setShowFitterDropdown(true);
    } catch (err) {
      console.error(err);
    } finally {
      setFitterLoading(false);
    }
  };

  const handleFitterKeyDown = (e) => {
    if (!showFitterDropdown) return;

    if (e.key === "ArrowDown") {
      setActiveFitterIndex((prev) =>
        prev < fitters.length - 1 ? prev + 1 : prev
      );
    }

    if (e.key === "ArrowUp") {
      setActiveFitterIndex((prev) => (prev > 0 ? prev - 1 : 0));
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectFitter(fitters[activeFitterIndex]);
    }

    if (e.key === "Escape") {
      setShowFitterDropdown(false);
    }
  };

  // const selectFitter = async (fitter) => {
  //   setFitterSearch(fitter.name);
  //   setFitterId(fitter.id);

  //   setInwardData((prev) => ({
  //     ...prev,
  //     fitter_id: fitter.id,
  //     product_id: "",
  //   }));

  //   setProducts([]);
  //   setExpectedGurus(0);
  //   setNoProductFound(false);
  //   setShowFitterDropdown(false);

  //   try {
  //     setCreate(true);

  //     const res = await getPackingProductByFitterId(fitter.id);

  //     if (!res?.data || res.data.length === 0) {
  //       setProducts([]);
  //       setNoProductFound(true);
  //       return;
  //     }

  //     setProducts(res.data);
  //     setNoProductFound(false);

  //   } catch (err) {
  //     setProducts([]);
  //     setNoProductFound(true);
  //   } finally {
  //     setCreate(false);
  //   }
  // };

  const selectFitter = async (fitter) => {
    setFitterSearch(fitter.name);
    setFitterId(fitter.id);

    setInwardData((prev) => ({
      ...prev,
      fitter_id: fitter.id,
      product_id: "",
      outward_id: "",
    }));

    setProducts([]);
    setExpectedGurus(0);
    setRatePerGurus(0);
    setNoProductFound(false);
    setShowFitterDropdown(false);

    try {
      setCreate(true);

      const res = await getPackingProductByFitterId(fitter.id);

      if (!res?.data || res.data.length === 0) {
        setProducts([]);
        setNoProductFound(true);
        return;
      }

      const outwardProducts = res.data;
      setProducts(outwardProducts);
      setNoProductFound(false);

      // ================= AUTO SELECT FIRST PRODUCT =================
      const first = outwardProducts[0];

      setInwardData((prev) => ({
        ...prev,
        outward_id: first.id,
        product_id: first.product.id,
      }));

      // setExpectedGurus(Number(first.exp_gurus || 0));

      const exp = first.expectations?.[0];

      setExpectation({
        exp_gurus: Number(exp?.exp_gurus || 0),
        delivered_qty: Number(exp?.delivered_qty || 0),
        pending_qty: Number(exp?.pending_qty || 0),
      });

      setExpectedGurus(Number(exp?.pending_qty || 0)); // important


      // ================= AUTO FETCH RATE =================
      if (!isAdmin && user?.id) {
        const rateRes = await getMapperRatePerGurus(
          first.product.id,
          user.id
        );
        setRatePerGurus(rateRes?.rate_per_gurus || 0);
      }

    } catch (err) {
      console.error(err);
      setProducts([]);
      setNoProductFound(true);
    } finally {
      setCreate(false);
    }
  };


  const removeFitter = () => {
    // clear fitter
    setFitterSearch("");
    setFitterId("");
    setFitters([]);
    setShowFitterDropdown(false);

    // clear product related data
    setProducts([]);
    setExpectedGurus(0);
    setRatePerGurus(0);
    setAmount(0);
    setDifference(0);

    // reset inward form
    setInwardData((prev) => ({
      ...prev,
      fitter_id: "",
      product_id: "",
      receive_gurus: "",
      remark: "",
    }));
  };

  useEffect(() => {
    const received = Number(inwardData.receive_gurus || 0);
    const expected = Number(expectedGurus || 0);

    const diff = expected - received;

    setDifference(diff);
  }, [inwardData.receive_gurus, expectedGurus]);


  const handleCancel = () => {
    setFitterSearch("");
    setFitterId("");
    setFitters([]);
    setShowFitterDropdown(false);
    setProducts([]);
    setExpectedGurus(0);
    setInwardData({
      fitter_id: "",
      product_id: "",
      receive_gurus: "",
      remark: "",
    });
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ================= VALIDATION =================
    if (!inwardData.packing_inward_date) {
      toast.error("Packing Inward Date is required");
      return;
    }

    if (!inwardData.fitter_id) {
      toast.error("Fitter is required");
      return;
    }

    if (!inwardData.product_id) {
      toast.error("Product is required");
      return;
    }

    if (!inwardData.receive_gurus || Number(inwardData.receive_gurus) <= 0) {
      toast.error("Receive gurus must be greater than 0");
      return;
    }

    try {
      setCreate(true);
      const payload = {
        packing_inward_date: inwardData.packing_inward_date,
        fitter_id: inwardData.fitter_id,
        product_id: inwardData.product_id,
        receive_gurus: inwardData.receive_gurus,
        amount: amount,
        rate: ratePerGurus,
        remark: inwardData.remark,
      };

      await createPackingInward(payload);

      toast.success("Packing inward created successfully");

      router.push("/packing/packing-inward");

    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong";

      toast.error(message);
    }

    setCreate(false);
  };
  return (

    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">
          Add Packing Inward
        </h1>

        <Link
          href="/packing/packing-inward"
          className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
        >
          <IoArrowBackOutline size={18} />
          Back
        </Link>
      </div>

      {/* CONTENT */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden"
      >

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

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

          {/* FITTER SEARCH */}
          <div className="relative w-full">

            <label className="block text-sm font-semibold mb-1">
              Fitter Name
            </label>

            <input
              type="text"
              placeholder="Search fitter"
              value={fitterSearch}
              disabled={!!fitterId}
              onChange={(e) => handleFitterSearch(e.target.value)}
              onKeyDown={handleFitterKeyDown}
              className={`${inputClass} pr-10
      ${fitterId ? "bg-gray-100 cursor-not-allowed" : ""}
    `}
            />

            {/* ICON */}
            <div className="absolute right-3 top-8.5 text-gray-500">

              {fitterLoading && (
                <AiOutlineLoading3Quarters className="animate-spin" />
              )}

              {!fitterLoading && fitterId && (
                <IoCloseCircleOutline
                  size={22}
                  className="cursor-pointer hover:text-red-500"
                  onClick={removeFitter}
                />
              )}

              {!fitterLoading && !fitterId && (
                <IoSearch size={18} className="text-gray-400" />
              )}

            </div>

            {/* DROPDOWN */}
            {showFitterDropdown && (
              <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">

                {fitters.length > 0 ? (
                  fitters.map((item, i) => (
                    <li
                      key={item.id}
                      onClick={() => selectFitter(item)}
                      className={`
              px-3 py-2 cursor-pointer text-sm transition-all
              ${activeFitterIndex === i
                          ? "bg-primary text-white"
                          : "hover:bg-secondary/10 text-gray-700"}
            `}
                    >
                      {item.name}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-gray-400 text-center">
                    No fitter found
                  </li>
                )}

              </ul>
            )}
          </div>

          <div className="relative w-full">
            <label className="block text-sm font-semibold mb-1">
              Product Name
            </label>

            <select
              value={inwardData.outward_id}
              disabled={!fitterId}
              onChange={(e) => {
                const selected = products.find(p => p.id === e.target.value);
                if (!selected) return;

                setInwardData((prev) => ({
                  ...prev,
                  outward_id: selected.id,
                  product_id: selected.product.id,
                }));

                // setExpectedGurus(Number(selected.exp_gurus || 0));
                const exp = selected.expectations?.[0];

                setExpectation({
                  exp_gurus: Number(exp?.exp_gurus || 0),
                  delivered_qty: Number(exp?.delivered_qty || 0),
                  pending_qty: Number(exp?.pending_qty || 0),
                });

                setExpectedGurus(Number(exp?.pending_qty || 0));

              }}
              className={`
      ${inputClass}
      appearance-none
      pr-10
      ${!fitterId ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
    `}
            >
              <option value="">
                {fitterId
                  ? noProductFound
                    ? "No product found for this fitter"
                    : "Select product"
                  : "Select fitter first"}
              </option>

              {products.map((p) => {
                const exp = p.expectations?.[0];

                return (
                  <option key={p.id} value={p.id}>
                    {p.product.product_name}
                    {" - "}
                    {p.product.color || "All Color"}
                    {" - "}
                    {exp?.exp_gurus || 0} Gross
                  </option>
                );
              })}

            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 top-5 flex items-center text-gray-500">
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

          <div>
            <label className="block text-sm font-semibold mb-1">Rate</label>
            <input
              type="number"
              value={ratePerGurus}
              disabled={!isAdmin}
              onChange={(e) => setRatePerGurus(e.target.value)}
              className={`${inputClass} ${!isAdmin ? "bg-gray-100" : ""}`}
            />


          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Amount</label>
            <input
              type="text"
              value={amount}
              disabled
              className={`${inputClass} bg-gray-100`}
            />
          </div>

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

        {/* REMARK */}
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

        {/* BUTTONS */}
        <div className="flex flex-row gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={create}
            className="flex-1 px-6 py-2 cursor-pointer rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {create ? "Creating..." : "Create"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default AddPackingInward;