

import express from "express";
import categoriesController from "../controllers/CategoriasController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

// Inicializar el enrutador de Express
const router = express.Router();

// Ruta raíz de categorías /
router
  .route("/")
  // GET: Consultar el listado completo de categorías
  .get(categoriesController.getCategories)
  // POST: Registrar una nueva categoría (restringido únicamente al rol de Admin)
  .post(
    validateAuthCookie(["Admin"]),
    categoriesController.insertCategory
  );

// Ruta para obtener solo categorías con estado activo (para la tienda pública)
router
  .route("/active")
  // GET: Obtener categorías activas (accesible para Admin y Clientes)
  .get(
    validateAuthCookie(["Admin", "Customer"]),
    categoriesController.getActiveCategories
  );

// Ruta con parámetro ID para operaciones individuales
router
  .route("/:id")
  // GET: Obtener el detalle de una categoría por su ID
  .get(validateAuthCookie(["Admin"]), categoriesController.getCategoryById)
  // PUT: Modificar datos de una categoría existente
  .put(validateAuthCookie(["Admin"]), categoriesController.updateCategory)
  // DELETE: Eliminar por completo una categoría
  .delete(validateAuthCookie(["Admin"]), categoriesController.deleteCategory);

// Ruta para alternar el estado activo/inactivo de una categoría sin borrarla
router
  .route("/:id/toggle")
  // PATCH: Cambiar estado de la categoría
  .patch(validateAuthCookie(["Admin"]), categoriesController.toggleCategory);

// Exportar enrutador de categorías
export default router;
