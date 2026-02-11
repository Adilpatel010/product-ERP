"use client";

import { createPackingPayment, searchPackingPaymentUser } from "@/lib/fetcher";
import Link from "next/link";
import React, { useState } from "react";
import {
  IoArrowBackOutline,
  IoCalendarOutline,
  IoCloseCircleOutline,
  IoSearch,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import AddUserModel from "@/component/models/user/AddUserModel";
import { FiPlusCircle } from "react-icons/fi";

const inputClass =
  "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all";

const AddPackingPayment = () => {
  const router = useRouter();

  const [create, setCreate] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
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

  // ================= USER SEARCH LOGIC =================
  const getUsers = async (value) => {
    try {
      setUserLoading(true);
      const res = await searchPackingPaymentUser(value);
      const data = res?.data || [];
      setUsers(data);
      setShowNotFound(data.length === 0);
    } catch (error) {
      console.error("Search Error:", error);
      setUsers([]);
      setShowNotFound(true);
    } finally {
      setUserLoading(false);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setUserSearch(user.name);
    setUsers([]);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Escape") setUsers([]);
    if (!users.length) return;

    if (e.key === "ArrowDown") {
      setUserActive((p) => (p < users.length - 1 ? p + 1 : p));
    } else if (e.key === "ArrowUp") {
      setUserActive((p) => (p > 0 ? p - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (users[userActive]) selectUser(users[userActive]);
    }
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserSearchChange = (val) => {
    setUserSearch(val);
    setUserActive(0);
    setShowNotFound(false);
    if (userTimeout) clearTimeout(userTimeout);
    if (!val.trim()) {
      setUsers([]);
      setUserLoading(false);
      return;
    }
    setUserLoading(true);
    setUserTimeout(setTimeout(() => getUsers(val), 500));
  };

  // ================= VALIDATE & SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.date) return toast.error("Please select a date");
    if (!selectedUser) return toast.error("Please select a user");
    if (!form.amount) return toast.error("Please enter an amount");
    if (Number(form.amount) <= 0) return toast.error("Amount must be greater than 0");
    if (!form.description || !form.description.trim()) return toast.error("Please enter a description");

    try {
      setCreate(true);

      const payload = {
        date: form.date,
        user_id: selectedUser.id,
        amount: form.amount,
        description: form.description,
      };

      const res = await createPackingPayment(payload);

      if (res?.success) {
        toast.success(res.message);
        router.push("/packing/packing-payment");
      } else {
        toast.error(res?.message || "Failed to create payment");
      }
    } catch (error) {
      console.error("SUBMIT ERROR:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setCreate(false);
    }
  };

  const handleCancel = () => {
    setForm({
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
    });
    setSelectedUser(null);
    setUserSearch("");
    setUsers([]);
  };

  return (
    <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
      {/* HEADER */}
      <div className="flex flex-row justify-between items-center gap-3 mb-4">
        <h1 className="text-lg md:text-2xl font-semibold">Add Packing Payment</h1>
        <Link
          href="/packing/packing-payment"
          className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
        >
          <IoArrowBackOutline size={18} /> Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className=" bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto flex flex-col"
      >
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* DATE */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => handleFormChange("date", e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

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


            {/* USER SEARCH */}
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
                  className={`${inputClass} ${selectedUser ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
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
                    !userLoading && <IoSearch size={18} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* DROPDOWN RESULTS */}
              {!selectedUser && userSearch && (
                <>
                  {users.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {users.map((u, i) => (
                        <div
                          key={u.id}
                          onMouseEnter={() => setUserActive(i)}
                          onClick={() => selectUser(u)}
                          className={`px-3 py-2 text-sm cursor-pointer transition ${i === userActive
                            ? "bg-primary text-white"
                            : "hover:bg-secondary/10"
                            }`}
                        >
                          {u.name}
                        </div>
                      ))}
                    </div>
                  )}
                  {showNotFound && !userLoading && (
                    <div className="absolute z-50 w-full mt-1 px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 shadow-lg rounded-lg">
                      No user found
                    </div>
                  )}
                </>
              )}
            </div>

            {/* AMOUNT */}
            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-600">
                Amount
              </label>
              <input
                type="number"
                placeholder="Enter Amount"
                value={form.amount}
                onChange={(e) => handleFormChange("amount", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="mt-6">
            <label className="block text-sm font-semibold mb-1 text-gray-600">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => handleFormChange("description", e.target.value)}
              className={`${inputClass} w-full resize-none`}
              placeholder="Enter description..."
            />
          </div>
        </div>

        {/* BOTTOM BUTTONS */}
        <div className="flex flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create}
            className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {create ? "Creating..." : "Create"}
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

export default AddPackingPayment;