import React, { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";

const DeleteConfirmModal = ({
    open,
    onClose,
    onConfirm,
    title = "Delete Item",
    message = "Are you sure you want to delete this item? This action cannot be undone.",
    confirmText = "Delete",
    cancelText = "Cancel",
}) => {
    const [render, setRender] = useState(false);
    const [deleting, setDeleting] = useState(false);

    /* ===== SAME ANIMATION LOGIC ===== */
    useEffect(() => {
        if (open) {
            setRender(true);
            setDeleting(false);
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => {
                setRender(false);
                document.body.style.overflow = "auto";
            }, 400);
            return () => clearTimeout(timer);
        }
    }, [open]);

    if (!render) return null;

    const handleDelete = async () => {
        if (deleting) return;
        try {
            setDeleting(true);
            await onConfirm();
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div
            onClick={!deleting ? onClose : undefined}
            className={`
        fixed inset-0 z-50 flex items-center justify-center
        bg-black/40 backdrop-blur-sm
        ${open ? "fade-in" : "fade-out"}
      `}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className={`
          bg-white w-full max-w-sm
          rounded-2xl shadow-2xl p-6
          ${open ? "scale-in" : "scale-out"}
        `}
            >
                {/* ICON */}
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                        <FiTrash2 className="text-red-500" size={26} />
                    </div>
                </div>

                {/* TITLE */}
                <h3 className="text-lg font-semibold text-center text-gray-800">
                    {title}
                </h3>

                {/* MESSAGE */}
                <p className="text-sm text-gray-500 text-center mt-2 leading-relaxed">
                    {message}
                </p>

                {/* ACTIONS */}
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="
              flex-1 py-2 rounded-lg border border-gray-300
              text-gray-700 font-medium
              hover:bg-gray-100 cursor-pointer transition
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="
              flex-1 py-2 rounded-lg bg-red-500 text-white
              font-medium hover:bg-red-600 transition
              disabled:opacity-70 cursor-pointer disabled:cursor-not-allowed
              flex items-center justify-center gap-2
            "
                    >
                        {deleting && (
                            <span className="w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
                        )}
                        {deleting ? "Deleting..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
