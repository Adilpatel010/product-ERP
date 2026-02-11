import { searchProduct } from "@/services/product.service";


export default async function handler(req, res) {
  try {
    const { search } = req.query;
    const trimSearch = search.trim();
    const products = await searchProduct(trimSearch);

    return res.status(200).json({
      success: true,
      data: products.map(p => ({
        id: p.id,
        name: p.product_name,
        color: p.color,
        total_gurus_lot: p.total_gurus_lot,
      })),
    });
  } catch (err) {
    console.error("Product search error:", err);
    return res.status(500).json({
      success: false,
      data: [],
    });
  }
}
