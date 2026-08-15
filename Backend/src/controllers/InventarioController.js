import productsModel from "../models/Productos.js";

const inventoryController = {};

inventoryController.getInventory = async (req, res) => {
  return res.status(200).json([]);
};

inventoryController.updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    const parsedStock = Number(stock);
    if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      return res.status(400).json({ message: "El stock debe ser un número entero mayor o igual a cero (0)." });
    }
    const product = await productsModel.findByIdAndUpdate(
      id,
      { stock: parsedStock },
      { returnDocument: 'after' }
    );
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });
    
    return res.status(200).json({ message: "Stock de inventario actualizado exitosamente", product });
  } catch (error) {
    console.error("Error al actualizar stock de inventario:", error);
    return res.status(500).json({ message: "Error interno al actualizar stock." });
  }
};

inventoryController.reorderProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !Number.isInteger(parsedAmount)) {
      return res.status(400).json({ message: "La cantidad a reabastecer debe ser un número entero mayor a cero (0)." });
    }
    const product = await productsModel.findById(id);
    if (!product) return res.status(404).json({ message: "Producto no encontrado." });
    
    product.stock = (product.stock || 0) + parsedAmount;
    await product.save();
    
    return res.status(200).json({ message: "Reabastecimiento realizado con éxito.", product });
  } catch (error) {
    console.error("Error al reabastecer inventario:", error);
    return res.status(500).json({ message: "Error interno al reabastecer inventario." });
  }
};

export default inventoryController;
