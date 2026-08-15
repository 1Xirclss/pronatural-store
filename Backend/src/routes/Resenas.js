

import express from "express";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";
import reviewsController from "../controllers/ResenasController.js";

// Instanciar el router de Express para reseñas
const router = express.Router();

// Ruta raíz / para lista y creación pública de reseñas
router
  .route("/")
  // GET: Obtener las reseñas visibles
  .get(reviewsController.getReviews)
  // POST: Publicar una nueva reseña de cliente
  .post(reviewsController.createReview);

// Ruta /:id para eliminación administrativa
router
  .route("/:id")
  // DELETE: Eliminar una reseña (requiere autenticación con rol de Admin o Employee)
  .delete(validateAuthCookie(["Admin", "Employee"]), reviewsController.deleteReview);

// Exportar el enrutador de reseñas
export default router;
