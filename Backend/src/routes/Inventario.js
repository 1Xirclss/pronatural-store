

import { Router } from "express";
import inventoryController from "../controllers/InventarioController.js";

// Crear router de Express para el control de inventario
const router = Router();

// GET / - Obtener los registros de movimientos de inventario
router.get("/", inventoryController.getInventory);

// PUT /:id - Actualizar la cantidad de stock de un producto directamente
router.put("/:id", inventoryController.updateStock);

// POST /:id/reorder - Registrar un reabastecimiento de existencias para un producto
router.post("/:id/reorder", inventoryController.reorderProduct);

// Exportar el enrutador de inventario
export default router;
