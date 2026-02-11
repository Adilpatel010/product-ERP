import { getProductBomByProductId } from "@/services/product.service";

export default async function handler(req, res) {
  try {
    const { id } = req.query; 

    const data = await getProductBomByProductId({
      product_id: id,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    });
  }
}
