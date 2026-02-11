"use client";

import {
  getPackingPaymentById,
  updatePackingPayment,
  searchPackingPaymentUser,
} from "@/lib/fetcher";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoCloseCircleOutline,
  IoSearch,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { FiPlusCircle } from "react-icons/fi";
import AddUserModel from "@/component/models/user/AddUserModel";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all";

const EditPackingPayment = () => {
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [form, setForm] = useState({
    date: "",
    amount: "",
    description: "",
  });
  const formatDDMMYYYY = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userActive, setUserActive] = useState(0);
  const [userTimeout, setUserTimeout] = useState(null);
  const [showNotFound, setShowNotFound] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchExistingData = async () => {
      try {
        setLoading(true);
        const res = await getPackingPaymentById(id);
        if (res?.success) {
          const data = res.data;
          setForm({
            date: data.date ? data.date.split("T")[0] : "",
            amount: data.amount,
            description: data.description || "",
          });
          if (data.user) {
            setSelectedUser(data.user);
            setUserSearch(data.user.user_name);
          }
        } else {
          toast.error("Failed to load payment data");
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        toast.error("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchExistingData();
  }, [id]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const getUsers = async (value) => {
    try {
      setUserLoading(true);
      const res = await searchPackingPaymentUser(value);
      setUsers(res?.data || []);
      setShowNotFound(res?.data?.length === 0);
    } catch (error) {
      setUsers([]);
      setShowNotFound(true);
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserSearchChange = (val) => {
    setUserSearch(val);
    setUserActive(0);
    setShowNotFound(false);
    if (userTimeout) clearTimeout(userTimeout);
    if (!val.trim()) {
      setUsers([]);
      return;
    }
    setUserLoading(true);
    setUserTimeout(setTimeout(() => getUsers(val), 500));
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearch(user.name || user.user_name);
    setUsers([]);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") setUsers([]);
    if (!users.length) return;
    if (e.key === "ArrowDown")
      setUserActive((p) => (p < users.length - 1 ? p + 1 : p));
    if (e.key === "ArrowUp") setUserActive((p) => (p > 0 ? p - 1 : 0));
    if (e.key === "Enter") {
      e.preventDefault();
      if (users[userActive]) selectUser(users[userActive]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date) return toast.error("Please select a date");
    if (!selectedUser) return toast.error("Please select a user");
    if (!form.amount) return toast.error("Please enter an amount");
    if (Number(form.amount) <= 0)
      return toast.error("Amount must be greater than 0");
    if (!form.description || !form.description.trim())
      return toast.error("Please enter a description");

    try {
      setUpdating(true);
      const payload = {
        date: form.date,
        user_id: selectedUser.id,
        amount: form.amount,
        description: form.description,
      };

      const res = await updatePackingPayment(id, payload);

      if (res?.success) {
        toast.success(res.message);
        router.push("/packing/packing-payment");
      } else {
        toast.error(res?.message || "Update failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-grey flex items-center justify-center h-dvh">
        <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">
          Edit Packing Payment
        </h1>
        <Link
          href="/packing/packing-payment"
          className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
        >
          <IoArrowBackOutline size={18} /> Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto flex flex-col"
      >
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Date
              </label>

              <div className="relative">
                {/* REAL DATE INPUT (native picker) */}
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                {/* DISPLAY INPUT (DD/MM/YYYY) */}
                <input
                  type="text"
                  readOnly
                  value={formatDDMMYYYY(form.date)}
                  className={`${inputClass} pr-10`}
                />

                {/* CALENDAR ICON */}
                <div className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                  <IoCalendarOutline size={18} />
                </div>
              </div>
            </div>


            <div className="relative">
              <div className="flex justify-between">
                <label className="block text-sm font-semibold mb-1 text-gray-600">
                  User
                </label>
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => setUserModalOpen(true)}
                >
                  <FiPlusCircle className="text-secondary hover:text-primary transition-all duration-300" size={22} />
                </button>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search User"
                  value={userSearch}
                  autoComplete="off"
                  readOnly={!!selectedUser}
                  onChange={(e) => handleUserSearchChange(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className={`${inputClass} ${selectedUser ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
                <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                  {userLoading && (
                    <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                  )}
                  {selectedUser ? (
                    <IoCloseCircleOutline
                      size={20}
                      className="text-gray-400 cursor-pointer hover:text-red-500"
                      onClick={() => {
                        setSelectedUser(null);
                        setUserSearch("");
                        setUsers([]);
                      }}
                    />
                  ) : (
                    !userLoading && (
                      <IoSearch size={18} className="text-gray-400" />
                    )
                  )}
                </div>
              </div>
              {!selectedUser && users.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {users.map((u, i) => (
                    <div
                      key={u.id}
                      onMouseEnter={() => setUserActive(i)}
                      onClick={() => selectUser(u)}
                      className={`px-3 py-2 text-sm cursor-pointer ${i === userActive
                        ? "bg-primary text-white"
                        : "hover:bg-secondary/10"
                        }`}
                    >
                      {u.name}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Amount
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleFormChange("amount", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold mb-1 text-gray-600">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              className={`${inputClass} w-full resize-none`}
            />
          </div>
        </div>

        <div className="flex flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={() => router.push("/packing/packing-payment")}
            className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer transition-all"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={updating}
            className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all"
          >
            {updating ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
      <AddUserModel
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
      />
    </div>
  );
};

export default EditPackingPayment;
