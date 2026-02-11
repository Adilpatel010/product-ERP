"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { getPackingOutwardById } from "@/lib/fetcher";

const displayBoxClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 bg-gray-100 text-gray-700 font-medium cursor-not-allowed";
const labelClass = "block text-sm font-semibold mb-1 text-gray-600";

const ViewPackingOutward = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const res = await getPackingOutwardById(id);
        if (res?.success) {
          setData(res.data);
        } else {
          toast.error("Failed to load data");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-dvh bg-grey">
        <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex-1 flex items-center justify-center h-dvh bg-grey text-center">
        <div>
          <p className="text-lg text-gray-500 mb-4">Data not found</p>
          <Link
            href="/packing/packing-outward"
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
     
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">
          View Packing Outward
        </h1>
        <Link
          href="/packing/packing-outward"
          className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
        >
          <IoArrowBackOutline size={18} /> Back
        </Link>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className={labelClass}>Date</label>
            <div className={displayBoxClass}>
              {data.packing_outward_date
                ? formatDate(data.packing_outward_date)
                : formatDate(new Date())}
            </div>
          </div>

          {/* Product */}
          <div>
            <label className={labelClass}>Product</label>
            <div className={displayBoxClass}>
              {data.product?.product_name}{" "}
              {data.product?.color ? `- ${data.product.color}` : ""}
            </div>
          </div>

          {/* Fitter */}
          <div>
            <label className={labelClass}>Fitter</label>
            <div className={displayBoxClass}>
              {data.fitter?.user_name || "-"}
            </div>
          </div>

          {/* Lot Qty */}
          <div>
            <label className={labelClass}>Lot Qty</label>
            <div className={displayBoxClass}>{data.lot_qty || "0"}</div>
          </div>
        </div>

        {/* SECOND GRID: Expiry/Expected Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div>
            <label className={labelClass}>Exp Date Option</label>
            <div className={displayBoxClass}>Custom</div>{" "}
            {/* Since it's view, we show as custom or specific label */}
          </div>
          <div>
            <label className={labelClass}>Generated Exp Date</label>
            <div className={displayBoxClass}>
              {data.exp_delivery_date
                ? formatDate(data.exp_delivery_date)
                : "-"}
            </div>
          </div>
          <div>
            <label className={labelClass}>Exp Total Qty</label>
            <div className={displayBoxClass}>{data.exp_qty || "0"}</div>
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex flex-row gap-4">
          <button
            onClick={() => router.push("/packing/packing-outward")}
            className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer transition-all"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewPackingOutward;
