import { createPackingUser, createSupplier } from "@/lib/fetcher";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";

const AddPackingUser = ({ open, onClose, fetchPackingUsers }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [addUser, setAddUser] = useState({
    user_name: "",
  });

  /* ===== OPEN / CLOSE ANIMATION ===== */
  useEffect(() => {
    if (open) {
      setAddUser({
        user_name: "",
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
    setAddUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    /* ===== VALIDATION ===== */
    if (!addUser.user_name.trim()) {
      toast.error("User name is required");
      return;
    }
    setLoading(true);

    const payload = {
      user_name: addUser.user_name.trim(),
    };

    try {
      await createPackingUser(payload);
      toast.success("Packing user added successfully!", { autoClose: 1500 });
      handleClose();
      await fetchPackingUsers?.();
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
            Add Packing Fitter
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
          id="userForm"
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
              value={addUser.user_name}
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
            form="userForm"
            type="submit"
            disabled={loading}
            className="w-1/2 px-6 py-2 cursor-pointer rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPackingUser;
