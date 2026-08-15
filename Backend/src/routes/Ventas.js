

import express from "express";
import salesController from "../controllers/VentasController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

// Instanciar el router de Express para el módulo de ventas
const router = express.Router();

// Ruta raíz de ventas /
router
  .route("/")
  // GET: Obtener todas las ventas registradas (requiere rol de Admin)
  .get(validateAuthCookie(["Admin"]), salesController.getSales)
  // POST: Registrar una nueva venta
  .post(salesController.insertSale);

// Ruta para obtener el resumen de métricas generales de ventas
router
  .route("/summary")
  // GET: Resumen de ventas (acceso para Admin)
  .get(validateAuthCookie(["Admin"]), salesController.getSalesSummary);

// Ruta para consultar ventas filtradas por un rango de fechas
router
  .route("/date-range")
  // POST: Filtrar por fechas inicio y fin
  .post(validateAuthCookie(["Admin"]), salesController.getSalesByDateRange);

// Rutas individuales por ID de venta /:id
router
  .route("/:id")
  // GET: Consultar detalle de la venta (Admin o Employee)
  .get(validateAuthCookie(["Admin", "Employee"]), salesController.getSaleById)
  // PUT: Actualizar estado o notas de la venta (Admin)
  .put(validateAuthCookie(["Admin"]), salesController.updateSaleStatus)
  // DELETE: Eliminar un registro de venta (Admin)
  .delete(validateAuthCookie(["Admin"]), salesController.deleteSale);

// Ruta para enviar factura digital por correo
router
  .route("/:id/invoice")
  // POST: Enviar recibo por email al cliente (Admin o Employee)
  .post(validateAuthCookie(["Admin", "Employee"]), salesController.sendInvoiceEmail);

// Exportar el router de ventas
export default router;
