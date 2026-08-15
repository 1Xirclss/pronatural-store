import carritoModel from "../models/Carrito.js";
import productsModel from "../models/Productos.js";

const carritoController = {};

// Obtener o crear carrito por sessionId
carritoController.getCarrito = async (req, res) => {
  try {
    const { sessionId } = req.params;
    let carrito = await carritoModel.findOne({ sessionId }).populate("productos.productId", "nombreProducto precio imagenProducto stock");
    
    if (!carrito) {
      carrito = new carritoModel({ sessionId, productos: [] });
      await carrito.save();
    }
    
    res.status(200).json(carrito);
  } catch (error) {
    console.error("Error al obtener carrito:", error);
    res.status(500).json({ message: "Error al obtener carrito" });
  }
};

// Sincronizar el contenido completo del carrito
carritoController.syncCarrito = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { productos } = req.body;

    let carrito = await carritoModel.findOne({ sessionId });
    
    if (!carrito) {
      carrito = new carritoModel({ sessionId, productos: [] });
    }

    const productList = Array.isArray(productos) 
      ? productos 
      : (Array.isArray(req.body) ? req.body : (req.body?.items || []));

    const validProducts = [];
    if (Array.isArray(productList)) {
      for (const item of productList) {
        const targetId = item.productId || item.id || item._id;
        if (!targetId) continue;
        try {
          const product = await productsModel.findById(targetId);
          if (product) {
            validProducts.push({
              productId: product._id,
              quantity: Math.max(1, Number(item.quantity) || 1)
            });
          }
        } catch (err) {
          // Ignorar IDs inválidos de Mongoose
        }
      }
    }

    carrito.productos = validProducts;
    await carrito.save();
    
    const populatedCarrito = await carritoModel.findById(carrito._id).populate("productos.productId", "nombreProducto precio imagenProducto stock");
    res.status(200).json(populatedCarrito);
  } catch (error) {
    console.error("Error al sincronizar carrito:", error);
    res.status(500).json({ message: "Error al sincronizar carrito" });
  }
};

// Vaciar los productos del carrito
carritoController.vaciarCarrito = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await carritoModel.findOneAndUpdate({ sessionId }, { productos: [] });
    res.status(200).json({ message: "Carrito vaciado" });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res.status(500).json({ message: "Error al vaciar carrito" });
  }
};

export default carritoController;
