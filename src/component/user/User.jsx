import React, { useEffect, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoSearch, IoTrashOutline } from "react-icons/io5";
import { toast } from "react-toastify";

import { deleteUser, getAllUsers } from "@/lib/fetcher";
import { FiEdit } from "react-icons/fi";
import DeleteConfirmModal from "../models/DeleteConfirmModal";
import EditUserModal from "../models/user/EditUserModel";
import { useAuth } from "@/context/AuthContext";
import AddUserModel from "../models/user/AddUserModel";

const User = () => {
  const { user, loading } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModel, setOpenDeleteModel] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openEditModel, setOpenEditModel] = useState(false);
  const [editUser, setEditUser] = useState(null);

  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [searchTimeout, setSearchTimeout] = useState(null);

  const isEmpty = totalItems === 0;

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  /* ================= FETCH USERS ================= */
  const fetchUsers = async (page = 1, size = 10, searchTerm = "") => {
    try {
      setUserLoading(true);
      setServerError(false);

      const res = await getAllUsers(page, size, searchTerm);

      if (res && res.data) {
        setUsers(res.data);
        setTotalItems(res.pagination?.total || 0);
        setTotalPages(res.pagination?.totalPages || 1);
      } else {
        setUsers([]);
        setTotalItems(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
      setServerError(true);
      toast.error("Failed to connect to server");
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchUsers(1, pageSize);
  }, [loading]);


  /* ================= DELETE USER ================= */

  const handleDelete = async (id) => {
    try {
      await deleteUser(id);

      toast.success("User deleted successfully");

      const isLastItem = users.length === 1 && pageNo > 1;
      const targetPage = isLastItem ? pageNo - 1 : pageNo;

      if (isLastItem) setPageNo(targetPage);

      fetchUsers(targetPage, pageSize, search);
    } catch (error) {
      console.error("DELETE USER ERROR:", error);
      toast.error("Failed to delete user");
    } finally {
      setOpenDeleteModel(false);
      setSelectedId(null);
    }
  };

  /* ================= PAGINATION ================= */
  const goToPage = (p) => {
    if (isEmpty) return;
    const next = Math.max(1, Math.min(totalPages, p));
    if (next === pageNo) return;
    setPageNo(next);
    fetchUsers(next, pageSize, search);
  };

  const handlePrev = () => goToPage(pageNo - 1);
  const handleNext = () => goToPage(pageNo + 1);

  const handlePageSizeChange = (e) => {
    const size = Number(e.target.value);
    setPageSize(size);
    setPageNo(1);
    fetchUsers(1, size, search);
  };

  const getPageWindow = () => {
    if (isEmpty) return [1];
    const pages = [];
    for (
      let i = Math.max(1, pageNo - 2);
      i <= Math.min(totalPages, pageNo + 2);
      i++
    ) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex-1 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 pt-16 lg:pt-4 overflow-hidden">
      {/* ================= HEADER ================= */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-semibold text-black">Users</h1>
      </div>

      {/* ================= SEARCH + ADD ================= */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 shrink-0">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by username"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);

              if (searchTimeout) clearTimeout(searchTimeout);

              const timeout = setTimeout(() => {
                setPageNo(1);
                if (!user) return;
                fetchUsers(1, pageSize, value);
              }, 500);

              setSearchTimeout(timeout);
            }}
            className="w-full pl-4 pr-10 py-2 rounded-lg border-2 border-gray-300 text-sm transition-all hover:border-secondary focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
          <IoSearch
            size={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
        </div>

        <button
          onClick={() => setOpenAddModal(true)}
          className="px-6 py-2 w-fit bg-secondary text-sm text-white rounded-lg hover:bg-primary transition-all font-semibold shadow-md hover:shadow-lg cursor-pointer sm:w-auto"
        >
          Add User
        </button>
      </div>

      {/* ================= TABLE ================= */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          {userLoading ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
              </div>
            </div>
          ) : (
            <table className="min-w-200 w-full border-collapse">
              <thead className="sticky whitespace-nowrap top-0 bg-secondary text-white z-10">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    User Name
                  </th>

                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Modules
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Created By
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Updated By
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="">
                {serverError ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <span className="text-red-500 font-semibold">
                        Server Connection Issue
                      </span>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-gray-400 font-semibold text-lg">No Data Found</span>
                        <p className="text-gray-400 text-sm">There are no users to display.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <tr
                      key={user.id}
                      className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {user.user_name}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {user.permitted_modules ? (
                          <div className="flex flex-wrap gap-2">
                            {JSON.parse(user.permitted_modules).map(
                              (mod, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 text-xs rounded-full  border-2 border-gray-300 text-gray-600 whitespace-nowrap"
                                >

                                  {mod}
                                </span>
                              )
                            )}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm">
                        {user?.created_by?.username}
                        <span className="text-xs text-gray-400" style={{ marginLeft: "2px" }}>
                          ({user?.created_by?.role})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm ">
                        {user?.updated_by?.username}
                        <span className="text-xs text-gray-400" style={{ marginLeft: "2px" }}>
                          ({user?.updated_by?.role})
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-4">

                          <FiEdit
                            className="cursor-pointer text-primary hover:text-blue-600"
                            onClick={() => {
                              setEditUser(user);
                              setOpenEditModel(true);
                            }}
                          />

                          <IoTrashOutline
                            className="cursor-pointer text-red-500 hover:text-red-700"
                            onClick={() => {
                              setSelectedId(user.id);
                              setOpenDeleteModel(true);
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* ================= FOOTER / PAGINATION ================= */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t bg-white">
          <div className="text-sm text-gray-600">
            Showing <b>{users.length}</b> of <b>{totalItems}</b>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Per page</span>
              <div className="relative inline-block">
                <select
                  disabled={isEmpty}
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="appearance-none border-2 border-gray-300 rounded-lg px-2 py-1 pr-7 text-sm focus:outline-none focus:border-secondary disabled:opacity-50"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  <svg
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <button
              onClick={handlePrev}
              disabled={pageNo <= 1 || isEmpty}
              className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded ${pageNo <= 1 || isEmpty
                ? "border-gray-300 opacity-50 cursor-not-allowed"
                : "border-gray-300 hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <MdKeyboardArrowLeft />
            </button>

            {getPageWindow().map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                disabled={isEmpty}
                className={`w-8 h-8 border-2 rounded text-sm transition-colors ${p === pageNo && !isEmpty
                  ? "bg-secondary text-white font-semibold border-secondary"
                  : "border-gray-300 hover:bg-gray-50 cursor-pointer disabled:cursor-not-allowed"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={handleNext}
              disabled={pageNo >= totalPages || isEmpty}
              className={`w-8 h-8 border-2 flex justify-center items-center text-sm rounded ${pageNo >= totalPages || isEmpty
                ? "border-gray-300 opacity-50 cursor-not-allowed"
                : "border-gray-300 hover:bg-gray-50 cursor-pointer"
                }`}
            >
              <MdKeyboardArrowRight />
            </button>
          </div>
        </div>
      </div>

      <AddUserModel
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        fetchUsers={fetchUsers}
      />
      <DeleteConfirmModal
        open={openDeleteModel}
        onClose={() => setOpenDeleteModel(false)}
        onConfirm={() => handleDelete(selectedId)}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />

      <EditUserModal
        open={openEditModel}
        onClose={() => setOpenEditModel(false)}
        fetchUsers={fetchUsers}
        editUserData={editUser}
      />
      {/* <ViewUserModel
        open={openViewModel}
        onClose={() => setOpenViewModel(false)}
        userId={viewId}
      /> */}
    </div>
  );
};

export default User;
