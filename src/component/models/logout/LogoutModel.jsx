import React, { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";

const LogoutModal = ({ open, onClose, onConfirm }) => {
  const [render, setRender] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
    } else {
      const timer = setTimeout(() => setRender(false), 400);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!render) return null;

  const handleLogout = async () => {
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={!loading ? onClose : undefined}
      className={`fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm
        ${open ? "fade-in" : "fade-out"}
      `}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6
          ${open ? "scale-in" : "scale-out"}
        `}
      >
        {/* ICON */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <FiLogOut className="text-red-500" size={26} />
          </div>
        </div>

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-center text-gray-800">
          Are you sure?
        </h3>

        {/* DESC */}
        <p className="text-sm text-gray-500 text-center mt-2">
          You will be logged out of your account and need to login again.
        </p>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-6">
          <button
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700
              hover:bg-gray-100 font-medium cursor-pointer transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleLogout}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-red-500 text-white
              hover:bg-red-600 font-medium cursor-pointer transition disabled:opacity-60"
          >
            {loading ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
