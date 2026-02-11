import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { getModules, updateUser } from "@/lib/fetcher";

const EditUserModal = ({ open, onClose, fetchUsers, editUserData }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);

  const [userForm, setUserForm] = useState({
    user_name: "",
    password: "",
  });

  /* ================= FETCH MODULES ================= */
  useEffect(() => {
    if (!open) return;
    fetchModules();
  }, [open]);

  const fetchModules = async () => {
    try {
      const res = await getModules();
      setModules(Array.isArray(res?.data) ? res?.data : []);
    } catch {
      toast.error("Failed to load modules");
    }
  };

  /* ================= OPEN / CLOSE ================= */
  useEffect(() => {
    if (open && editUserData) {
      setUserForm({
        user_name: editUserData.user_name || "",
        password: "",
      });

      let mods = editUserData.permitted_modules || [];
      if (typeof mods === "string") {
        try {
          mods = JSON.parse(mods);
        } catch {
          mods = mods.split(",");
        }
      }
      setSelectedModules(mods);

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
  }, [open, editUserData, visible]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      document.body.style.overflow = "auto";
      onClose();
    }, 400);
  };

  /* ================= INPUT ================= */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserForm((p) => ({ ...p, [name]: value }));
  };

  const toggleModule = (key) => {
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      user_name: userForm.user_name.trim(),
      permitted_modules: selectedModules,
    };

    if (userForm.password) {
      payload.password = userForm.password;
    }

    try {
      await updateUser(editUserData.id, payload);
      handleClose();

      toast.success("User updated successfully!");
      await fetchUsers?.();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update user"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;


  const toggleAllModules = () => {
    const allKeys = modules.map((m) => m.module_key);

    if (selectedModules.length === allKeys.length) {
      setSelectedModules([]);
    } else {
      setSelectedModules(allKeys);
    }
  };

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

          {/* USER NAME */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              User Name
            </label>

            <input
              name="user_name"
              type="text"
              placeholder="Enter username"
              value={userForm.user_name}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm
          focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              New Password (optional)
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={userForm.password}
              onChange={handleChange}
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-sm
          focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>

          {/* MODULE PERMISSION */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-semibold text-gray-700">
                Permitted Modules
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                <span className="text-sm font-semibold text-gray-700">
                  All
                </span>

                <input
                  type="checkbox"
                  checked={
                    modules.length > 0 &&
                    selectedModules.length === modules.length
                  }
                  onChange={toggleAllModules}
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {modules.map((mod) => (
                <label
                  key={mod.id}
                  className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedModules.includes(mod.module_key)}
                    onChange={() => toggleModule(mod.module_key)}
                  />

                  <span className="text-sm text-gray-700">
                    {mod.module_name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>

        {/* ===== FOOTER ===== */}
        <div className="flex w-full justify-end gap-3 px-6 py-4 border-t">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="w-1/2 px-6 py-2 text-secondary cursor-pointer rounded-lg border-2 border-gray-300 text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="editUserForm"
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

export default EditUserModal;
