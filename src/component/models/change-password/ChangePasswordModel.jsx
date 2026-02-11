"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import { changePassword } from "@/lib/fetcher";

export default function ChangePasswordModel({ open, onClose }) {
    const router = useRouter();

    const [visible, setVisible] = useState(false);
    const [closing, setClosing] = useState(false);
    const [loading, setLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    /* ===== OPEN / CLOSE ===== */
    useEffect(() => {
        if (open) {
            setVisible(true);
            setClosing(false);
            document.body.style.overflow = "hidden";
        } else if (visible) {
            setClosing(true);
            const t = setTimeout(() => {
                setVisible(false);
                setClosing(false);
                document.body.style.overflow = "auto";
            }, 400);
            return () => clearTimeout(t);
        }
    }, [open, visible]);

    const handleClose = () => {
        setClosing(true);
        setTimeout(() => {
            setVisible(false);
            setClosing(false);
            document.body.style.overflow = "auto";
            onClose();
        }, 400);
    };

    /* ===== VALIDATION ===== */
    const validate = () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill all fields");
            return false;
        }
        if (newPassword !== confirmPassword) {
            toast.error("New password and confirm password do not match");
            return false;
        }
        return true;
    };

    /* ===== SUBMIT ===== */
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const result = await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            toast.success(result?.message || "Password changed successfully");
            handleClose();
            setTimeout(() => router.replace("/"), 150);

        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed");
        } finally {
            setLoading(false);
        }
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">

            {/* BACKDROP */}
            <div
                onClick={handleClose}
                className={`absolute inset-0 bg-black/20 backdrop-blur-sm ${closing ? "fade-out" : "fade-in"
                    }`}
            />

            {/* MODAL */}
            <div
                className={`relative bg-white w-full max-w-lg rounded-2xl shadow-xl ${closing ? "scale-out" : "scale-in"
                    }`}
            >

                {/* HEADER */}
                <div className="flex items-center justify-between px-6 py-2.5 bg-primary rounded-t-2xl">
                    <h2 className="text-lg font-semibold text-white">
                        Change Password
                    </h2>

                    <button
                        onClick={handleClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition cursor-pointer"
                    >
                        <IoClose size={22} className="text-white" />
                    </button>
                </div>

                <form
                    id="changePasswordForm"
                    onSubmit={handleSubmit}
                    className="p-4 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar"
                >
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Current password"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm
              focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="New password"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm
              focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm
              focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
                        />
                    </div>
                </form>

                <div className="flex w-full justify-end gap-3 px-6 py-4 border-t">
                    <button
                        onClick={handleClose}
                        type="button"
                        disabled={loading}
                        className="w-1/2 px-6 py-2 text-secondary cursor-pointer rounded-lg border-2 border-gray-300 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        form="changePasswordForm"
                        type="submit"
                        disabled={loading}
                        className="w-1/2 px-6 py-2 cursor-pointer rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-60"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>

            </div>
        </div>
    );
}
