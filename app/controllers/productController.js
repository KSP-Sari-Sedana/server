import productRepository from "../repositories/productRepository.js";

async function get(req, res) {
  const products = await productRepository.findAll();
  res.status(200).json({ statusCode: 200, message: "Sukses mendapatkan semua produk", data: products });
}

export default { get };
