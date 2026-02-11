"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/router";

const Login = () => {

  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [buttonLoading, setButtonLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
  });

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [loading, isAuthenticated]);

  useEffect(() => {
    if (buttonLoading) setShowPassword(false);
  }, [buttonLoading]);

  if (loading || isAuthenticated) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonLoading(true);

    try {
      await login({
        username: formData.username,
        password_hash: formData.password_hash,
      });
      toast.success("Login successful");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setButtonLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-grey px-4">

      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 h-100">

        {/* LEFT */}
        <div
          className="hidden md:flex flex-col justify-between p-6 text-white"
          style={{
            background: "linear-gradient(135deg, #006d77 0%, #4299AB 100%)",
          }}
        >
          <div>
            <img
              src="https://accounting-ecru.vercel.app/image/quba-logo.png"
              alt="Logo"
              className="w-28 mb-8"
            />
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
            <p className="text-white/90 text-sm">
              Login to manage your dashboard securely.
            </p>
          </div>

          <p className="text-xs text-white/70">
            © {new Date().getFullYear()} Quba Infotech
          </p>
        </div>

        {/* RIGHT */}
        <div className="p-6 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-primary mb-2">Sign In</h2>
          <p className="text-sm text-gray-500 mb-6">Enter your credentials</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full px-4 py-3 text-sm rounded-lg border-2 border-gray-300
              focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password_hash"
                value={formData.password_hash}
                onChange={handleChange}
                placeholder="Password"
                className="w-full px-4 py-3 pr-12 text-sm rounded-lg border-2 border-gray-300
    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute cursor-pointer inset-y-0 right-3 flex items-center text-gray-500 hover:text-primary"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-primary">
                Forgot password?
              </Link>
            </div>

            <div className="flex justify-center">
              <p className="text-sm text-gray-500">
                username: admin || password: admin123
              </p>
            </div>

            <button
              type="submit"
              disabled={buttonLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold transition cursor-pointer 
    ${buttonLoading
                  ? "bg-primary/70 disabled:opacity-60 disabled:cursor-not-allowed"
                  : "bg-secondary hover:bg-primary"
                }`}
            >
              {buttonLoading ? (
                <>
                  <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login Now"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
