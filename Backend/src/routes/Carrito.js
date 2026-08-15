

import { Router } from "express";
import carritoController from "../controllers/CarritoController.js";

// Instanciar el enrutador para el carrito de compras
const router = Router();

// GET /:sessionId - Obtener o crear el carrito asociado a un identificador de sesión
router.get("/:sessionId", carritoController.getCarrito);

// POST /:sessionId/sync - Sincronizar el contenido del carrito con los productos del cliente
router.post("/:sessionId/sync", carritoController.syncCarrito);

// DELETE /:sessionId - Vaciar por completo los elementos del carrito de compras
router.delete("/:sessionId", carritoController.vaciarCarrito);

// Exportar el enrutador de carrito
export default router;
