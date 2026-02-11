"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { MdMiscellaneousServices } from "react-icons/md";
import {
  FaChevronDown,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaBoxOpen,
  FaLock,
  FaCubes,
} from "react-icons/fa";
import { IoMdTrendingUp } from "react-icons/io";
import { MdPersonPinCircle } from "react-icons/md";
import { FiGrid, FiArchive, FiUsers } from "react-icons/fi";
import { MdOutlineTrackChanges } from "react-icons/md";
import { toast } from "react-toastify";

import LogoutModal from "../models/logout/LogoutModel";
import ChangePasswordModel from "../models/change-password/ChangePasswordModel";
import { logout } from "@/lib/fetcher";
import { useAuth } from "@/context/AuthContext";


// Icon Mapping
const ICON_MAP = {
  FiGrid: <FiGrid size={18} />,
  FiArchive: <FiArchive size={18} />,
  FiUsers: <FiUsers size={18} />,
  FaBoxOpen: <FaBoxOpen size={18} />,
  MdMiscellaneousServices: <MdMiscellaneousServices size={18} />,
  FaCubes: <FaCubes size={18} />,
  IoMdTrendingUp: <IoMdTrendingUp size={18} />,
  MdPersonPinCircle: <MdPersonPinCircle size={18} />,
  MdOutlineTrackChanges: <MdOutlineTrackChanges size={18} />,
};

const Sidebar = () => {
  const router = useRouter();
  const pathname = router.pathname || "";

  const MENU_ITEMS = [
    {
      label: "Dashboard",
      path: "/dashboard",
      permission: "dashboard",
      icon: "FiGrid",
    },
    {
      label: "Expectation",
      path: "/expectation",
      permission: "superAdmin_only",
      icon: "MdOutlineTrackChanges",
    },
    {
      label: "Supplier",
      path: "/supplier",
      permission: "supplier",
      icon: "FiArchive",
    },
    {
      label: "Raw Material",
      permission: "raw_material_group",
      icon: "FaBoxOpen",
      children: [
        {
          label: "Raw Product",
          path: "/raw-material/raw-product",
          permission: "raw-product",
        },
        {
          label: "Raw Inward",
          path: "/raw-material/raw-inward",
          permission: "raw-inward",
        },
        {
          label: "Raw Outward",
          path: "/raw-material/raw-outward",
          permission: "raw-outward",
        },
      ],
    },
    {
      label: "Molding",
      path: "/molding",
      permission: "molding",
      icon: "MdMiscellaneousServices",
    },
    {
      label: "Product",
      path: "/product",
      permission: "product",
      icon: "FaCubes",
    },
    {
      label: "Packing",
      permission: "packing_group",
      icon: "FaBoxOpen",
      children: [
        {
          label: "Packing Outward",
          path: "/packing/packing-outward",
          permission: "packing-outward",
        },
        {
          label: "Packing Inward",
          path: "/packing/packing-inward",
          permission: "packing-inward",
        },
        {
          label: "Packing Fitter",
          path: "/packing/packing-fitter",
          permission: "packing-fitter",
        },
        {
          label: "Packing Payment",
          path: "/packing/packing-payment",
          permission: "packing-payment",
        },
        {
          label: "Mapper",
          path: "/packing/mapper",
          permission: "superAdmin_only",
        },
        {
          label: "Transaction",
          path: "/packing/transaction",
          permission: "packing-payment",
        },
      ],
    },
    {
      label: "Stock Details",
      path: "/stock-details",
      permission: "packing-payment",
      icon: "IoMdTrendingUp",
    },

    {
      label: "User",
      path: "/user",
      permission: "user",
      icon: "FiUsers",
    },

  ];

  const { user, role, permittedModules, loading } = useAuth();

  const [openLogout, setOpenLogout] = useState(false);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  /* ================= PERMISSION LOGIC ================= */
  const hasAccess = (moduleKey) => {
    if (!user) return false;
    if (role === "superAdmin") return true;
    return permittedModules.includes(moduleKey);
  };

  const handleLogoutConfirm = async () => {
    await logout();
    toast.success("Logged out");
    window.location.href = "/";
    setOpenLogout(false);
    setIsMobileOpen(false);
  };
  useEffect(() => {
    if (pathname.startsWith("/raw-material")) {
      setOpenMenu("Raw Material");
    } else if (pathname.startsWith("/packing")) {
      setOpenMenu("Packing");
    }
  }, [pathname]);

  useEffect(() => {
    if (loading || !user) return;

    const currentRoute = MENU_ITEMS.flatMap((item) => {
      if (item.children) return item.children;
      return item;
    }).find((m) => pathname.startsWith(m.path));

    if (!currentRoute) return;

    if (!hasAccess(currentRoute.permission)) {
      if (
        permittedModules[0] == "raw-inward" ||
        permittedModules[0] == "raw-product" ||
        permittedModules[0] == "raw-outward"
      ) {
        router.push(`/raw-material/${permittedModules[0]}` || "/");
        return;
      }
      if (
        permittedModules[0] == "packing-inward" ||
        permittedModules[0] == "packing-outward" ||
        permittedModules[0] == "packing-fitter"
      ) {
        router.push(`/packing/${permittedModules[0]}` || "/");
        return;
      }
      router.push(`/${permittedModules[0]}` || "/");
    }
  }, [pathname, user, loading]);

  /* ================= HELPERS ================= */
  const isActive = (path) => pathname.startsWith(path);
  const startsWith = (path) => pathname.startsWith(path);

  return (
    <>
      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-primary flex items-center px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="text-white text-xl cursor-pointer"
        >
          <FaBars />
        </button>
        <span className="ml-4 text-white font-semibold">Admin Panel</span>
      </div>

      {/* OVERLAY */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed lg:static top-0 left-0 z-40
          h-dvh lg:h-screen
          w-60 lg:w-56 xl:w-64
          bg-primary text-white flex flex-col
          transition-transform duration-300
          ${isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* LOGO */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white">
              <img
                src="https://media.istockphoto.com/id/2194078950/photo/profile-picture-of-smiling-confident-arabic-businessman.webp?a=1&b=1&s=612x612&w=0&k=20&c=42Z7FDi1u5Ogevtd0xMUkTWM7hDzrre4YOlbHKvK_T8="
                alt="Admin"
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold">
                {user?.username || "Loading..."}
              </h1>
              <span className="text-[11px] bg-secondary px-2 py-0.5 rounded-full">
                {role || "..."}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden cursor-pointer text-white"
          >
            <FaTimes />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 overflow-y-auto hide-scrollbar px-3 py-4 space-y-1">
          {MENU_ITEMS.map((item, index) => {
            const allow = hasAccess(item.permission);

            const isGroup = !!item.children;

            // if normal menu — check permission
            if (!isGroup && !allow) return null;

            // if group menu — show if ANY child allowed
            if (isGroup) {
              const hasChildAccess = item.children.some((child) =>
                hasAccess(child.permission),
              );

              if (!hasChildAccess) return null;
            }

            // 2. Simple Link
            if (!item.children) {
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition cursor-pointer
                  ${isActive(item.path)
                      ? "bg-white text-primary shadow"
                      : "hover:bg-white/10"
                    }`}
                >
                  {ICON_MAP[item.icon]}
                  {item.label}
                </Link>
              );
            }

            // 3. Dropdown Group (Stepper Design)
            const anyChildAllowed = item.children.some((child) =>
              hasAccess(child.permission),
            );
            if (!anyChildAllowed) return null;

            return (
              <div key={index}>
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === item.label ? null : item.label)
                  }
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md transition cursor-pointer
  ${openMenu === item.label ? "bg-white/15" : "hover:bg-white/10"}`}
                >
                  <div className="flex items-center gap-3">
                    {ICON_MAP[item.icon]}
                    {item.label}
                  </div>

                  <FaChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${openMenu === item.label ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {/* STEPPER DROPDOWN */}
                <div
                  className={`overflow-hidden transition-all duration-300
                  ${openMenu === item.label
                      ? "max-h-64 opacity-100"
                      : "max-h-0 opacity-0"
                    }`}
                >

                  <div className="relative ml-6.5 mt-2 flex flex-col gap-4 py-2">
                    {/* The Continuous Vertical Line */}
                    <div className="absolute left-[4.5px] top-0 bottom-0 w-px bg-white/30" />

                    {item.children.map((child) => {
                      if (!hasAccess(child.permission)) return null;
                      const isChildActive = startsWith(child.path);

                      return (
                        <Link
                          key={child.path}
                          href={child.path}
                          className="relative flex items-center gap-4 text-sm cursor-pointer group"
                        >
                          <span
                            className={`h-2.5 w-2.5 rounded-full border-2 z-10 transition-colors
                            ${isChildActive
                                ? "bg-white/70 border-white/70"
                                : "bg-primary border-white/40 group-hover:border-white/70"
                              }`}
                          />
                          <span
                            className={`${isChildActive
                              ? "font-semibold text-white"
                              : "text-white/70 hover:text-white"
                              }`}
                          >
                            {child.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="px-3 py-3">
          <button
            onClick={() => setOpenChangePassword(true)}
            className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-white/10"
          >
            <FaLock size={16} />
            Change Password
          </button>
        </div>

        <div className="px-4 py-4 border-t border-white/20">
          <button
            onClick={() => setOpenLogout(true)}
            className="w-full cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-md hover:bg-white/10"
          >
            <FaSignOutAlt size={16} />
            Logout
          </button>
        </div>
      </aside>

      <ChangePasswordModel
        open={openChangePassword}
        onClose={() => setOpenChangePassword(false)}
      />

      <LogoutModal
        open={openLogout}
        onClose={() => setOpenLogout(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
};

export default Sidebar;
