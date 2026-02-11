"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoCloseCircleOutline,
  IoSearch,
} from "react-icons/io5";
import { GoPlusCircle } from "react-icons/go";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { createRawOutward, searchRawProduct } from "@/lib/fetcher";
import { toast } from "react-toastify";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useRouter } from "next/router";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

const AddRawOutward = () => {
  const [date, setDate] = useState("");
  const [create, setCreate] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [remark, setRemark] = useState("");
  const router = useRouter();

  const createRow = () => ({
    product: "",
    product_id: null,
    qty: "",
    unit: "",
    rate: "",
    total: 0,
    locked: false,

    searchLoading: false,
    searchTimeout: null,
    results: [],
    activeIndex: 0,
    dropdownPos: null,
  });

  const [rows, setRows] = useState([createRow()]);
  const isRowComplete = (row) => {
    return (
      row.product_id && Number(row.qty) > 0 && Number(row.rate) > 0 && row.unit
    );
  };

  // search product
  const getProductByName = async (value, rowIndex) => {
    try {
      const res = await searchRawProduct(value);

      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex].results = res?.data || [];
        updated[rowIndex].searchLoading = false;
        return updated;
      });
    } catch {
      setRows((prev) => {
        const updated = [...prev];
        updated[rowIndex].searchLoading = false;
        return updated;
      });
    }
  };

  // ================= PRODUCT SEARCH FUNCTIONS =================

  const handleProductFocus = (e, index) => {
    const r = e.target.getBoundingClientRect();
    setRows((prev) => {
      const u = [...prev];
      u[index].dropdownPos = {
        top: r.bottom + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
      };
      return u;
    });
  };

  const handleProductSearch = (value, index) => {
    if (rows[index].locked) return;

    setRows((prev) => {
      const u = [...prev];
      u[index].product = value;
      u[index].activeIndex = 0;
      u[index].searchLoading = true;
      return u;
    });

    if (rows[index].searchTimeout) clearTimeout(rows[index].searchTimeout);

    if (!value) {
      setRows((prev) => {
        const u = [...prev];
        u[index].results = [];
        u[index].searchLoading = false;
        return u;
      });
      return;
    }

    const timeout = setTimeout(() => {
      getProductByName(value, index);
    }, 500);

    setRows((prev) => {
      const u = [...prev];
      u[index].searchTimeout = timeout;
      return u;
    });
  };

  const selectProduct = (p, index) => {
    if (!p) return;
    setRows((prev) => {
      const u = [...prev];
      u[index] = {
        ...u[index],
        product: p.product_name,
        product_id: p.id,
        rate: p.rate,
        unit: p.unit,
        total: (Number(u[index].qty) || 0) * p.rate,
        locked: true,
        results: [],
      };
      return u;
    });
  };

  const handleProductKeyDown = (e, index) => {
    const row = rows[index];
    if (!row.results.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setRows((p) => {
        const u = [...p];
        u[index].activeIndex = Math.min(
          u[index].activeIndex + 1,
          u[index].results.length - 1,
        );
        return u;
      });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setRows((p) => {
        const u = [...p];
        u[index].activeIndex = Math.max(u[index].activeIndex - 1, 0);
        return u;
      });
    }

    if (e.key === "Enter") {
      e.preventDefault();
      selectProduct(row.results[row.activeIndex], index);
    }

    if (e.key === "Escape") {
      setRows((prev) => {
        const u = [...prev];
        u[index].results = [];
        return u;
      });
    }
  };

  const removeProductSelection = (index) => {
    setRows((prev) => {
      const u = [...prev];
      u[index] = createRow();
      return u;
    });
  };

  const handleCancel = () => {
    const today = new Date().toISOString().split("T")[0];

    setDate(today);
    setActiveIndex(0);
    setRemark("");
    setRows([createRow()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (create) return;

    const emptyQtyRow = rows.find((r) => {
      if (!r.product_id) return false;
      return r.qty === "" || r.qty === null || r.qty === undefined;
    });

    if (emptyQtyRow) {
      toast.error("Please enter quantity");
      return;
    }

    const zeroQtyRow = rows.find((r) => {
      if (!r.product_id) return false;
      const qty = parseFloat(r.qty);
      return isNaN(qty) || qty <= 0;
    });

    if (zeroQtyRow) {
      toast.error("Quantity must be greater than 0");
      return;
    }
    const emptyRateRow = rows.find((r) => {
      if (!r.product_id) return false;
      return r.rate === "" || r.rate === null || r.rate === undefined;
    });

    if (emptyRateRow) {
      toast.error("Please enter rate");
      return;
    }
    const zeroRateRow = rows.find((r) => {
      if (!r.product_id) return false;
      const rate = parseFloat(r.rate);
      return isNaN(rate) || rate <= 0;
    });

    if (zeroRateRow) {
      toast.error("Rate must be greater than 0");
      return;
    }
    const products = rows
      .filter((r) => r.product_id && Number(r.qty) > 0 && Number(r.rate) > 0)
      .map((r) => ({
        product_id: r.product_id,
        qty: Number(r.qty),
        unit: r.unit.toLowerCase(),
        rate: Number(r.rate),
      }));

    if (!products.length) {
      toast.error("Please add at least one valid product");
      return;
    }

    const payload = {
      outward_date: date,
      remark,
      products,
    };

    try {
      setCreate(true);

      const res = await createRawOutward(payload);

      if (res?.success) {
        toast.success("Raw outward created successfully");

        setTimeout(() => {
          router.push("/raw-material/raw-outward");
        }, 300);
      } else {
        toast.error(res?.message || "Failed to create raw outward");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setCreate(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  const handleChange = (index, field, value) => {
    setRows((prev) => {
      const updated = [...prev];

      if (field === "qty" || field === "rate") {
        value = value.replace(/[^0-9.]/g, "");
        const parts = value.split(".");
        if (parts.length > 2) return prev;
      }

      updated[index][field] = value;

      const qty = Number(updated[index].qty) || 0;
      const rate = Number(updated[index].rate) || 0;
      updated[index].total = parseFloat((qty * rate).toFixed(2));

      const lastIndex = updated.length - 1;
      const lastRow = updated[lastIndex];

      if (
        isRowComplete(lastRow) &&
        !updated.some((r, i) => i > lastIndex && isBlankRow(r))
      ) {
        updated.push(createRow());
      }

      return updated;
    });
  };

  const addRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const removeRow = (index) => {
    setRows(rows.filter((_, i) => i !== index));
  };

  return (
    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Add Raw Outward</h1>
        <Link
          href="/raw-material/raw-outward"
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
          {/* DATE */}
          <div>
            <label className="block text-sm font-semibold mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {/* PRODUCT GRID */}
        <div className="border-2 border-gray-300 rounded-xl mb-6 p-2">
          {/* HEADER (Desktop only) */}
          <div className="hidden sm:grid grid-cols-[repeat(5,1fr)_auto] gap-2 text-sm font-semibold text-gray-700">
            <div className="px-2 py-2 -ml-1">Product Name</div>
            <div className="py-2 -ml-1">Qty</div>
            <div className="-ml-2 py-2">Unit</div>
            <div className="-ml-4 py-2">Rate</div>
            <div className="-ml-6 py-2">Total</div>
            <div />
          </div>

          {rows.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-[repeat(5,1fr)_auto] gap-2 items-center border-b sm:border-0 pb-3 sm:pb-0 mb-3 sm:mb-0"
            >
              {/* PRODUCT SEARCH */}
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search product name"
                  value={row.product}
                  readOnly={row.locked}
                  onFocus={(e) => handleProductFocus(e, index)}
                  onChange={(e) => handleProductSearch(e.target.value, index)}
                  onKeyDown={(e) => handleProductKeyDown(e, index)}
                  className={`${inputClass} pr-10 ${row.locked ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                />

                {/* ICONS - Matches Fitter Design */}
                <div className="absolute right-3 top-2.5 text-gray-500">
                  {row.searchLoading && !row.locked && (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  )}

                  {!row.searchLoading && row.locked && (
                    <IoCloseCircleOutline
                      size={22}
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => removeProductSelection(index)}
                    />
                  )}

                  {!row.searchLoading && !row.locked && !row.product && (
                    <IoSearch size={18} className="text-gray-400" />
                  )}
                </div>

                {/* DROPDOWN - Styled like Fitter Dropdown */}
                {!row.locked &&
                  row.dropdownPos &&
                  (row.results.length > 0 ||
                    (row.product && !row.searchLoading)) && (
                    <ul
                      className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto"
                    >
                      {row.results.length > 0 ? (
                        row.results.map((p, i) => (
                          <li
                            key={p.id}
                            onMouseEnter={() => {
                              setRows((prev) => {
                                const u = [...prev];
                                u[index].activeIndex = i;
                                return u;
                              });
                            }}
                            onClick={() => selectProduct(p, index)}
                            className={`px-3 py-2 cursor-pointer text-sm transition-all ${i === row.activeIndex
                                ? "bg-primary text-white"
                                : "hover:bg-secondary/10 text-gray-700"
                              }`}
                          >
                            {p.product_name}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center">
                          No product found
                        </li>
                      )}
                    </ul>
                  )}
              </div>

              <input
                value={row.qty}
                onChange={(e) => handleChange(index, "qty", e.target.value)}
                placeholder="Qty"
                className={`${inputClass} m-1`}
              />

              <div className="relative w-full m-1">
                <input
                  value={row.unit}
                  readOnly
                  onChange={(e) => handleChange(index, "unit", e.target.value)}
                  className={`${inputClass} m-1 bg-gray-100 font-semibold`}
                ></input>
              </div>

              <input
                value={row.rate}
                onChange={(e) => handleChange(index, "rate", e.target.value)}
                placeholder="Rate"
                className={`${inputClass} m-1`}
              />

              <input
                readOnly
                value={row.total}
                className={`${inputClass} m-1 bg-gray-100 font-semibold`}
              />

              <div className="flex justify-end sm:justify-center mt-2 sm:mt-0">
                {index === 0 ? (
                  <button
                    type="button"
                    onClick={addRow}
                    className="bg-secondary text-white px-3 py-3 rounded-md hover:bg-primary cursor-pointer"
                  >
                    <GoPlusCircle size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="bg-red-500 text-white px-3 py-3 rounded-md hover:bg-red-700 cursor-pointer"
                  >
                    <AiOutlineMinusCircle size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* REMARK */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1">Remark</label>
          <textarea
            rows={4}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className={inputClass}
            placeholder="Remark"
          />
        </div>

        {/* BUTTONS */}
        <div className="flex flex-row gap-4">
          <button
            onClick={handleCancel}
            disabled={create}
            className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            type="submit"
            disabled={create}
            className="flex-1 px-6 py-2 rounded-lg bg-secondary text-white font-semibold
             hover:bg-primary cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {create ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRawOutward;
