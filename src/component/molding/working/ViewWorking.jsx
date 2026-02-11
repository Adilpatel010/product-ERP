"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { IoArrowBackOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { getWorkingById } from "@/lib/fetcher";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 bg-gray-100 cursor-not-allowed transition-all focus:outline-none";

export default function ViewWorking() {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [machineName, setMachineName] = useState("");
  const [description, setDescription] = useState("");
  const [rows, setRows] = useState([]);

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-GB");
  };

  useEffect(() => {
    if (!id) return;

    const fetchWorking = async () => {
      try {
        setLoading(true);
        const res = await getWorkingById(id);

        if (!res?.success) {
          toast.error("Failed to load working");
          return;
        }

        const data = res.data;
        setDate(data.date.split("T")[0]);
        setMachineName(data.machine.name);
        setDescription(data.description || "");

        setRows(
          data.products.map((p) => ({
            product: p.product_name,
            color: p.color,
            qty_in_bag: p.qty_in_bag,
            qty_in_kg: p.qty_in_kg,
            electricity_unit: p.electricity_unit,
            total: p.total,
          }))
        );
      } catch {
        toast.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchWorking();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 bg-grey flex items-center justify-center">
        <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">View Working</h1>
        <Link
          href="/molding"
          className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
        >
          <IoArrowBackOutline size={18} />
          Back
        </Link>
      </div>

      {/* CONTENT */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden">

        {/* TOP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold mb-1">Machine</label>
            <input value={machineName} readOnly className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Date</label>
            <input
              type="text"
              value={formatDate(date)}
              readOnly
              className={inputClass}
            />

          </div>
        </div>

        {/* PRODUCT GRID – EXACT SAME AS ADD WORKING */}
        <div className="border-2 border-gray-300 rounded-xl mb-6 overflow-hidden p-2">

          <div className="hidden sm:grid grid-cols-[repeat(5,1fr)_auto] gap-2 text-sm font-semibold text-gray-700">
            <div className="px-2 py-2 -ml-1">Product Name</div>
            <div className="-ml-1 py-2">Qty in bag</div>
            <div className="-ml-3 py-2">Qty in kg</div>
            <div className="-ml-5 py-2">Electricity Unit</div>
            <div className="-ml-7 py-2">Total</div>
            <div />
          </div>

          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[repeat(5,1fr)_auto] gap-2 items-center border-b sm:border-0 pb-3 sm:pb-0 mb-3 sm:mb-0"
            >
              {/* PRODUCT + COLOR */}
              <div className="md:m-1">
                <label className="sm:hidden block text-xs font-semibold mb-1">
                  Product
                </label>
                <input
                  value={`${row.product} - ${row.color}`}
                  readOnly
                  className={inputClass}
                />
              </div>

              {/* QTY IN BAG */}
              <div>
                <label className="sm:hidden block text-xs font-semibold mb-1">
                  Qty In Bag
                </label>
                <input
                  value={row.qty_in_bag}
                  readOnly
                  className={`${inputClass} md:m-1`}
                />
              </div>

              {/* QTY IN KG */}
              <div>
                <label className="sm:hidden block text-xs font-semibold mb-1">
                  Qty In Kg
                </label>
                <input
                  value={row.qty_in_kg}
                  readOnly
                  className={`${inputClass} md:m-1`}
                />
              </div>

              {/* ELECTRICITY UNIT */}
              <div>
                <label className="sm:hidden block text-xs font-semibold mb-1">
                  Electricity Unit
                </label>
                <input
                  value={row.electricity_unit}
                  readOnly
                  className={`${inputClass} md:m-1 font-semibold`}
                />
              </div>

              {/* TOTAL */}
              <div>
                <label className="sm:hidden block text-xs font-semibold mb-1">
                  Total
                </label>
                <input
                  value={row.total}
                  readOnly
                  className={`${inputClass} md:m-1 font-semibold`}
                />
              </div>

              {/* EMPTY COLUMN FOR DESKTOP ALIGNMENT */}
              <div className="w-10 hidden sm:block" />
            </div>
          ))}


          {!rows.length && (
            <div className="text-center text-sm text-gray-500 py-4">
              No products found
            </div>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">Description</label>
          <textarea
            rows={4}
            value={description}
            readOnly
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* FOOTER */}
        <div className="flex">
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
}
