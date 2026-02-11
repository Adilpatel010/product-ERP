import { createProduct, searchRawProduct } from "@/lib/fetcher";
import React, { useEffect, useState } from "react";
import {
    IoClose,
    IoSearch,
    IoCloseCircleOutline,
} from "react-icons/io5";
import { GoPlusCircle } from "react-icons/go";
import { AiOutlineMinusCircle, AiOutlineLoading3Quarters } from "react-icons/ai";
import { FiPlusCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import CreateRawProductModel from "../raw-product/CreateRawProductModel";

const inputClass =
    "w-full px-4 py-2 text-sm rounded-lg border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all";

const CreateProductModel = ({ open, onClose, fetchProducts }) => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rawProductModal, setRawProductModal] = useState(false);

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

    const createBomRow = () => ({
        raw_product: "",
        raw_product_id: null,
        qty: "",
        searchResults: [],
        loading: false,
        showDropdown: false,
        activeIndex: -1,
    });
    const resetForm = () => {
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

    const [bomRows, setBomRows] = useState([createBomRow()]);

    /* ===== OPEN / CLOSE ===== */
    useEffect(() => {
        if (open) {
            setVisible(true);
            setClosing(false);
            document.body.style.overflow = "hidden";
        } else if (visible) {
            setClosing(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setClosing(false);
                document.body.style.overflow = "auto";
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [open, visible]);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setVisible(false);
            setClosing(false);
            document.body.style.overflow = "auto";
            onClose();
        }, 500);
    };

    /* ===== CALCULATIONS ===== */
    useEffect(() => {
        const lotInKgRaw =
            Number(product.lotInBag) * Number(product.bagWeightKg);

        const lotInKg = lotInKgRaw
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

    /* ===== HANDLERS ===== */
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "gurusWeight" && !/^\d*$/.test(value)) return;

        setProduct((prev) => ({ ...prev, [name]: value }));

        if (name === "colorType" && value === "all") {
            setProduct((prev) => ({ ...prev, customColor: "" }));
        }
    };

    /* ===== VALIDATION (SAME AS ADD PRODUCT) ===== */
    const validateProduct = () => {
        if (!product.productName.trim()) {
            toast.error("Product name is required");
            return false;
        }

        if (
            product.colorType === "custom" &&
            !product.customColor.trim()
        ) {
            toast.error("Custom color is required");
            return false;
        }

        if (!product.pcsInGurus || Number(product.pcsInGurus) <= 0) {
            toast.error("PCS in Gurus must be greater than 0");
            return false;
        }

        if (!product.gurusWeight || Number(product.gurusWeight) <= 0) {
            toast.error("Gross weight must be greater than 0");
            return false;
        }

        if (!product.lotInBag || Number(product.lotInBag) <= 0) {
            toast.error("Lot in Bag must be greater than 0");
            return false;
        }

        if (!product.bagWeightKg || Number(product.bagWeightKg) <= 0) {
            toast.error("Bag weight must be greater than 0");
            return false;
        }

        const invalidQty = bomRows.find(
            (row) =>
                row.raw_product_id &&
                (!row.qty || Number(row.qty) <= 0)
        );

        if (invalidQty) {
            toast.error(
                "Please enter valid quantity for all selected raw products"
            );
            return false;
        }

        return true;
    };

    /* ===== BOM SEARCH ===== */
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
        const data = res?.data || [];

        setBomRows((prev) => {
            const rows = [...prev];
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

    const handleKeyDown = (e, index) => {
        const row = bomRows[index];
        if (!row.showDropdown || row.searchResults.length === 0) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setBomRows((prev) => {
                const rows = [...prev];
                rows[index].activeIndex =
                    row.activeIndex + 1 >= row.searchResults.length
                        ? 0
                        : row.activeIndex + 1;
                return rows;
            });
        }

        if (e.key === "ArrowUp") {
            e.preventDefault();
            setBomRows((prev) => {
                const rows = [...prev];
                rows[index].activeIndex =
                    row.activeIndex <= 0
                        ? row.searchResults.length - 1
                        : row.activeIndex - 1;
                return rows;
            });
        }

        if (e.key === "Enter") {
            e.preventDefault();
            const selected = row.searchResults[row.activeIndex];
            if (selected) selectProduct(index, selected);
        }
    };

    const selectProduct = (index, item) => {
        setBomRows((prev) => {
            const rows = [...prev];
            rows[index] = {
                ...rows[index],
                raw_product: item.product_name,
                raw_product_id: item.id,
                searchResults: [],
                showDropdown: false,
                activeIndex: -1,
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

    /* ===== SUBMIT ===== */
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!validateProduct()) return;

        setLoading(true);

        const cleanedBom = bomRows
            .filter(
                (row) =>
                    row.raw_product_id &&
                    row.qty &&
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
            await createProduct(payload);
            toast.success("Product created successfully");
            fetchProducts?.();
            resetForm();
            handleClose();
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            );
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div onClick={handleClose} className={`absolute inset-0 bg-black/20 backdrop-blur-sm ${closing ? "fade-out" : "fade-in"}`} />

            <div className={`relative bg-white w-full max-w-4xl rounded-2xl shadow-xl flex flex-col ${closing ? "scale-out" : "scale-in"}`}>
                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-3 bg-primary rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-white">Add Product</h2>
                    <button onClick={handleClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer">
                        <IoClose size={22} className="text-white" />
                    </button>
                </div>

                {/* BODY */}
                <form id="productForm" onSubmit={handleSubmit} className="p-6 space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-12 gap-4">
                        {/* Product Name */}
                        <div className={`col-span-12 ${product.colorType === "custom" ? "md:col-span-4" : "md:col-span-6"}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                            <input type="text"
                                name="productName"
                                value={product.productName}
                                onChange={handleChange}
                                placeholder="Enter name"
                                className={inputClass}
                            />
                        </div>

                        {/* Color Selection */}
                        <div className={`col-span-12 relative ${product.colorType === "custom" ? "md:col-span-4" : "md:col-span-6"}`}>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Color</label>
                            <select name="colorType"
                                value={product.colorType}
                                onChange={handleChange}
                                className={`${inputClass} appearance-none pr-10 cursor-pointer`}>
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
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Color</label>
                                <input type="text"
                                    name="customColor"
                                    value={product.customColor}
                                    onChange={handleChange}
                                    placeholder="Color"
                                    className={inputClass} />
                            </div>
                        )}

                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">PCS in Gurus</label>
                            <input type="number"
                                name="pcsInGurus"
                                value={product.pcsInGurus}
                                placeholder="PCS in Gurus"
                                onChange={handleChange}
                                className={inputClass} />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Gross Weight (gm)</label>
                            <input type="text"
                                name="gurusWeight"
                                value={product.gurusWeight}
                                placeholder="e.g. 500"
                                onChange={handleChange}
                                className={inputClass} />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lot in Bag</label>
                            <input type="number"
                                name="lotInBag"
                                value={product.lotInBag}
                                placeholder="Lot in Bag"
                                onChange={handleChange}
                                className={inputClass} />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Bag Weight (kg)</label>
                            <input type="number"
                                name="bagWeightKg"
                                value={product.bagWeightKg}
                                placeholder="Bag Weight (kg)"
                                onChange={handleChange}
                                className={inputClass} />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Lot in KG</label>
                            <input type="text"
                                value={product.lotInKg}
                                disabled className={`${inputClass} bg-gray-100 font-bold`}
                            />
                        </div>

                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Total Gross in Lot</label>
                            <input type="text"
                                value={product.totalGurusLot}
                                disabled className={`${inputClass} bg-gray-100 font-bold`}
                            />
                        </div>
                    </div>

                    {/* BOM SECTION */}
                    <div className="mt-6 border-2 border-gray-100 rounded-xl p-4 bg-gray-50/50">
                        <h3 className="text-md font-bold text-gray-700">Bill of Materials (BOM)</h3>
                        <div className="space-y-3">
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
                </form>

                {/* FOOTER */}
                <div className="flex w-full justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-2xl">
                    <button onClick={handleClose}
                     type="button" 
                     disabled={loading}
                      className="w-1/2 px-6 py-2.5 cursor-pointer text-secondary border-2 border-gray-300 rounded-lg text-sm font-semibold hover:bg-white transition-all">
                        Cancel
                    </button>
                    <button form="productForm" 
                    type="submit" 
                    disabled={loading}
                     className="w-1/2 px-6 py-2.5 cursor-pointer bg-secondary text-white rounded-lg font-semibold hover:bg-primary transition-all disabled:opacity-60">
                        {loading ? "Creating..." : "Create"}
                    </button>
                </div>
            </div>
            <CreateRawProductModel open={rawProductModal} onClose={() => setRawProductModal(false)} />
        </div>
    );
};

export default CreateProductModel;