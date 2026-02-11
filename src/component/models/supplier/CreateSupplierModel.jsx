import { createSupplier } from "@/lib/fetcher";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

const CreateSupplierModel = ({ open, onClose, fetchSuppliers }) => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [addSupplier, setAddSupplier] = useState({
        supplier_name: "",
        contact: "",
        address: "",
    });

    /* ===== OPEN / CLOSE ANIMATION ===== */
    useEffect(() => {
        if (open) {
            setAddSupplier({
                supplier_name: "",
                contact: "",
                address: "",
            });

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddSupplier((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ===== SUBMIT ===== */
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        /* ===== VALIDATION ===== */
        if (!addSupplier.supplier_name.trim()) {
            toast.error("Supplier name is required");
            return;
        }

        if (!addSupplier.contact.trim()) {
            toast.error("Contact is required");
            return;
        }
        if (!/^\d{10}$/.test(addSupplier.contact)) {
            toast.error("Contact must be exactly 10 digits");
            return;
        }

        if (addSupplier.address && addSupplier.address.length > 255) {
            toast.error("Address must be less than 255 characters");
            return;
        }
        setLoading(true);

        const payload = {
            supplier_name: addSupplier.supplier_name.trim(),
            contact: addSupplier.contact.trim(),
            address: addSupplier.address.trim(),
        };

        try {
            await createSupplier(payload);
            handleClose();
            toast.success("Supplier added successfully!", { autoClose: 1500 });
            await fetchSuppliers();
        } catch (error) {
            const message = error?.response?.data?.message;
            toast.error(message, { autoClose: 1500 });
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
                    <h2 className="text-lg font-semibold text-white">
                        Add Supplier
                    </h2>

                    <button
                        onClick={handleClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer"
                    >
                        <IoClose size={22} className="text-white" />
                    </button>
                </div>

                {/* ===== BODY ===== */}
                <form
                    id="supplierForm"
                    onSubmit={handleSubmit}
                    className="p-4 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar"
                >
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Supplier Name
                        </label>
                        <input
                            type="text"
                            name="supplier_name"
                            value={addSupplier.supplier_name}
                            onChange={handleChange}
                            placeholder="Enter supplier name"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Contact
                        </label>
                        <input
                            type="text"
                            name="contact"
                            value={addSupplier.contact}
                            onChange={(e) => {
                                const onlyDigits = e.target.value.replace(/\D/g, ""); // 

                                if (onlyDigits.length <= 10) {
                                    setAddSupplier((prev) => ({
                                        ...prev,
                                        contact: onlyDigits,
                                    }));
                                }
                            }}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            placeholder="Enter 10 digit contact number"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm
    focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />

                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={addSupplier.address}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Enter supplier address"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                    </div>
                </form>

                {/* ===== FOOTER ===== */}
                <div className="flex w-full justify-end gap-3 px-6 py-4 border-t">
                    <button
                        onClick={handleClose}
                        type="button"
                        disabled={loading}
                        className="w-1/2 px-6 py-2 text-secondary cursor-pointer rounded-lg border-2 border-gray-300 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>

                    <button
                        form="supplierForm"
                        type="submit"
                        disabled={loading}
                        className="w-1/2 px-6 py-2 cursor-pointer rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Adding..." : "Add Supplier"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateSupplierModel;
