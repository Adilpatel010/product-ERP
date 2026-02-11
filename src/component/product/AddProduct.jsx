"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoArrowBackOutline } from "react-icons/io5";
import { createProduct, searchRawProduct } from "@/lib/fetcher";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { GoPlusCircle } from "react-icons/go";
import { AiOutlineMinusCircle } from "react-icons/ai";
import { IoCloseCircleOutline, IoSearch } from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiPlusCircle } from "react-icons/fi";
import CreateRawProductModel from "../models/raw-product/CreateRawProductModel";


const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

const AddProduct = () => {
  const [create, setCreate] = useState(false);
  const router = useRouter();
  const [product, setProduct] = useState({
    productName: "",
    colorType: "all",
    customColor: "",
    gurusWeight: "",
    pcsInGurus: "",
    lotInBag: "",
    bagWeightKg: "",
    lotInKg: "",
    totalGurusLot: "",
  });
  const [rawProductModal, setRawProductModal] = useState(false);
  const createBomRow = () => ({
    raw_product: "",
    raw_product_id: null,
    qty: "",

    searchResults: [],
    loading: false,
    showDropdown: false,
    activeIndex: -1,
  });

  const [bomRows, setBomRows] = useState([createBomRow()]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "gurusWeight" && !/^\d*$/.test(value)) return;

    setProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "colorType" && value === "all") {
      setProduct(prev => ({
        ...prev,
        colorType: value,
        customColor: "",
      }));
      return;
    }
  };

  const validateProduct = () => {
    // Product Name
    if (!product.productName || !product.productName.trim()) {
      toast.error("Product name is required");
      return false;
    }

    // Color validation
    if (product.colorType === "custom") {
      if (!product.customColor || !product.customColor.trim()) {
        toast.error("Custom color is required");
        return false;
      }
    }

    if (
      product.pcsInGurus === "" ||
      product.pcsInGurus === null ||
      product.pcsInGurus === undefined
    ) {
      toast.error("PCS in Gurus is required");
      return false;
    }

    if (Number(product.pcsInGurus) <= 0) {
      toast.error("PCS in Gurus must be greater than 0");
      return false;
    }

    // Gurus Weight (REQUIRED + > 0)
    if (
      product.gurusWeight === "" ||
      product.gurusWeight === null ||
      product.gurusWeight === undefined
    ) {
      toast.error("Gurus weight is required");
      return false;
    }

    if (Number(product.gurusWeight) <= 0) {
      toast.error("Gurus weight must be greater than 0");
      return false;
    }

    // Lot in Bag (can be 0 but not empty)
    if (
      product.lotInBag === "" ||
      product.lotInBag === null ||
      product.lotInBag === undefined
    ) {
      toast.error("Lot in Bag is required");
      return false;
    }

    if (Number(product.lotInBag) <= 0) {
      toast.error("Lot in Bag must be greater than 0");
      return false;
    }

    if (
      product.bagWeightKg === "" ||
      product.bagWeightKg === null ||
      product.bagWeightKg === undefined
    ) {
      toast.error("Bag weight is required");
      return false;
    }

    if (Number(product.bagWeightKg) <= 0) {
      toast.error("Bag weight must be greater than 0");
      return false;
    }

    return true;
  };

  const handleSearch = async (value, index) => {
    if (!value.trim()) {
      setBomRows((prev) => {
        const rows = [...prev];
        rows[index] = {
          ...rows[index],
          raw_product: value,
          searchResults: [],
          showDropdown: false,
          loading: false,
          activeIndex: -1,
        };
        return rows;
      });
      return;
    }

    setBomRows((prev) => {
      const rows = [...prev];
      rows[index] = {
        ...rows[index],
        raw_product: value,
        loading: true,
        showDropdown: true,
        activeIndex: -1,
      };
      return rows;
    });

    const res = await searchRawProduct(value);

    setBomRows((prev) => {
      const rows = [...prev];
      const data = res?.data || [];

      rows[index] = {
        ...rows[index],
        searchResults: data,
        loading: false,
        showDropdown: true,
        activeIndex: data.length > 0 ? 0 : -1,
      };
      return rows;
    });
  };

  const selectProduct = (index, product) => {
    setBomRows((prev) => {
      const rows = [...prev];

      rows[index] = {
        ...rows[index],
        raw_product: product.product_name,
        raw_product_id: product.id,
        showDropdown: false,
      };

      return rows;
    });
  };

  const removeProduct = (index) => {
    setBomRows((prev) => {
      const rows = [...prev];
      rows[index] = createBomRow();
      return rows;
    });
  };

  const handleKeyDown = (e, index) => {
    const row = bomRows[index];

    if (!row.showDropdown || row.searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();

      setBomRows((prev) => {
        const rows = [...prev];

        const nextIndex =
          row.activeIndex + 1 >= row.searchResults.length
            ? 0
            : row.activeIndex + 1;

        rows[index] = {
          ...rows[index],
          activeIndex: nextIndex,
        };

        return rows;
      });
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();

      setBomRows((prev) => {
        const rows = [...prev];

        const prevIndex =
          row.activeIndex <= 0
            ? row.searchResults.length - 1
            : row.activeIndex - 1;

        rows[index] = {
          ...rows[index],
          activeIndex: prevIndex,
        };

        return rows;
      });
    }

    if (e.key === "Enter") {
      e.preventDefault();

      const selected =
        row.searchResults[row.activeIndex >= 0 ? row.activeIndex : 0];

      if (selected) {
        selectProduct(index, selected);
      }
    }
  };

  const handleCancel = () => {
    setProduct({
      productName: "",
      colorType: "all",
      customColor: "",
      gurusWeight: "",
      pcsInGurus: "",
      lotInBag: "",
      bagWeightKg: "",
      lotInKg: "",
      totalGurusLot: "",
    });
    setBomRows([createBomRow()]);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (create) return;
    if (!validateProduct()) return;

    const invalidQty = bomRows.find(
      (row) =>
        row.raw_product_id &&
        (!row.qty || Number(row.qty) <= 0)
    );

    if (invalidQty) {
      toast.error("Please enter valid quantity for all selected raw products");
      return;
    }

    const cleanedBom = bomRows
      .filter(
        (row) =>
          row.raw_product_id &&
          row.qty !== "" &&
          Number(row.qty) > 0
      )
      .map((row) => ({
        raw_product_id: row.raw_product_id,
        qty: Number(row.qty),
      }));

    const payload = {
      product_name: product.productName,
      color_type: product.colorType,
      color:
        product.colorType === "custom"
          ? product.customColor
          : null,

      pcs_in_gurus: Number(product.pcsInGurus),
      gurus_weight_gm: Number(product.gurusWeight),
      lot_in_bag: Number(product.lotInBag),
      bag_weight_kg: Number(product.bagWeightKg),
      lot_in_kg: Number(product.lotInKg),
      total_gurus_lot: Number(product.totalGurusLot),
      bom: cleanedBom,
    };

    try {
      setCreate(true);
      await createProduct(payload);

      toast.success("Product created successfully ");
      setTimeout(() => {
        router.push("/product");
      }, 300);

      setProduct({
        productName: "",
        colorType: "all",
        customColor: "",
        gurusWeight: "",
        pcsInGurus: "",
        lotInBag: "",
        bagWeightKg: "",
        lotInKg: "",
        totalGurusLot: "",
      });

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
    }

    setCreate(false);
  };

  useEffect(() => {
    const lotInKgRaw =
      Number(product.lotInBag) * Number(product.bagWeightKg);

    const lotInKg =
      lotInKgRaw
        ? Number(lotInKgRaw.toFixed(2))
        : "";

    const totalGurus =
      product.gurusWeight && lotInKg
        ? Math.floor((lotInKg * 1000) / Number(product.gurusWeight))
        : "";

    setProduct((prev) => ({
      ...prev,
      lotInKg,
      totalGurusLot: totalGurus,
    }));
  }, [product.lotInBag, product.bagWeightKg, product.gurusWeight]);

  return (
    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">
          Add Product
        </h1>
        <Link
          href="/product"
          className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
        >
          <IoArrowBackOutline size={18} />
          Back
        </Link>
      </div>

      {/* CONTENT */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden">

        <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-4 mb-6">
          {/* Product Name */}
          <div
            className={`col-span-12 ${product.colorType === "custom"
              ? "md:col-span-4"
              : "md:col-span-6"
              }`}
          >
            <label className="text-sm font-medium mb-1 block">
              Product Name
            </label>
            <input
              type="text"
              name="productName"
              value={product.productName}
              placeholder="Product Name"
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div
            className={`col-span-12 relative ${product.colorType === "custom"
              ? "md:col-span-4"
              : "md:col-span-6"
              }`}
          >
            <label className="text-sm font-medium mb-1 block">
              Color
            </label>

            <select
              name="colorType"
              value={product.colorType}
              onChange={handleChange}
              className={`${inputClass} pr-10 cursor-pointer appearance-none`}
            >
              <option value="all">All Color</option>
              <option value="custom">Custom</option>
            </select>

            <div className="pointer-events-none absolute top-[36px] right-3 flex items-center text-gray-500">
              <svg
                className="h-4 w-4"
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

          {product.colorType === "custom" && (
            <div className="col-span-12 md:col-span-4">
              <label className="text-sm font-medium mb-1 block">
                Custom Color
              </label>
              <input
                type="text"
                name="customColor"
                placeholder="Custom Color"
                value={product.customColor}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          )}

          {/* PCS in Gurus */}
          <div className="col-span-12 md:col-span-4">
            <label className="text-sm font-medium mb-1 block">
              PCS in Gurus
            </label>
            <input
              type="number"
              name="pcsInGurus"
              placeholder="PCS in Gurus"
              value={product.pcsInGurus}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Gurus Weight */}
          <div className="col-span-12 md:col-span-4">
            <label className="text-sm font-medium mb-1 block">
              Gross Weight (gm)
            </label>
            <input
              type="text"
              name="gurusWeight"
              value={product.gurusWeight}
              onChange={handleChange}
              placeholder="e.g. 500"
              className={inputClass}
            />
          </div>

          {/* Lot in Bag */}
          <div className="col-span-12 md:col-span-4">
            <label className="text-sm font-medium mb-1 block">
              Lot in Bag
            </label>
            <input
              type="number"
              name="lotInBag"
              placeholder="Lot in Bag"
              value={product.lotInBag}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Bag Weight */}
          <div className="col-span-12 md:col-span-4">
            <label className="text-sm font-medium mb-1 block">
              Bag Weight (kg)
            </label>
            <input
              type="number"
              name="bagWeightKg"
              placeholder="Bag Weight (kg)"
              value={product.bagWeightKg}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="text-sm font-medium mb-1 block">
              Lot in KG
            </label>
            <input
              type="text"
              value={product.lotInKg}
              disabled
              className={`${inputClass} bg-gray-100`}
            />
          </div>

          <div className="col-span-12 md:col-span-4">
            <label className="text-sm font-medium mb-1 block">
              Total Gross in Lot
            </label>
            <input
              type="text"
              value={product.totalGurusLot}
              disabled
              className={`${inputClass} bg-gray-100`}
            />
          </div>

          {/* ================= BOM SECTION ================= */}
          <div className="col-span-12 mt-6 border-2 border-gray-200 rounded-xl p-4">
            <h2 className="text-md font-semibold mb-3 text-gray-700">
              Bill of Materials (BOM)
            </h2>

            {/* DESKTOP HEADER */}
            <div className="hidden md:grid grid-cols-12 gap-3 items-center mb-1">
              <div className="col-span-6">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-semibold text-gray-700">
                    Raw Product
                  </label>
                  <button
                    type="button"
                    onClick={() => setRawProductModal(true)}
                  >
                    <FiPlusCircle
                      size={22}
                      className="text-secondary cursor-pointer hover:text-primary"
                    />
                  </button>
                </div>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Qty Required in Gross
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {bomRows.map((row, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-start"
                >
                  {/* RAW PRODUCT */}
                  <div className="col-span-12 md:col-span-6 relative">
                    {/* MOBILE LABEL */}
                    <div className="md:hidden flex justify-between items-center mb-1">
                      <label className="text-sm font-semibold text-gray-700">
                        Raw Product
                      </label>
                      <button
                        type="button"
                        onClick={() => setRawProductModal(true)}
                      >
                        <FiPlusCircle
                          size={22}
                          className="text-secondary hover:text-primary"
                        />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Search product"
                      value={row.raw_product}
                      disabled={!!row.raw_product_id}
                      onChange={(e) => handleSearch(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`${inputClass} pr-10 ${row.raw_product_id ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                    />

                    {/* ICON */}
                    <div className="absolute right-3 top-9 md:top-2.5 text-gray-500">
                      {row.loading && (
                        <AiOutlineLoading3Quarters className="animate-spin" />
                      )}

                      {!row.loading && row.raw_product_id && (
                        <IoCloseCircleOutline
                          size={22}
                          className="cursor-pointer hover:text-red-500"
                          onClick={() => removeProduct(index)}
                        />
                      )}

                      {!row.loading && !row.raw_product_id && (
                        <IoSearch size={18} className="text-gray-400" />
                      )}
                    </div>

                    {/* DROPDOWN */}
                    {row.showDropdown && (
                      <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                        {row.searchResults.length ? (
                          row.searchResults.map((item, i) => (
                            <li
                              key={item.id}
                              onClick={() => selectProduct(index, item)}
                              className={`px-3 py-2 cursor-pointer text-sm
                      ${row.activeIndex === i
                                  ? "bg-primary text-white"
                                  : "hover:bg-secondary/10 text-gray-700"
                                }`}
                            >
                              {item.product_name}
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

                  {/* QTY */}
                  <div className="col-span-12 md:col-span-3">
                    <label className="block md:hidden text-sm font-semibold text-gray-700 mb-1">
                      Qty Required in Gross
                    </label>

                    <input
                      type="number"
                      placeholder="Qty"
                      value={row.qty}
                      onChange={(e) => {
                        const value = e.target.value;
                        setBomRows((prev) => {
                          const rows = [...prev];
                          rows[index].qty = value;

                          if (
                            index === rows.length - 1 &&
                            rows[index].raw_product_id &&
                            Number(value) > 0
                          ) {
                            rows.push(createBomRow());
                          }
                          return rows;
                        });
                      }}
                      className={inputClass}
                    />
                  </div>

                  {/* ACTION */}
                  <div className="col-span-6 md:col-span-3">
                    {index === 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setBomRows((prev) => [...prev, createBomRow()])
                        }
                        className="w-10 h-10 rounded-md cursor-pointer bg-secondary text-white flex items-center justify-center hover:bg-primary" title="Add row" > <GoPlusCircle size={18} />

                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setBomRows((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className="w-10 h-10 rounded-md cursor-pointer bg-red-500 text-white flex items-center justify-center hover:bg-red-600" title="Remove row" > <AiOutlineMinusCircle size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>


          <div className="col-span-12 flex flex-row gap-4 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 text-secondary border-2 border-gray-300 py-2 cursor-pointer rounded-lg font-semibold hover:bg-gray-50 "
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
      <CreateRawProductModel
        open={rawProductModal}
        onClose={() => setRawProductModal(false)}
      />
    </div>
  );
};

export default AddProduct;
