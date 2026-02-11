import { createUser } from "@/lib/fetcher";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { getModules } from "@/lib/fetcher";

const AddUserModel = ({ open, onClose, fetchUsers }) => {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [modules, setModules] = useState([]);
  const [selectedModules, setSelectedModules] = useState([]);

  const [userForm, setUserForm] = useState({
    user_name: "",
    password: "",
  });

  useEffect(() => {
    if (!open) return;
    fetchModules();
  }, [open]);

  /* ================= fetchModules ================= */

  const fetchModules = async () => {
    try {
      const res = await getModules();
      setModules(res?.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load modules");
    }
  };

  const toggleModule = (moduleKey) => {
    setSelectedModules((prev) =>
      prev.includes(moduleKey)
        ? prev.filter((k) => k !== moduleKey)
        : [...prev, moduleKey]
    );
  };

  /* ===== OPEN / CLOSE ===== */
  useEffect(() => {
    if (open) {
      setUserForm({
        user_name: "",
        password: "",
        permitted_modules: [],
      });
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

  const resetForm = () => {
    setUserForm({
      user_name: "",
      password: "",
    });
    setSelectedModules([]);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
      document.body.style.overflow = "auto";
      resetForm();
      onClose();
    }, 400);
  };

  /* ===== INPUT CHANGE ===== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserForm((p) => ({ ...p, [name]: value }));
  };

  /* ===== SUBMIT ===== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      user_name: userForm.user_name.trim(),
      password: userForm.password,
      permitted_modules: selectedModules,
    };

    try {
      await createUser(payload);
      handleClose();
      toast.success("User added successfully!");
      await fetchUsers?.();

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to add user");
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
            Add User
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
              Password
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
            form="userForm"
            disabled={loading}
            className="w-1/2 px-6 py-2 cursor-pointer rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Add User"}
          </button>
        </div>

      </div>
    </div>

  );
};

export default AddUserModel;
