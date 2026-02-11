import { updatePackingUser } from "@/lib/fetcher";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

const EditPackingUser = ({
    open,
    onClose,
    editPackingUserData,
    fetchPackingUsers,
}) => {
    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [editUser, setEditUser] = useState({
        user_name: "",
    });

    /* ===== OPEN / CLOSE ANIMATION ===== */
    useEffect(() => {
        if (open && editPackingUserData) {
            setEditUser({
                user_name: editPackingUserData.user_name || "",
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
    }, [open, editPackingUserData]);

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
        setEditUser((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    /* ===== SUBMIT UPDATE ===== */
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!editUser.user_name.trim()) {
            toast.error("User name is required");
            return;
        }

        setLoading(true);

        try {
            await updatePackingUser(editPackingUserData.id, {
                user_name: editUser.user_name.trim(),
            });

            toast.success("Packing user updated successfully!", {
                autoClose: 1500,
            });

            handleClose();
            await fetchPackingUsers();

        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed";
            toast.error(message, { autoClose: 1500 });
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                onClick={handleClose}
                className={`absolute inset-0 bg-black/20 backdrop-blur-sm ${closing ? "fade-out" : "fade-in"
                    }`}
            />
            <div
                className={`relative bg-white w-full max-w-lg rounded-2xl shadow-xl ${closing ? "scale-out" : "scale-in"
                    }`}
            >
                <div className="flex items-center justify-between px-6 py-2.5 bg-primary rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-white">
                        Edit User
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
                    id="editUserForm"
                    onSubmit={handleSubmit}
                    className="p-4 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar"
                >
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            User Name
                        </label>
                        <input
                            type="text"
                            name="user_name"
                            value={editUser.user_name}
                            onChange={handleChange}
                            placeholder="Enter user name"
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
                        form="editUserForm"
                        type="submit"
                        disabled={loading}
                        className="w-1/2 px-6 py-2 cursor-pointer rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPackingUser;
