import { updateRawProduct } from "@/lib/fetcher";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";
const EditRawProductModel = ({
  open,
  onClose,
  fetchRawProducts,
  editRawProductData,
}) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [editRawProduct, setEditRawProduct] = useState({
    product_name: "",
    sku: "",
    unit: "",
    current_stock: "",
    opening_stock: "",
    rate: "",
    description: "",
  });

  /* ===== Handle open / close animation ===== */
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

  /* ===== Auto Fill Edit Data ===== */
  useEffect(() => {
    if (open && editRawProductData) {
      setEditRawProduct({
        product_name: editRawProductData.product_name ?? "",
        sku: editRawProductData.sku ?? "",
        unit: editRawProductData.unit ?? "",
        current_stock: editRawProductData.current_stock ?? "",
        opening_stock: editRawProductData.opening_stock ?? "",
        rate: editRawProductData.rate ?? "",
        description: editRawProductData.description ?? "",
      });
    }
  }, [open, editRawProductData]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      document.body.style.overflow = "auto";
      onClose();
    }, 500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditRawProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const openingStockRaw = editRawProduct.opening_stock;
    const rateRaw = editRawProduct.rate;

    const openingStock = Number(openingStockRaw);
    const rate = Number(rateRaw);

    /* ================= REQUIRED ================= */
    if (!editRawProduct.product_name || !editRawProduct.sku) {
      toast.error("Please fill all required fields");
      return;
    }

    /* ================= OPENING STOCK ================= */
    if (openingStockRaw === "" || openingStockRaw === null) {
      toast.error("Opening stock is required");
      return;
    }

    if (isNaN(openingStock) || openingStock <= 0) {
      toast.error("Opening stock must be greater than 0");
      return;
    }

    /* ================= RATE ================= */
    if (rateRaw === "" || rateRaw === null) {
      toast.error("Rate is required");
      return;
    }

    if (isNaN(rate) || rate <= 0) {
      toast.error("Rate must be greater than 0");
      return;
    }

    setLoading(true);

    const payload = {
      product_name: editRawProduct.product_name,
      sku: editRawProduct.sku,
      unit: editRawProduct.unit,
      current_stock: editRawProduct.current_stock,
      opening_stock: openingStock,
      rate: rate,
      description: editRawProduct.description,
    };

    try {
      await updateRawProduct(editRawProductData.id, payload);
      handleClose();

      toast.success("Raw product updated successfully!", {
        autoClose: 1500,
      });

      await fetchRawProducts();
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      if (status === 404) {
        toast.error("Product not found.");
      } else if (status >= 500) {
        toast.error("Internal Server Error. Try again later.");
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("Update failed. Please check your network.");
      }

      console.error("Edit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ===== BACKDROP ===== */}
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/20 backdrop-blur-sm ${closing ? "fade-out" : "fade-in"
          }`}
      />

      {/* ===== MODAL ===== */}
      <div
        className={`relative bg-white w-full max-w-lg rounded-2xl shadow-xl ${closing ? "scale-out" : "scale-in"
          }`}
      >
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-primary rounded-t-2xl">
          <h2 className="text-lg font-semibold text-white">Edit Raw Product</h2>

          <button
            onClick={handleClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <IoClose size={22} className="text-white" />
          </button>
        </div>

        {/* ===== BODY ===== */}
        <form
          id="editRawProductForm"
          onSubmit={handleSubmit}
          className="p-4 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar"
        >
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              name="product_name"
              placeholder="Enter product name"
              value={editRawProduct.product_name}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 ease-in-out"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={editRawProduct.sku}
                onChange={handleChange}
                placeholder="SKU"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary"
              />
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Unit
              </label>
              <select
                name="unit"
                value={editRawProduct.unit}
                onChange={handleChange}
                className={`${inputClass} appearance-none pr-10 cursor-pointer `}
              >
                <option value="kg">KG</option>
                <option value="pcs">PCS</option>
                <option value="ton">TON</option>
              </select>
              <div className="pointer-events-none absolute top-9 right-3 flex items-center text-gray-500">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Opening Stock
              </label>
              <input
                type="number"
                name="opening_stock"
                value={editRawProduct.opening_stock}
                onChange={handleChange}
                placeholder="Opening"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Current Stock
              </label>
              <input
                type="number"
                name="current_stock"
                value={editRawProduct.current_stock}
                onChange={handleChange}
                placeholder="Current"
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Rate
            </label>
            <input
              type="number"
              name="rate"
              value={editRawProduct.rate}
              onChange={handleChange}
              placeholder="Enter rate"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 ease-in-out"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              rows={4}
              value={editRawProduct.description}
              placeholder="Optional description"
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 ease-in-out"
            />
          </div>
        </form>

        {/* ===== FOOTER ===== */}
        <div className="flex w-full justify-end gap-3 px-6 py-4 border-t">
          <button
            onClick={handleClose}
            type="button"
            disabled={loading}
            className="px-6 py-2 w-1/2 cursor-pointer rounded-lg border-2 border-gray-300 text-secondary font-semibold hover:bg-gray-50   disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            form="editRawProductForm"
            type="submit"
            disabled={loading}
            className="w-1/2 px-6 py-2 cursor-pointer rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-60
    disabled:cursor-not-allowed"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRawProductModel;
