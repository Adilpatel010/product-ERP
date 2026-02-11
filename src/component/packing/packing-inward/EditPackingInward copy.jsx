// "use client";

// import {
//     updatePackingInward,
//     getPackingInwardById
// } from "@/lib/fetcher";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import {
//     IoArrowBackOutline,
// } from "react-icons/io5";
// import { toast } from "react-toastify";
// import { useRouter } from "next/router";

// const inputClass =
//     "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

// const EditPackingInward = () => {
//     const router = useRouter();
//     const { id } = router.query;
//     // ================= MAIN STATE =================
//     const [inwardData, setInwardData] = useState({
//         packing_inward_date: "",
//         fitter_id: "",
//         product_id: "",
//         receive_gurus: "",
//         remark: "",
//     });

//     const [difference, setDifference] = useState(0);
//     const [updating, setUpdating] = useState(false);
//     const [expectedGurus, setExpectedGurus] = useState(0);
//     const [pageLoading, setPageLoading] = useState(true);

//     // ================= PRODUCT SEARCH STATE =================
//     const [products, setProducts] = useState([]);

//     // ================ FITTER SEARCH STATE ==================
//     const [fitterSearch, setFitterSearch] = useState("");
//     // ================= LOAD INITIAL DATA =================
//     useEffect(() => {
//         if (id) {
//             fetchInwardDetails();
//         }
//     }, [id]);

//     const fetchInwardDetails = async () => {
//         try {
//             setPageLoading(true);

//             const res = await getPackingInwardById(id);
//             const data = res.data;

//             setFitterSearch(data.fitter?.user_name || "");

//             setProducts([
//                 {
//                     product: data.product,
//                     exp_gurus: data.exp_gurus,
//                 },
//             ]);

//             setExpectedGurus(data.exp_gurus || 0);

//             // SET FORM DATA
//             setInwardData({
//                 packing_inward_date: data.inward_date?.split("T")[0] || "",
//                 fitter_id: data.fitter?.id || "",
//                 product_id: data.product?.id || "",
//                 receive_gurus: data.receive_gurus || "",
//                 remark: data.remark || "",
//             });

//         } catch (err) {
//             toast.error("Failed to load inward data");
//         } finally {
//             setPageLoading(false);
//         }
//     };


//     // ================= INPUT CHANGE =================
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setInwardData((prev) => ({ ...prev, [name]: value }));
//     };


//     // ================= CALC DIFFERENCE =================
//     useEffect(() => {
//         const received = Number(inwardData.receive_gurus || 0);
//         const expected = Number(expectedGurus || 0);
//         setDifference(expected - received);
//     }, [inwardData.receive_gurus, expectedGurus]);

//     // ================= SUBMIT =================
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!inwardData.fitter_id || !inwardData.product_id || !inwardData.receive_gurus) {
//             toast.error("Please fill all required fields");
//             return;
//         }

//         try {
//             setUpdating(true);
//             const payload = { ...inwardData, id };
//             await updatePackingInward(payload);
//             toast.success("Packing inward updated successfully");
//             router.push("/packing/packing-inward");
//         } catch (err) {
//             toast.error(err.message || "Update failed");
//         }
//         finally {
//             setUpdating(false);
//         }
//     };

//     if (pageLoading) {
//         return (
//             <div className="flex-1 bg-grey flex items-center justify-center">
//                 <div className="flex items-center justify-center h-full w-full">
//                     <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
//                         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
//                         <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
//                         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
//                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
//             <div className="flex flex-row justify-between items-center gap-3 mb-4">
//                 <h1 className="text-lg md:text-2xl font-semibold">Edit Packing Inward</h1>
//                 <Link
//                     href="/packing/packing-inward"
//                     className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
//                 >
//                     <IoArrowBackOutline size={18} />
//                     Back
//                 </Link>
//             </div>

//             <form
//                 onSubmit={handleSubmit}
//                 className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden"
//             >
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Date</label>
//                         <input
//                             type="date"
//                             name="packing_inward_date"
//                             value={inwardData.packing_inward_date}
//                             onChange={handleChange}
//                             className={inputClass}
//                         />
//                     </div>

//                     <div className="relative w-full">
//                         <label className="block text-sm font-semibold mb-1">Fitter Name</label>
//                         <input
//                             type="text"
//                             placeholder="Search fitter"
//                             value={fitterSearch}
//                             disabled={true}
//                             className={`${inputClass} pr-10 bg-gray-100 cursor-not-allowed`}
//                         />
//                     </div>

//                     <div className="relative w-full">
//                         <label className="block text-sm font-semibold mb-1">Product Name</label>
//                         <select
//                             name="product_id"
//                             value={inwardData.product_id}
//                             disabled={true}
//                             className={`${inputClass} appearance-none pr-10 bg-gray-100 cursor-not-allowed`}
//                         >
//                             {products.map((row) => (
//                                 <option key={row?.product?.id} value={row?.product?.id}>
//                                     {row.product.product_name} - {row.product.color || "All"} - {row.exp_gurus} Gurus
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold mb-1">
//                             Qty in Gurus (Expected : {expectedGurus})
//                         </label>
//                         <input
//                             type="number"
//                             name="receive_gurus"
//                             placeholder="qty"
//                             value={inwardData.receive_gurus}
//                             onChange={handleChange}
//                             className={inputClass}
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Difference</label>
//                         <input
//                             type="text"
//                             value={difference}
//                             disabled
//                             className={`${inputClass} bg-gray-100`}
//                         />
//                     </div>
//                 </div>

//                 <div className="mb-4">
//                     <label className="block text-sm font-semibold mb-1">Remark</label>
//                     <textarea
//                         name="remark"
//                         placeholder="Remark"
//                         value={inwardData.remark}
//                         rows={4}
//                         onChange={handleChange}
//                         className={inputClass}
//                     />
//                 </div>

//                 <div className="flex flex-row gap-4">
//                     <button
//                         type="button"
//                         onClick={() => router.back()}
//                         className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
//                     >
//                         Back
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={updating}
//                         className="flex-1 px-6 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {updating ? "Updating..." : "Update"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditPackingInward;

// "use client";

// import {
//     updatePackingInward,
//     getPackingInwardById,
//     searchOutwardUser,
//     getPackingProductByFitterId,
//     getMapperRatePerGurus,
// } from "@/lib/fetcher";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import {
//     IoArrowBackOutline,
//     IoSearch,
//     IoCloseCircleOutline,
// } from "react-icons/io5";
// import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import { toast } from "react-toastify";
// import { useRouter } from "next/router";

// const inputClass =
//     "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

// const EditPackingInward = () => {
//     const router = useRouter();
//     const { id } = router.query;

//     // ================= MAIN STATE =================
//     const [inwardData, setInwardData] = useState({
//         packing_inward_date: "",
//         fitter_id: "",
//         product_id: "",
//         receive_gurus: "",
//         remark: "",
//     });

//     const [difference, setDifference] = useState(0);
//     const [updating, setUpdating] = useState(false);
//     const [expectedGurus, setExpectedGurus] = useState(0);
//     const [ratePerGurus, setRatePerGurus] = useState(0);
//     const [pageLoading, setPageLoading] = useState(true);

//     // ================= SEARCH & DROPDOWN STATE =================
//     const [fitterSearch, setFitterSearch] = useState("");
//     const [fitterId, setFitterId] = useState("");
//     const [fitters, setFitters] = useState([]);
//     const [showFitterDropdown, setShowFitterDropdown] = useState(false);
//     const [activeFitterIndex, setActiveFitterIndex] = useState(0); // Added for keyboard nav
//     const [fitterLoading, setFitterLoading] = useState(false);

//     const [products, setProducts] = useState([]);
//     const [noProductFound, setNoProductFound] = useState(false);

//     // ================= LOAD INITIAL DATA =================
//     useEffect(() => {
//         if (id) {
//             fetchInwardDetails();
//         }
//     }, [id]);

//     const fetchInwardDetails = async () => {
//         try {
//             setPageLoading(true);
//             const res = await getPackingInwardById(id);
//             const data = res.data;

//             setFitterSearch(data.fitter?.user_name || "");
//             setFitterId(data.fitter?.id || "");
//             setExpectedGurus(data.exp_gurus || 0);

//             if (data.fitter?.id) {
//                 const prodRes = await getPackingProductByFitterId(data.fitter.id);
//                 setProducts(prodRes?.data || []);
//             }

//             if (data.product?.id) {
//                 const rateRes = await getMapperRatePerGurus(data.product.id);
//                 setRatePerGurus(rateRes?.rate_per_gurus || 0);
//             }

//             setInwardData({
//                 packing_inward_date: data.inward_date?.split("T")[0] || "",
//                 fitter_id: data.fitter?.id || "",
//                 product_id: data.product?.id || "",
//                 receive_gurus: data.receive_gurus || "",
//                 remark: data.remark || "",
//             });

//         } catch (err) {
//             toast.error("Failed to load inward data");
//         } finally {
//             setPageLoading(false);
//         }
//     };

//     // ================= FITTER KEYBOARD & SEARCH LOGIC =================
//     const handleFitterSearch = async (value) => {
//         setFitterSearch(value);
//         if (!value.trim()) {
//             setFitters([]);
//             setShowFitterDropdown(false);
//             return;
//         }
//         setFitterLoading(true);
//         try {
//             const res = await searchOutwardUser(value);
//             setFitters(res?.data || []);
//             setActiveFitterIndex(0); // Reset index on new search
//             setShowFitterDropdown(true);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setFitterLoading(false);
//         }
//     };

//     const handleFitterKeyDown = (e) => {
//         if (!showFitterDropdown) return;

//         if (e.key === "ArrowDown") {
//             setActiveFitterIndex((prev) => (prev < fitters.length - 1 ? prev + 1 : prev));
//         } else if (e.key === "ArrowUp") {
//             setActiveFitterIndex((prev) => (prev > 0 ? prev - 1 : 0));
//         } else if (e.key === "Enter") {
//             e.preventDefault();
//             if (fitters[activeFitterIndex]) {
//                 selectFitter(fitters[activeFitterIndex]);
//             }
//         } else if (e.key === "Escape") {
//             setShowFitterDropdown(false);
//         }
//     };

//     const selectFitter = async (fitter) => {
//         setFitterSearch(fitter.name);
//         setFitterId(fitter.id);
//         setInwardData((prev) => ({ ...prev, fitter_id: fitter.id, product_id: "" }));
//         setProducts([]);
//         setExpectedGurus(0);
//         setRatePerGurus(0);
//         setShowFitterDropdown(false);

//         try {
//             const res = await getPackingProductByFitterId(fitter.id);
//             if (!res?.data || res.data.length === 0) {
//                 setNoProductFound(true);
//             } else {
//                 setProducts(res.data);
//                 setNoProductFound(false);
//             }
//         } catch (err) {
//             setNoProductFound(true);
//         }
//     };

//     const removeFitter = () => {
//         setFitterSearch("");
//         setFitterId("");
//         setProducts([]);
//         setInwardData((prev) => ({ ...prev, fitter_id: "", product_id: "" }));
//     };

//     // ================= CALCULATIONS =================
//     useEffect(() => {
//         const received = Number(inwardData.receive_gurus || 0);
//         const expected = Number(expectedGurus || 0);
//         setDifference(expected - received);
//     }, [inwardData.receive_gurus, expectedGurus]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setInwardData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             setUpdating(true);
//             const payload = { ...inwardData, id };
//             await updatePackingInward(payload);
//             toast.success("Updated successfully");
//             router.push("/packing/packing-inward");
//         } catch (err) {
//             toast.error(err.message || "Update failed");
//         } finally {
//             setUpdating(false);
//         }
//     };

//     if (pageLoading) {
//         return (
//             <div className="flex-1 flex items-center justify-center h-dvh bg-grey">
//                 <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
//                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
//                     <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
//                     <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
//                     <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
//             <div className="flex flex-row justify-between items-center gap-3 mb-4">
//                 <h1 className="text-lg md:text-2xl font-semibold">Edit Packing Inward</h1>
//                 <Link href="/packing/packing-inward" className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg font-semibold">
//                     <IoArrowBackOutline size={18} /> Back
//                 </Link>
//             </div>

//             <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto">
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

//                     {/* DATE */}
//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Date</label>
//                         <input type="date" name="packing_inward_date" value={inwardData.packing_inward_date} onChange={handleChange} className={inputClass} />
//                     </div>

//                     {/* FITTER SEARCH (Same as Add) */}
//                     <div className="relative w-full">
//                         <label className="block text-sm font-semibold mb-1">Fitter Name</label>
//                         <input
//                             type="text"
//                             placeholder="Search fitter"
//                             value={fitterSearch}
//                             disabled={!!fitterId}
//                             onKeyDown={handleFitterKeyDown}
//                             onChange={(e) => handleFitterSearch(e.target.value)}
//                             className={`${inputClass} pr-10 ${fitterId ? "bg-gray-100 cursor-not-allowed" : ""}`}
//                         />
//                         <div className="absolute right-3 top-8.5 text-gray-500">
//                             {fitterLoading ? (
//                                 <AiOutlineLoading3Quarters className="animate-spin" />
//                             ) : fitterId ? (
//                                 <IoCloseCircleOutline size={22} className="cursor-pointer hover:text-red-500" onClick={removeFitter} />
//                             ) : (
//                                 <IoSearch size={18} className="text-gray-400" />
//                             )}
//                         </div>

//                         {showFitterDropdown && (
//                             <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
//                                 {fitters.length > 0 ? (
//                                     fitters.map((item, i) => (
//                                         <li
//                                             key={item.id}
//                                             onClick={() => selectFitter(item)}
//                                             className={`px-3 py-2 cursor-pointer text-sm transition-all ${activeFitterIndex === i ? "bg-primary text-white" : "hover:bg-secondary/10 text-gray-700"
//                                                 }`}
//                                         >
//                                             {item.name}
//                                         </li>
//                                     ))
//                                 ) : (
//                                     <li className="px-3 py-2 text-sm text-gray-400 text-center">No fitter found</li>
//                                 )}
//                             </ul>
//                         )}
//                     </div>

//                     {/* PRODUCT SELECT */}
//                     <div className="relative w-full">
//                         <label className="block text-sm font-semibold mb-1">Product Name</label>
//                         <select
//                             name="product_id"
//                             value={inwardData.product_id}
//                             disabled={!fitterId}
//                             onChange={async (e) => {
//                                 const productId = e.target.value;
//                                 const selected = products.find((row) => String(row.product.id) === String(productId));
//                                 if (!selected) return;
//                                 setInwardData(prev => ({ ...prev, product_id: selected.product.id }));
//                                 setExpectedGurus(selected.exp_gurus || 0);
//                                 const rateRes = await getMapperRatePerGurus(selected.product.id);
//                                 setRatePerGurus(rateRes?.rate_per_gurus || 0);
//                             }}
//                             className={`${inputClass} appearance-none pr-10 ${!fitterId ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}`}
//                         >
//                             <option value="">{fitterId ? (noProductFound ? "No product found" : "Select product") : "Select fitter first"}</option>
//                             {products.map((row) => (
//                                 <option key={row.product.id} value={row.product.id}>
//                                     {row.product.product_name} - {row.product.color || "All"} - {row.exp_gurus} Gurus
//                                 </option>
//                             ))}
//                         </select>
//                         <div className="pointer-events-none absolute inset-y-0 right-3 top-6 flex items-center text-gray-500">
//                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
//                         </div>
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Qty (Exp: {expectedGurus})</label>
//                         <input type="number" name="receive_gurus" value={inwardData.receive_gurus} onChange={handleChange} className={inputClass} />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Rate</label>
//                         <input type="text" value={ratePerGurus} disabled className={`${inputClass} bg-gray-100`} />
//                     </div>

//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Difference</label>
//                         <input type="text" value={difference} disabled className={`${inputClass} bg-gray-100`} />
//                     </div>
//                 </div>

//                 <div className="mb-4">
//                     <label className="block text-sm font-semibold mb-1">Remark</label>
//                     <textarea name="remark" value={inwardData.remark} rows={4} onChange={handleChange} className={inputClass} />
//                 </div>

//                 <div className="flex flex-row gap-4">
//                     <button type="button"
//                         onClick={() => router.back()}
//                         className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 cursor-pointer">Back
//                     </button>
//                     <button type="submit"
//                         disabled={updating}
//                         className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
//                         {updating ? "Updating..." : "Update"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditPackingInward;



// "use client";

// import {
//     updatePackingInward,
//     getPackingInwardById,
//     searchOutwardUser,
//     getPackingProductByFitterId,
//     getMapperRatePerGurus,
// } from "@/lib/fetcher";
// import Link from "next/link";
// import React, { useEffect, useState } from "react";
// import {
//     IoArrowBackOutline,
//     IoSearch,
//     IoCloseCircleOutline,
// } from "react-icons/io5";
// import { AiOutlineLoading3Quarters } from "react-icons/ai";
// import { toast } from "react-toastify";
// import { useRouter } from "next/router";
// import { useAuth } from "@/context/AuthContext";

// const inputClass =
//     "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

// const EditPackingInward = () => {
//     const router = useRouter();
//     const { id } = router.query;
//     const { user } = useAuth();

//     // ================= MAIN STATE =================
//     const [inwardData, setInwardData] = useState({
//         packing_inward_date: "",
//         fitter_id: "",
//         product_id: "",
//         receive_gurus: "",
//         remark: "",
//     });

//     const [difference, setDifference] = useState(0);
//     const [amount, setAmount] = useState(0);
//     const [updating, setUpdating] = useState(false);
//     const [expectedGurus, setExpectedGurus] = useState(0);
//     const [ratePerGurus, setRatePerGurus] = useState(0);
//     const [pageLoading, setPageLoading] = useState(true);

//     // ================= SEARCH & DROPDOWN STATE =================
//     const [fitterSearch, setFitterSearch] = useState("");
//     const [fitterId, setFitterId] = useState("");
//     const [fitters, setFitters] = useState([]);
//     const [showFitterDropdown, setShowFitterDropdown] = useState(false);
//     const [activeFitterIndex, setActiveFitterIndex] = useState(0);
//     const [fitterLoading, setFitterLoading] = useState(false);

//     const [products, setProducts] = useState([]);
//     const [noProductFound, setNoProductFound] = useState(false);

//     // ================= LOAD INITIAL DATA =================
//     useEffect(() => {
//         if (id && user?.id) {
//             fetchInwardDetails();
//         }
//     }, [id, user]);

//     const fetchInwardDetails = async () => {
//         try {
//             setPageLoading(true);
//             const res = await getPackingInwardById(id);
//             const data = res.data;

//             // 1. Set Fitter Details
//             setFitterSearch(data.fitter?.user_name || data.fitter?.name || "");
//             setFitterId(data.fitter?.id || "");
            
//             // 2. Fetch all products for this Fitter (Crucial for auto-select)
//             if (data.fitter?.id) {
//                 const prodRes = await getPackingProductByFitterId(data.fitter.id);
//                 setProducts(prodRes?.data || []);
//             }

//             // 3. Set Product & Rate Details
//             setExpectedGurus(data.exp_gurus || 0);
//             if (data.product?.id) {
//                 const rateRes = await getMapperRatePerGurus(data.product.id, user?.id);
//                 setRatePerGurus(rateRes?.rate_per_gurus || 0);
//             }

//             // 4. Fill Form Data
//             setInwardData({
//                 packing_inward_date: data.inward_date?.split("T")[0] || "",
//                 fitter_id: data.fitter?.id || "",
//                 product_id: data.product?.id || "",
//                 receive_gurus: data.receive_gurus || "",
//                 remark: data.remark || "",
//             });

//         } catch (err) {
//             console.error(err);
//             toast.error("Failed to load inward data");
//         } finally {
//             setPageLoading(false);
//         }
//     };

//     // ================= AUTO CALCULATE AMOUNT & DIFF =================
//     useEffect(() => {
//         const qty = Number(inwardData.receive_gurus || 0);
//         const rate = Number(ratePerGurus || 0);
//         setAmount(qty * rate);
//     }, [inwardData.receive_gurus, ratePerGurus]);

//     useEffect(() => {
//         const received = Number(inwardData.receive_gurus || 0);
//         const expected = Number(expectedGurus || 0);
//         setDifference(expected - received);
//     }, [inwardData.receive_gurus, expectedGurus]);

//     // ================= FITTER SEARCH LOGIC =================
//     const handleFitterSearch = async (value) => {
//         setFitterSearch(value);
//         if (!value.trim()) {
//             setFitters([]);
//             setShowFitterDropdown(false);
//             return;
//         }
//         setFitterLoading(true);
//         try {
//             const res = await searchOutwardUser(value);
//             setFitters(res?.data || []);
//             setActiveFitterIndex(0);
//             setShowFitterDropdown(true);
//         } catch (err) {
//             console.error(err);
//         } finally {
//             setFitterLoading(false);
//         }
//     };

//     const handleFitterKeyDown = (e) => {
//         if (!showFitterDropdown) return;
//         if (e.key === "ArrowDown") {
//             setActiveFitterIndex((prev) => (prev < fitters.length - 1 ? prev + 1 : prev));
//         } else if (e.key === "ArrowUp") {
//             setActiveFitterIndex((prev) => (prev > 0 ? prev - 1 : 0));
//         } else if (e.key === "Enter") {
//             e.preventDefault();
//             if (fitters[activeFitterIndex]) selectFitter(fitters[activeFitterIndex]);
//         } else if (e.key === "Escape") {
//             setShowFitterDropdown(false);
//         }
//     };

//   const selectFitter = async (fitter) => {
//      setFitterSearch(fitter.name);
//      setFitterId(fitter.id);
 
//      setInwardData((prev) => ({
//        ...prev,
//        fitter_id: fitter.id,
//        product_id: "",
//      }));
 
//      setProducts([]);
//      setExpectedGurus(0);
//      setNoProductFound(false);
//      setShowFitterDropdown(false);
 
//      try {
//        setUpdating(true);
 
//        const res = await getPackingProductByFitterId(fitter.id);
 
//        if (!res?.data || res.data.length === 0) {
//          setProducts([]);
//          setNoProductFound(true);
//          return;
//        }
 
//        setProducts(res.data);
//        setNoProductFound(false);
 
//      } catch (err) {
//        setProducts([]);
//        setNoProductFound(true);
//      } finally {
//        setUpdating(false);
//      }
//    };
 

//     const removeFitter = () => {
//         setFitterSearch("");
//         setFitterId("");
//         setProducts([]);
//         setExpectedGurus(0);
//         setRatePerGurus(0);
//         setInwardData((prev) => ({ ...prev, fitter_id: "", product_id: "", receive_gurus: "" }));
//     };

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setInwardData((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             setUpdating(true);
//             const payload = {
//                 ...inwardData,
//                 id,
//                 amount: amount
//             };
//             await updatePackingInward(payload);
//             toast.success("Updated successfully");
//             router.push("/packing/packing-inward");
//         } catch (err) {
//             toast.error(err.message || "Update failed");
//         } finally {
//             setUpdating(false);
//         }
//     };

//    if (pageLoading) {
//     return (
//       <div className="flex-1 flex items-center justify-center h-dvh bg-grey">
//         <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
//           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
//           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
//           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
//           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
//         </div>
//       </div>
//     );
//   }

//     return (
//         <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
//             <div className="flex flex-row justify-between items-center gap-3 mb-4">
//                 <h1 className="text-lg md:text-2xl font-semibold">Edit Packing Inward</h1>
//                 <Link href="/packing/packing-inward" className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg font-semibold">
//                     <IoArrowBackOutline size={18} /> Back
//                 </Link>
//             </div>

//             <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto">
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
//                     {/* DATE */}
//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Date</label>
//                         <input type="date" name="packing_inward_date" value={inwardData.packing_inward_date} onChange={handleChange} className={inputClass} />
//                     </div>

//                     {/* FITTER */}
//                     <div className="relative w-full">
//                         <label className="block text-sm font-semibold mb-1">Fitter Name</label>
//                         <input
//                             type="text"
//                             placeholder="Search fitter"
//                             value={fitterSearch}
//                             disabled={!!fitterId}
//                             onKeyDown={handleFitterKeyDown}
//                             onChange={(e) => handleFitterSearch(e.target.value)}
//                             className={`${inputClass} pr-10 ${fitterId ? "bg-gray-100 cursor-not-allowed" : ""}`}
//                         />
//                         <div className="absolute right-3 top-8.5 text-gray-500">
//                             {fitterLoading ? (
//                                 <AiOutlineLoading3Quarters className="animate-spin" />
//                             ) : fitterId ? (
//                                 <IoCloseCircleOutline size={22} className="cursor-pointer hover:text-red-500" onClick={removeFitter} />
//                             ) : (
//                                 <IoSearch size={18} className="text-gray-400" />
//                             )}
//                         </div>

//                         {showFitterDropdown && (
//                             <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
//                                 {fitters.length > 0 ? (
//                                     fitters.map((item, i) => (
//                                         <li
//                                             key={item.id}
//                                             onClick={() => selectFitter(item)}
//                                             className={`px-3 py-2 cursor-pointer text-sm transition-all ${activeFitterIndex === i ? "bg-primary text-white" : "hover:bg-secondary/10 text-gray-700"}`}
//                                         >
//                                             {item.name}
//                                         </li>
//                                     ))
//                                 ) : (
//                                     <li className="px-3 py-2 text-sm text-gray-400 text-center">No fitter found</li>
//                                 )}
//                             </ul>
//                         )}
//                     </div>

//                     {/* PRODUCT - AUTOMATICALLY POPULATED */}
//                     <div className="relative w-full">
//                         <label className="block text-sm font-semibold mb-1">Product Name</label>
//                         <select
//                             name="product_id"
//                             value={inwardData.product_id}
//                             disabled={!fitterId}
//                             onChange={async (e) => {
//                                 const productId = e.target.value;
//                                 const selected = products.find((row) => String(row.product.id) === String(productId));
//                                 if (!selected) return;
//                                 setInwardData(prev => ({ ...prev, product_id: selected.product.id }));
//                                 setExpectedGurus(Number(selected.exp_gurus || 0));
//                                 const rateRes = await getMapperRatePerGurus(selected.product.id, user?.id);
//                                 setRatePerGurus(rateRes?.rate_per_gurus || 0);
//                             }}
//                             className={`${inputClass} appearance-none pr-10 ${!fitterId ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}`}
//                         >
//                             <option value="">{fitterId ? (noProductFound ? "No product found" : "Select product") : "Select fitter first"}</option>
//                             {products.map((row) => (
//                                 <option key={row.product.id} value={row.product.id}>
//                                     {row.product.product_name} - {row.product.color || "All"} - {row.exp_gurus} Gurus
//                                 </option>
//                             ))}
//                         </select>
//                         <div className="pointer-events-none absolute inset-y-0 right-3 top-6 flex items-center text-gray-500">
//                             <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
//                         </div>
//                     </div>
//                 </div>

//                 {/* CALCULATED FIELDS GRID */}
//                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Qty (Exp: {expectedGurus})</label>
//                         <input type="number" name="receive_gurus" value={inwardData.receive_gurus} onChange={handleChange} className={inputClass} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Rate</label>
//                         <input type="text" value={ratePerGurus} disabled className={`${inputClass} bg-gray-100`} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Amount</label>
//                         <input type="text" value={amount} disabled className={`${inputClass} bg-gray-100`} />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-semibold mb-1">Difference</label>
//                         <input type="text" value={difference} disabled className={`${inputClass} bg-gray-100`} />
//                     </div>
//                 </div>

//                 <div className="mb-4">
//                     <label className="block text-sm font-semibold mb-1">Remark</label>
//                     <textarea name="remark" value={inwardData.remark} rows={4} onChange={handleChange} className={inputClass} />
//                 </div>

//                 <div className="flex flex-row gap-4">
//                     <button type="button" onClick={() => router.back()} className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer">Back</button>
//                     <button type="submit" disabled={updating} className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
//                         {updating ? "Updating..." : "Update"}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default EditPackingInward;


"use client";

import {
    updatePackingInward,
    getPackingInwardById,
    searchOutwardUser,
    getPackingProductByFitterId,
    getMapperRatePerGurus,
} from "@/lib/fetcher";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
    IoArrowBackOutline,
    IoSearch,
    IoCloseCircleOutline,
} from "react-icons/io5";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20";

const EditPackingInward = () => {
    const router = useRouter();
    const { id } = router.query;
    const { user } = useAuth();

    // ================= MAIN STATE =================
    const [inwardData, setInwardData] = useState({
        packing_inward_date: "",
        fitter_id: "",
        product_id: "",
        receive_gurus: "",
        remark: "",
    });

    const [difference, setDifference] = useState(0);
    const [amount, setAmount] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [expectedGurus, setExpectedGurus] = useState(0);
    const [ratePerGurus, setRatePerGurus] = useState(0);
    const [pageLoading, setPageLoading] = useState(true);

    // ================= SEARCH & DROPDOWN STATE =================
    const [fitterSearch, setFitterSearch] = useState("");
    const [fitterId, setFitterId] = useState("");
    const [fitters, setFitters] = useState([]);
    const [showFitterDropdown, setShowFitterDropdown] = useState(false);
    const [activeFitterIndex, setActiveFitterIndex] = useState(0);
    const [fitterLoading, setFitterLoading] = useState(false);

    const [products, setProducts] = useState([]);
    const [noProductFound, setNoProductFound] = useState(false);

    // ================= LOAD INITIAL DATA =================
    useEffect(() => {
        if (id && user?.id) {
            fetchInwardDetails();
        }
    }, [id, user]);

    const fetchInwardDetails = async () => {
        try {
            setPageLoading(true);
            const res = await getPackingInwardById(id);
            const data = res.data;

            // 1. Set Fitter Details
            setFitterSearch(data.fitter?.user_name || data.fitter?.name || "");
            setFitterId(data.fitter?.id || "");
            
            // 2. Fetch all products for this Fitter (Crucial for auto-select)
            if (data.fitter?.id) {
                const prodRes = await getPackingProductByFitterId(data.fitter.id);
                setProducts(prodRes?.data || []);
            }

            // 3. Set Product & Rate Details
            setExpectedGurus(data.exp_gurus || 0);
            if (data.product?.id) {
                const rateRes = await getMapperRatePerGurus(data.product.id, user?.id);
                setRatePerGurus(rateRes?.rate_per_gurus || 0);
            }

            // 4. Fill Form Data
            setInwardData({
                packing_inward_date: data.inward_date?.split("T")[0] || "",
                fitter_id: data.fitter?.id || "",
                product_id: data.product?.id || "",
                receive_gurus: data.receive_gurus || "",
                remark: data.remark || "",
            });

        } catch (err) {
            console.error(err);
            toast.error("Failed to load inward data");
        } finally {
            setPageLoading(false);
        }
    };

    // ================= AUTO CALCULATE AMOUNT & DIFF =================
    useEffect(() => {
        const qty = Number(inwardData.receive_gurus || 0);
        const rate = Number(ratePerGurus || 0);
        setAmount(qty * rate);
    }, [inwardData.receive_gurus, ratePerGurus]);

    useEffect(() => {
        const received = Number(inwardData.receive_gurus || 0);
        const expected = Number(expectedGurus || 0);
        setDifference(expected - received);
    }, [inwardData.receive_gurus, expectedGurus]);

    // ================= FITTER SEARCH LOGIC =================
    const handleFitterSearch = async (value) => {
        setFitterSearch(value);
        if (!value.trim()) {
            setFitters([]);
            setShowFitterDropdown(false);
            return;
        }
        setFitterLoading(true);
        try {
            const res = await searchOutwardUser(value);
            setFitters(res?.data || []);
            setActiveFitterIndex(0);
            setShowFitterDropdown(true);
        } catch (err) {
            console.error(err);
        } finally {
            setFitterLoading(false);
        }
    };

    const handleFitterKeyDown = (e) => {
        if (!showFitterDropdown) return;
        if (e.key === "ArrowDown") {
            setActiveFitterIndex((prev) => (prev < fitters.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setActiveFitterIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (fitters[activeFitterIndex]) selectFitter(fitters[activeFitterIndex]);
        } else if (e.key === "Escape") {
            setShowFitterDropdown(false);
        }
    };

  const selectFitter = async (fitter) => {
     setFitterSearch(fitter.name);
     setFitterId(fitter.id);
 
     setInwardData((prev) => ({
       ...prev,
       fitter_id: fitter.id,
       product_id: "",
     }));
 
     setProducts([]);
     setExpectedGurus(0);
     setNoProductFound(false);
     setShowFitterDropdown(false);
 
     try {
       setUpdating(true);
 
       const res = await getPackingProductByFitterId(fitter.id);
 
       if (!res?.data || res.data.length === 0) {
         setProducts([]);
         setNoProductFound(true);
         return;
       }
 
       setProducts(res.data);
       setNoProductFound(false);
 
     } catch (err) {
       setProducts([]);
       setNoProductFound(true);
     } finally {
       setUpdating(false);
     }
   };
 

    const removeFitter = () => {
        setFitterSearch("");
        setFitterId("");
        setProducts([]);
        setExpectedGurus(0);
        setRatePerGurus(0);
        setInwardData((prev) => ({ ...prev, fitter_id: "", product_id: "", receive_gurus: "" }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInwardData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const payload = {
                ...inwardData,
                id,
                amount: amount
            };
            await updatePackingInward(payload);
            toast.success("Updated successfully");
            router.push("/packing/packing-inward");
        } catch (err) {
            toast.error(err.message || "Update failed");
        } finally {
            setUpdating(false);
        }
    };

   if (pageLoading) {
    return (
      <div className="flex-1 flex items-center justify-center h-dvh bg-grey">
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
                <h1 className="text-lg md:text-2xl font-semibold">Edit Packing Inward</h1>
                <Link href="/packing/packing-inward" className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg font-semibold">
                    <IoArrowBackOutline size={18} /> Back
                </Link>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    {/* DATE */}
                    <div>
                        <label className="block text-sm font-semibold mb-1">Date</label>
                        <input type="date" name="packing_inward_date" value={inwardData.packing_inward_date} onChange={handleChange} className={inputClass} />
                    </div>

                    {/* FITTER */}
                    <div className="relative w-full">
                        <label className="block text-sm font-semibold mb-1">Fitter Name</label>
                        <input
                            type="text"
                            placeholder="Search fitter"
                            value={fitterSearch}
                            disabled={!!fitterId}
                            onKeyDown={handleFitterKeyDown}
                            onChange={(e) => handleFitterSearch(e.target.value)}
                            className={`${inputClass} pr-10 ${fitterId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                        />
                        <div className="absolute right-3 top-8.5 text-gray-500">
                            {fitterLoading ? (
                                <AiOutlineLoading3Quarters className="animate-spin" />
                            ) : fitterId ? (
                                <IoCloseCircleOutline size={22} className="cursor-pointer hover:text-red-500" onClick={removeFitter} />
                            ) : (
                                <IoSearch size={18} className="text-gray-400" />
                            )}
                        </div>

                        {showFitterDropdown && (
                            <ul className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-56 overflow-auto">
                                {fitters.length > 0 ? (
                                    fitters.map((item, i) => (
                                        <li
                                            key={item.id}
                                            onClick={() => selectFitter(item)}
                                            className={`px-3 py-2 cursor-pointer text-sm transition-all ${activeFitterIndex === i ? "bg-primary text-white" : "hover:bg-secondary/10 text-gray-700"}`}
                                        >
                                            {item.name}
                                        </li>
                                    ))
                                ) : (
                                    <li className="px-3 py-2 text-sm text-gray-400 text-center">No fitter found</li>
                                )}
                            </ul>
                        )}
                    </div>

                    {/* PRODUCT - AUTOMATICALLY POPULATED */}
                    <div className="relative w-full">
                        <label className="block text-sm font-semibold mb-1">Product Name</label>
                        <select
                            name="product_id"
                            value={inwardData.product_id}
                            disabled={!fitterId}
                            onChange={async (e) => {
                                const productId = e.target.value;
                                const selected = products.find((row) => String(row.product.id) === String(productId));
                                if (!selected) return;
                                setInwardData(prev => ({ ...prev, product_id: selected.product.id }));
                                setExpectedGurus(Number(selected.exp_gurus || 0));
                                const rateRes = await getMapperRatePerGurus(selected.product.id, user?.id);
                                setRatePerGurus(rateRes?.rate_per_gurus || 0);
                            }}
                            className={`${inputClass} appearance-none pr-10 ${!fitterId ? "bg-gray-100 cursor-not-allowed" : "cursor-pointer"}`}
                        >
                            <option value="">{fitterId ? (noProductFound ? "No product found" : "Select product") : "Select fitter first"}</option>
                            {products.map((row) => (
                                <option key={row.product.id} value={row.product.id}>
                                    {row.product.product_name} - {row.product.color || "All"} - {row.exp_gurus} Gurus
                                </option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 top-6 flex items-center text-gray-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    </div>
                </div>

                {/* CALCULATED FIELDS GRID */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Qty (Exp: {expectedGurus})</label>
                        <input type="number" name="receive_gurus" value={inwardData.receive_gurus} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Rate</label>
                        <input type="text" value={ratePerGurus} disabled className={`${inputClass} bg-gray-100`} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Amount</label>
                        <input type="text" value={amount} disabled className={`${inputClass} bg-gray-100`} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Difference</label>
                        <input type="text" value={difference} disabled className={`${inputClass} bg-gray-100`} />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-1">Remark</label>
                    <textarea name="remark" value={inwardData.remark} rows={4} onChange={handleChange} className={inputClass} />
                </div>

                <div className="flex flex-row gap-4">
                    <button type="button" onClick={() => router.back()} className="flex-1 text-secondary border-2 border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer">Back</button>
                    <button type="submit" disabled={updating} className="flex-1 py-2 rounded-lg bg-secondary text-white font-semibold hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
                        {updating ? "Updating..." : "Update"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditPackingInward;