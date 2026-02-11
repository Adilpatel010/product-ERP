"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoCloseCircleOutline,
  IoSearch,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import {
  searchOutwardUser,
  searchProduct,
  createPackingOutward,
  getProductBomByProductId,
} from "@/lib/fetcher";
import AddPackingUser from "@/component/models/packing-user/AddPackingUser";
import { FiPlusCircle } from "react-icons/fi";
import CreateProductModel from "@/component/models/product/CreateProductModel";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all";

const AddPackingOutward = () => {
  const router = useRouter();
  const [create, setCreate] = useState(false);
  // BOM STATE
  const [productBoms, setProductBoms] = useState([]);
  const [bomLoading, setBomLoading] = useState(false);
  const [productModal, setProductModal] = useState(false);

  // Form State
  const [form, setForm] = useState({
    date: "",
    lot_qty: "",
    exp_option: "custom",
    exp_date: "",
    exp_qty: "",
  });

  const formatDDMMYYYY = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Product Search State
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productTimeout, setProductTimeout] = useState(null);
  const [productActive, setProductActive] = useState(0);
  const [productShowNotFound, setProductShowNotFound] = useState(false);
  const [packingFitterModal, setPackingFitterModal] = useState(false);
  // Fitter Search State
  const [fitterSearch, setFitterSearch] = useState("");
  const [fitters, setFitters] = useState([]);
  const [selectedFitter, setSelectedFitter] = useState(null);
  const [fitterLoading, setFitterLoading] = useState(false);
  const [fitterTimeout, setFitterTimeout] = useState(null);
  const [fitterActive, setFitterActive] = useState(0);
  const [fitterShowNotFound, setFitterShowNotFound] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }));
  }, []);

  /* ================= SEARCH LOGIC ================= */
  const getProducts = async (value) => {
    try {
      const res = await searchProduct(value);
      const data = res?.data || [];
      setProducts(data);
      setProductShowNotFound(data.length === 0);
    } catch {
      setProducts([]);
      setProductShowNotFound(true);
    } finally {
      setProductLoading(false);
    }
  };

  const getFitters = async (value) => {
    try {
      const res = await searchOutwardUser(value);
      const data = res?.data || [];
      setFitters(data);
      setFitterShowNotFound(data.length === 0);
    } catch {
      setFitters([]);
      setFitterShowNotFound(true);
    } finally {
      setFitterLoading(false);
    }
  };

  const fetchProductBom = async (product_id) => {
    try {
      setBomLoading(true);
      const res = await getProductBomByProductId(product_id);
      setProductBoms(res?.data || []);
    } catch (err) {
      setProductBoms([]);
      toast.warning("No BOM found for this product");
    } finally {
      setBomLoading(false);
    }
  };


  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      if (field === "lot_qty") {
        updated.exp_qty = calculateExpQty(
          value,
          selectedProduct?.total_gurus_lot,
        );
      }

      if (field === "exp_option") {
        if (value === "custom") {
          updated.exp_date = "";
        } else if (value) {
          const days = Number(value);
          const d = new Date();
          d.setDate(d.getDate() + days);
          updated.exp_date = d.toISOString().split("T")[0];
        }
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return toast.error("Please select a product");
    if (!selectedFitter) return toast.error("Please select a fitter");
    if (!form.lot_qty || Number(form.lot_qty) === 0)
      return toast.error("Lot quantity must be greater than 0");
    if (!form.exp_date) return toast.error("Select expected date");
    if (!form.exp_qty || Number(form.exp_qty) === 0)
      return toast.error("Expected quantity must be greater than 0");

    try {
      setCreate(true);
      const payload = {
        product_id: selectedProduct.id,
        fitter_id: selectedFitter.id,
        packing_outward_date: form.date,
        outward_lot_qty: Number(form.lot_qty),
        exp_delivery_date: form.exp_date,
        exp_gurus: Number(form.exp_qty),
      };
      const res = await createPackingOutward(payload);
      if (res?.success) {
        toast.success("Packing outward created");
        if (res?.data?.warning) {
          const warningMsg = Array.isArray(res.data.warning)
            ? res.data.warning[0]
            : res.data.warning;

          toast.warning(warningMsg, {
            autoClose: 2000,
          });
        }

        router.push("/packing/packing-outward");
      } else toast.error(res?.message);
    } catch {
      toast.error("Server error");
    } finally {
      setCreate(false);
    }
  };

  const calculateExpQty = (lotQty, gurus) => {
    const qty = parseFloat(lotQty) || 0;
    const g = parseFloat(gurus) || 0;
    const result = qty * g;
    return result > 0 ? result.toString() : "";
  };
  const handleCancel = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      lot_qty: "",
      exp_option: "custom",
      exp_date: "",
      exp_qty: "",
    });
    setSelectedProduct(null);
    setProductSearch("");
    setSelectedFitter(null);
    setFitterSearch("");
    setProducts([]);
    setFitters([]);
  };

  return (
    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">
          Add Packing Outward
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
          {/* DATE */}

          <div>
            <label className="block text-sm font-semibold mb-1">
              Date
            </label>
            <div className="relative">
              {/* REAL DATE INPUT (native picker) */}
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleFormChange("date", e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              {/* DISPLAY INPUT */}
              <input
                type="text"
                readOnly
                value={formatDDMMYYYY(form.date)}
                className={`${inputClass} pr-10`}
              />

              {/* CALENDAR ICON */}
              <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                <IoCalendarOutline size={18} />
              </div>
            </div>
          </div>

          {/* PRODUCT SEARCH */}
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold ">
                Product Name
              </label>

              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setProductModal(true)}
              >
                <FiPlusCircle className="text-secondary hover:text-primary transition-all duration-300" size={22} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Product"
                value={productSearch}
                readOnly={!!selectedProduct}
                onChange={(e) => {
                  const val = e.target.value;
                  setProductSearch(val);
                  setProductActive(0);
                  setProductShowNotFound(false);
                  if (productTimeout) clearTimeout(productTimeout);


                  if (!val.trim()) {
                    setProducts([]);
                    setProductLoading(false);
                    return;
                  }
                  setProductLoading(true);
                  setProductTimeout(setTimeout(() => getProducts(val), 500));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setProducts([]);
                  if (!products.length) return;
                  if (e.key === "ArrowDown")
                    setProductActive((p) =>
                      p < products.length - 1 ? p + 1 : p,
                    );
                  if (e.key === "ArrowUp")
                    setProductActive((p) => (p > 0 ? p - 1 : 0));
                  if (e.key === "Enter") {
                    const p = products[productActive];
                    if (p) {
                      setSelectedProduct(p);
                      setProductSearch(
                        `${p.name} - ${p.color ? `${p.color}` : "All Color"}`,
                      );
                      setProducts([]);
                      fetchProductBom(p.id);
                    }
                  }
                }}
                className={`${inputClass} ${selectedProduct ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                {productLoading && (
                  <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                )}
                {!productLoading && selectedProduct && (
                  <IoCloseCircleOutline
                    size={20}
                    className="text-gray-400 cursor-pointer hover:text-red-500"
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductSearch("");
                      setProductShowNotFound(false);
                    }}
                  />
                )}
                {!productLoading && !productSearch && (
                  <IoSearch size={18} className="text-gray-400" />
                )}
              </div>
            </div>

            {/* DROPDOWN RESULTS */}
            {!selectedProduct && productSearch && (
              <>
                {products.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {products.map((p, i) => (
                      <div
                        key={p.id}
                        onMouseEnter={() => setProductActive(i)}
                        onClick={() => {
                          setSelectedProduct(p);
                          setProductSearch(
                            `${p.name} - ${p.color ? `${p.color}` : "All Color"}`,
                          );

                          setForm((prev) => ({
                            ...prev,
                            exp_qty: calculateExpQty(
                              prev.lot_qty,
                              p.total_gurus,
                            ),
                          }));

                          setProducts([]);
                          fetchProductBom(p.id);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer transition ${i === productActive ? "bg-primary text-white" : "hover:bg-secondary/10"}`}
                      >
                        {p.name} - {p.color ? `${p.color}` : "All Color"}
                      </div>
                    ))}
                  </div>
                )}
                {productShowNotFound && !productLoading && (
                  <div className="absolute z-50 w-full mt-1 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 shadow-lg rounded-lg">
                    No product found
                  </div>
                )}
              </>
            )}
          </div>

          {/* FITTER SEARCH */}
          <div className="relative">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-semibold mb-1">Fitter</label>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => setPackingFitterModal(true)}
              >
                <FiPlusCircle className="text-secondary hover:text-primary transition-all duration-300" size={22} />
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Fitter"
                value={fitterSearch}
                readOnly={!!selectedFitter}
                /* ================= FITTER SEARCH LOGIC ================= */
                onChange={(e) => {
                  const val = e.target.value;
                  setFitterSearch(val);
                  setFitterActive(0);
                  setFitterShowNotFound(false);

                  if (fitterTimeout) clearTimeout(fitterTimeout);
                  if (!val.trim()) {
                    setFitters([]);
                    setFitterLoading(false);
                    return;
                  }
                  setFitterLoading(true);
                  setFitterTimeout(setTimeout(() => getFitters(val), 500));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setFitters([]);
                  if (!fitters.length) return;
                  if (e.key === "ArrowDown")
                    setFitterActive((p) =>
                      p < fitters.length - 1 ? p + 1 : p,
                    );
                  if (e.key === "ArrowUp")
                    setFitterActive((p) => (p > 0 ? p - 1 : 0));
                  if (e.key === "Enter") {
                    const f = fitters[fitterActive];
                    if (f) {
                      setSelectedFitter(f);
                      setFitterSearch(f.name);
                      setFitters([]);
                    }
                  }
                }}
                className={`${inputClass} ${selectedFitter ? "bg-gray-100 cursor-not-allowed" : ""}`}
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                {fitterLoading && (
                  <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                )}
                {!fitterLoading && selectedFitter && (
                  <IoCloseCircleOutline
                    size={20}
                    className="text-gray-400 cursor-pointer hover:text-red-500"
                    onClick={() => {
                      setSelectedFitter(null);
                      setFitterSearch("");
                      setFitterShowNotFound(false);
                    }}
                  />
                )}
                {!fitterLoading && !fitterSearch && (
                  <IoSearch size={18} className="text-gray-400" />
                )}
              </div>
            </div>

            {!selectedFitter && fitterSearch && (
              <>
                {fitters.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {fitters.map((f, i) => (
                      <div
                        key={f.id}
                        onMouseEnter={() => setFitterActive(i)}
                        onClick={() => {
                          setSelectedFitter(f);
                          setFitterSearch(f.name);
                          setFitters([]);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer transition ${i === fitterActive ? "bg-primary text-white" : "hover:bg-secondary/10"}`}
                      >
                        {f.name}
                      </div>
                    ))}
                  </div>
                )}
                {fitterShowNotFound && !fitterLoading && (
                  <div className="absolute z-50 w-full mt-1 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 shadow-lg rounded-lg">
                    No fitter found
                  </div>
                )}
              </>
            )}
          </div>

          {/* LOT QTY */}
          <div>
            <label className="block text-sm font-semibold mb-1">Lot Qty</label>
            <input
              type="text"
              value={form.lot_qty}
              onChange={(e) =>
                handleFormChange("lot_qty", e.target.value.replace(/\D/g, ""))
              }
              placeholder="0"
              className={inputClass}
            />
          </div>
        </div>

        {selectedProduct && (
          <div className="mt-6 mb-5 border border-gray-300 rounded-lg overflow-hidden">

            {/* CAPTION */}
            <div className="px-4 py-2 bg-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">
                Product BOM (Read Only)
              </h3>
            </div>

            {/* BODY */}
            <div className="p-4">

              {bomLoading ? (
                <div className="text-sm text-gray-500">Loading BOM...</div>
              ) : productBoms.length > 0 ? (

                <>
                  {/* HEADER ROW — ONLY ONCE */}
                  <div className="grid grid-cols-3 gap-3 mb-2 px-1">
                    <div className="text-xs font-semibold text-gray-600">
                      Raw Product
                    </div>
                    <div className="text-xs font-semibold text-gray-600">
                      Unit
                    </div>
                    <div className="text-xs font-semibold text-gray-600 ">
                      Qty
                    </div>
                  </div>

                  {/* DATA ROWS */}
                  <div className="space-y-2">
                    {productBoms.map((bom) => (
                      <div
                        key={bom.id}
                        className="grid grid-cols-3 gap-3"
                      >
                        {/* RAW PRODUCT */}
                        <input
                          type="text"
                          value={bom.raw_product.product_name}
                          readOnly
                          className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                        />

                        {/* UNIT */}
                        <input
                          type="text"
                          value={bom.raw_product.unit}
                          readOnly
                          className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                        />

                        {/* QTY */}
                        <input
                          type="text"
                          value={bom.qty}
                          readOnly
                          className={`${inputClass} bg-gray-100 cursor-not-allowed  font-semibold text-secondary`}
                        />
                      </div>
                    ))}
                  </div>
                </>

              ) : (
                <div className="text-sm text-red-500">
                  No BOM configured for this product
                </div>
              )}

            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="relative">
            <label className="block text-sm font-semibold mb-1">
              Exp Date Option
            </label>
            <select
              value={form.exp_option}
              onChange={(e) => handleFormChange("exp_option", e.target.value)}
              className={`${inputClass} appearance-none cursor-pointer`}
            >
              <option value="custom">Custom</option>
              <option value="2">After 2 Days</option>
              <option value="4">After 4 Days</option>
            </select>

            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center pt-6 text-gray-500">
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
          <div>
            <label className="block text-sm font-semibold mb-1">
              Generated Exp Date
            </label>
            <div className="relative">
              {/* REAL DATE INPUT */}
              <input
                type="date"
                value={form.exp_date}
                onChange={(e) => handleFormChange("exp_date", e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />

              <input
                type="text"
                placeholder="DD/MM/YYYY"
                readOnly
                value={formatDDMMYYYY(form.exp_date)}
                className={`${inputClass} pr-10`}
              />

              {/* CALENDAR ICON */}
              <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                <IoCalendarOutline size={18} />
              </div>
            </div>

          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Expected Total Gross
            </label>
            <input
              type="text"
              value={form.exp_qty}
              readOnly
              placeholder="0"
              className={`${inputClass} bg-gray-100 cursor-not-allowed font-medium text-secondary`}
            />
          </div>
        </div>

        <div className="flex flex-row gap-4">
          <button
            onClick={handleCancel}
            disabled={create}
            className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={create}
            className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {create ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <AddPackingUser
        open={packingFitterModal}
        onClose={() => setPackingFitterModal(false)}
      />
      {/* model */}
      <CreateProductModel
        open={productModal}
        onClose={() => setProductModal(false)}
      />

    </div>
  );
};

export default AddPackingOutward;
