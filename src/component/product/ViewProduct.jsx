// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { IoArrowBackOutline } from "react-icons/io5";
// import { getProductById } from "@/lib/fetcher";
// import { toast } from "react-toastify";
// import { useRouter } from "next/router";

// const inputClass =
//     "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:ring-0 bg-gray-100 cursor-not-allowed transition-all";

// const ViewProduct = () => {
//     const router = useRouter();
//     const { id } = router.query;

//     const [loading, setLoading] = useState(true);

//     const [product, setProduct] = useState({
//         productName: "",
//         colorType: "all",
//         customColor: "",
//         gurusWeight: "",
//         pcsInGurus: "",
//         lotInBag: "",
//         bagWeightKg: "",
//         lotInKg: "",
//         totalGurusLot: "",
//     });
//     const loadProduct = async () => {
//         try {
//             const res = await getProductById(id);
//             const data = res.data;
//             setProduct({
//                 productName: data.product_name || "",
//                 colorType: data.color_type || "all",
//                 customColor: data.color || "",
//                 gurusWeight: String(data.gurus_weight_gm ?? ""),
//                 pcsInGurus: String(data.pcs_in_gurus ?? ""),
//                 lotInBag: String(data.lot_in_bag ?? ""),
//                 bagWeightKg: String(data.bag_weight_kg ?? ""),
//                 lotInKg: String(data.lot_in_kg ?? ""),
//                 totalGurusLot: String(data.total_gurus_lot ?? ""),
//             });
//         } catch (err) {
//             toast.error(err.message || "Failed to load product");
//             router.push("/product");
//         } finally {
//             setLoading(false);
//         }
//     };
//     /* ================= LOAD PRODUCT ================= */
//     useEffect(() => {
//         if (!id) return;
//         loadProduct();
//     }, [id]);

//     if (loading) {
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
//             {/* HEADER */}
//             <div className="flex justify-between items-center mb-4">
//                 <h1 className="text-lg md:text-2xl font-semibold">
//                     View Product
//                 </h1>
//                 <Link
//                     href="/product"
//                     className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
//                 >
//                     <IoArrowBackOutline size={18} />
//                     Back
//                 </Link>
//             </div>


//             <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden">
//                 <form className="grid grid-cols-12 gap-4">
//                     {/* Product Name */}
//                     <div
//                         className={`col-span-12 ${product.colorType === "custom"
//                             ? "md:col-span-4"
//                             : "md:col-span-6"
//                             }`}
//                     >
//                         <label className="text-sm font-medium mb-1 block">
//                             Product Name
//                         </label>
//                         <input
//                             type="text"
//                             name="productName"
//                             disabled
//                             value={product.productName}
//                             className={inputClass}
//                         />
//                     </div>
//                     <div
//                         className={`col-span-12 relative ${product.colorType === "custom"
//                             ? "md:col-span-4"
//                             : "md:col-span-6"
//                             }`}
//                     >
//                         <label className="text-sm font-medium mb-1 block">
//                             Color
//                         </label>
//                         <input
//                             type="text"
//                             name="colorType"
//                             disabled
//                             value={product.colorType}
//                             className={inputClass}
//                         />
//                     </div>

//                     {product.colorType === "custom" && (
//                         <div className="col-span-12 md:col-span-4">
//                             <label className="text-sm font-medium mb-1 block">
//                                 Custom Color
//                             </label>
//                             <input
//                                 type="text"
//                                 name="customColor"
//                                 disabled
//                                 value={product.customColor}
//                                 className={inputClass}
//                             />
//                         </div>
//                     )}

//                     {/* PCS in Gurus */}
//                     <div className="col-span-12 md:col-span-4">
//                         <label className="text-sm font-medium mb-1 block">
//                             PCS in Gurus
//                         </label>
//                         <input
//                             type="number"
//                             name="pcsInGurus"
//                             disabled
//                             value={product.pcsInGurus}
//                             className={inputClass}
//                         />
//                     </div>

//                     {/* Gurus Weight */}
//                     <div className="col-span-12 md:col-span-4">
//                         <label className="text-sm font-medium mb-1 block">
//                             Gurus Weight (gm)
//                         </label>
//                         <input
//                             type="text"
//                             name="gurusWeight"
//                             disabled
//                             value={product.gurusWeight}
//                             placeholder="e.g. 500"
//                             className={inputClass}
//                         />
//                     </div>

//                     {/* Lot in Bag */}
//                     <div className="col-span-12 md:col-span-4">
//                         <label className="text-sm font-medium mb-1 block">
//                             Lot in Bag
//                         </label>
//                         <input
//                             type="number"
//                             name="lotInBag"
//                             disabled
//                             value={product.lotInBag}
//                             className={inputClass}
//                         />
//                     </div>

//                     {/* Bag Weight */}
//                     <div className="col-span-12 md:col-span-4">
//                         <label className="text-sm font-medium mb-1 block">
//                             Bag Weight (kg)
//                         </label>
//                         <input
//                             type="number"
//                             name="bagWeightKg"
//                             disabled
//                             value={product.bagWeightKg}
//                             className={inputClass}
//                         />
//                     </div>

//                     <div className="col-span-12 md:col-span-4">
//                         <label className="text-sm font-medium mb-1 block">
//                             Lot in KG
//                         </label>
//                         <input
//                             type="text"
//                             value={product.lotInKg}
//                             disabled
//                             className={`${inputClass} bg-gray-100`}
//                         />
//                     </div>

//                     <div className="col-span-12 md:col-span-4">
//                         <label className="text-sm font-medium mb-1 block">
//                             Total Gurus in Lot
//                         </label>
//                         <input
//                             type="text"
//                             value={product.totalGurusLot}
//                             disabled
//                             className={`${inputClass} bg-gray-100`}
//                         />
//                     </div>

//                     <div className="col-span-12 flex gap-4 mt-4">
//                         <button
//                             type="button"
//                             onClick={() => router.push("/product")}
//                             className="flex-1 text-secondary border-2 border-gray-300 py-2 cursor-pointer rounded-lg font-semibold hover:bg-gray-50"
//                         >
//                             Back
//                         </button>
//                     </div>

//                 </form>
//             </div>
//         </div>
//     );
// };

// export default ViewProduct;


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IoArrowBackOutline } from "react-icons/io5";
import { getProductById } from "@/lib/fetcher";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const inputClass =
    "w-full px-2.5 py-2 text-sm rounded-md border-2 border-gray-300 focus:outline-none focus:ring-0 bg-gray-100 cursor-not-allowed transition-all";

const createBomRow = () => ({
    raw_product: "",
    raw_product_id: null,
    qty: "",
    searchResults: [],
    loading: false,
    showDropdown: false,
    activeIndex: -1,
});

const ViewProduct = () => {
    const router = useRouter();
    const { id } = router.query;

    const [loading, setLoading] = useState(true);

    const [product, setProduct] = useState({
        productName: "",
        colorType: "all",
        customColor: "",
        gurusWeight: "",
        pcsInGurus: "",
        lotInBag: "",
        bagWeightKg: "",
        lotInKg: "",
        totalGurusLot: "",
    });

    const [bomRows, setBomRows] = useState([createBomRow()]);

    /* ================= LOAD PRODUCT ================= */
    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                const res = await getProductById(id);
                const data = res.data;

                setProduct({
                    productName: data.product_name,
                    colorType: data.color_type,
                    customColor: data.color || "",
                    gurusWeight: String(data.gurus_weight_gm),
                    pcsInGurus: String(data.pcs_in_gurus),
                    lotInBag: String(data.lot_in_bag),
                    bagWeightKg: String(data.bag_weight_kg),
                    lotInKg: String(data.lot_in_kg),
                    totalGurusLot: String(data.total_gurus_lot),
                });

                const mappedBom =
                    data.bom?.map((b) => ({
                        raw_product: b.raw_product_name,
                        raw_product_id: b.raw_product_id,
                        qty: String(b.qty),
                        searchResults: [],
                        loading: false,
                        showDropdown: false,
                        activeIndex: -1,
                    })) || [];


                setBomRows(mappedBom.length ? mappedBom : [createBomRow()]);

            } catch (e) {
                toast.error("Failed to load product");
                router.push("/product");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    useEffect(() => {
        const lotInKgRaw =
            Number(product.lotInBag) * Number(product.bagWeightKg);

        const lotInKg =
            lotInKgRaw
                ? Number(lotInKgRaw.toFixed(2))
                : "";

        const totalGurus =
            product.gurusWeight && lotInKg
                ? Math.floor((lotInKg * 1000) / Number(product.gurusWeight))
                : "";

        setProduct((prev) => ({
            ...prev,
            lotInKg,
            totalGurusLot: totalGurus,
        }));
    }, [product.lotInBag, product.bagWeightKg, product.gurusWeight]);


    if (loading) {
        return (
            <div className="flex-1 bg-grey flex items-center justify-center">
                <div className="flex items-center justify-center h-full w-full">
                    <div className="relative w-12 h-12 animate-spin [animation-duration:1.5s]">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full animate-pulse" />
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/70 rounded-full animate-pulse [animation-delay:200ms]" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary/40 rounded-full animate-pulse [animation-delay:400ms]" />
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary/20 rounded-full animate-pulse [animation-delay:600ms]" />
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="flex-1 pt-16 lg:pt-4 bg-grey h-dvh flex flex-col px-4 sm:px-6 py-4 overflow-hidden">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg md:text-2xl font-semibold">
                    View Product
                </h1>
                <Link
                    href="/product"
                    className="px-4 py-2 bg-secondary text-sm flex items-center gap-1.5 text-white rounded-lg hover:bg-primary font-semibold w-fit"
                >
                    <IoArrowBackOutline size={18} />
                    Back
                </Link>
            </div>


            <div className="flex-1 bg-white rounded-2xl shadow-sm p-4 sm:p-5 overflow-y-auto overflow-x-hidden">
                <form className="grid grid-cols-12 gap-4">
                    {/* Product Name */}
                    <div
                        className={`col-span-12 ${product.colorType === "custom"
                            ? "md:col-span-4"
                            : "md:col-span-6"
                            }`}
                    >
                        <label className="text-sm font-medium mb-1 block">
                            Product Name
                        </label>
                        <input
                            type="text"
                            name="productName"
                            value={product.productName}
                            disabled
                            className={inputClass}
                        />
                    </div>
                    <div
                        className={`col-span-12 relative ${product.colorType === "custom"
                            ? "md:col-span-4"
                            : "md:col-span-6"
                            }`}
                    >
                        <label className="text-sm font-medium mb-1 block">
                            Color
                        </label>

                        <select
                            name="colorType"
                            value={product.colorType}
                            disabled
                            className={`${inputClass} pr-10 cursor-pointer appearance-none`}
                        >
                            <option value="all">All Color</option>
                            <option value="custom">Custom</option>
                        </select>

                        <div className="pointer-events-none absolute top-[36px] right-3 flex items-center text-gray-500">
                            <svg
                                className="h-4 w-4"
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
                        </div>
                    </div>

                    {product.colorType === "custom" && (
                        <div className="col-span-12 md:col-span-4">
                            <label className="text-sm font-medium mb-1 block">
                                Custom Color
                            </label>
                            <input
                                type="text"
                                name="customColor"
                                value={product.customColor}

                                disabled
                                className={inputClass}
                            />
                        </div>
                    )}

                    {/* PCS in Gurus */}
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium mb-1 block">
                            PCS in Gurus
                        </label>
                        <input
                            type="number"
                            name="pcsInGurus"
                            value={product.pcsInGurus}
                            disabled
                            className={inputClass}
                        />
                    </div>

                    {/* Gurus Weight */}
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium mb-1 block">
                            Gurus Weight (gm)
                        </label>
                        <input
                            type="text"
                            name="gurusWeight"
                            value={product.gurusWeight}
                            disabled
                            placeholder="e.g. 500"
                            className={inputClass}
                        />
                    </div>

                    {/* Lot in Bag */}
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium mb-1 block">
                            Lot in Bag
                        </label>
                        <input
                            type="number"
                            name="lotInBag"
                            value={product.lotInBag}
                            disabled
                            className={inputClass}
                        />
                    </div>

                    {/* Bag Weight */}
                    <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium mb-1 block">
                            Bag Weight (kg)
                        </label>
                        <input
                            type="number"
                            name="bagWeightKg"
                            value={product.bagWeightKg}
                            disabled
                            className={inputClass}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium mb-1 block">
                            Lot in KG
                        </label>
                        <input
                            type="text"
                            value={product.lotInKg}
                            disabled
                            className={`${inputClass} bg-gray-100`}
                        />
                    </div>

                    <div className="col-span-12 md:col-span-4">
                        <label className="text-sm font-medium mb-1 block">
                            Total Gurus in Lot
                        </label>
                        <input
                            type="text"
                            value={product.totalGurusLot}
                            disabled
                            className={`${inputClass} bg-gray-100`}
                        />
                    </div>

                    {/* ================= BOM ================= */}
                    <div className="col-span-12 mt-6 border-2 border-gray-200 rounded-xl p-4">
                        <h2 className="text-md font-semibold mb-3 text-gray-700">
                            Bill of Materials (BOM)
                        </h2>
                        <div className="hidden md:grid grid-cols-12 gap-3 items-center mb-1">
                            <div className="col-span-6">
                                <label className="hidden text-sm font-semibold text-gray-700 mb-1">
                                    Raw Product
                                </label>
                            </div>
                            <div className="col-span-3">
                                <label className="hidden text-sm font-semibold text-gray-700 mb-1">
                                    Qty Required in Gross
                                </label>
                            </div>
                        </div>
                        <div className="space-y-3">
                            {bomRows.map((row, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-12 gap-3 items-center mb-2"
                                >
                                    {/* RAW PRODUCT NAME */}
                                    <div className="col-span-6">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Raw Product
                                        </label>
                                        <input
                                            type="text"
                                            value={row.raw_product}
                                            disabled
                                            className={inputClass}
                                        />
                                    </div>

                                    {/* QTY */}
                                    <div className="col-span-6">
                                        <label className="text-sm font-semibold text-gray-700 mb-1">
                                            Qty in Gross
                                        </label>
                                        <input
                                            type="text"
                                            value={row.qty}
                                            disabled
                                            className={inputClass}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="col-span-12 flex gap-4 mt-4">
                        <button
                            type="button"
                            onClick={() => router.push("/product")}
                            className="flex-1 text-secondary border-2 border-gray-300 py-2 cursor-pointer rounded-lg font-semibold hover:bg-gray-50"
                        >
                            Back
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default ViewProduct;
