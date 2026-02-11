import { getSupplierById } from "@/lib/fetcher";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

const ViewSupplierModel = ({ open, onClose, supplierId }) => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [supplier, setSupplier] = useState(null);

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-GB");
    };
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

    /* ===== Fetch Supplier By ID ===== */
    useEffect(() => {
        if (!open || !supplierId) return;

        const fetchSupplier = async () => {
            try {
                setLoading(true);
                const res = await getSupplierById(supplierId);

                if (res?.data) {
                    setSupplier(res.data);
                } else {
                    toast.error("Supplier not found");
                }
            } catch (error) {
                toast.error("Failed to fetch supplier details");
            } finally {
                setLoading(false);
            }
        };

        fetchSupplier();
    }, [open, supplierId]);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setVisible(false);
            setClosing(false);
            document.body.style.overflow = "auto";
            onClose();
        }, 500);
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
                className={`relative bg-white w-full max-w-2xl rounded-2xl shadow-xl ${closing ? "scale-out" : "scale-in"
                    }`}
            >
                {/* ===== HEADER ===== */}
                <div className="flex items-center justify-between px-6 py-3 bg-primary rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-white">
                        Supplier Details
                    </h2>

                    <button
                        onClick={handleClose}
                        className="w-9 h-9 cursor-pointer flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition"
                    >
                        <IoClose size={22} className="text-white" />
                    </button>
                </div>

                {/* ===== BODY ===== */}
                <div className="p-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex items-center justify-center h-full w-full">
                            <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
                            </div>
                        </div>
                    ) : (
                        supplier && (
                            <div className="overflow-x-auto">
                                <table className="w-full border border-gray-200 rounded-lg">
                                    <tbody className="divide-y divide-gray-200">
                                        <tr>
                                            <th className="w-35 bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                Supplier Name
                                            </th>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {supplier.supplier_name}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th className="bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                Contact
                                            </th>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {supplier.contact}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th className="bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                Address
                                            </th>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {supplier.address || "-"}
                                            </td>
                                        </tr>

                                        <tr>
                                            <th className="bg-gray-50 px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                                Created At
                                            </th>
                                            <td className="px-4 py-3 text-sm text-gray-800">
                                                {formatDate(supplier.created_at) || "-"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )
                    )}
                </div>

                {/* ===== FOOTER ===== */}
                <div className="flex justify-end px-6 py-4 border-t">
                    <button
                        onClick={handleClose}
                        className="px-6 cursor-pointer py-2 rounded-lg border-2 border-gray-300 text-secondary font-semibold hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ViewSupplierModel;
