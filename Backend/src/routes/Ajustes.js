

import express from "express";
import controladoresAjustes from "../controllers/AjustesController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

// Instanciar el enrutador de Express
const router = express.Router();

// Ruta principal de ajustes /
router
  .route("/")
  // GET: Obtener la configuración actual del sistema
  .get(controladoresAjustes.getConfig)
  // PUT: Actualizar los ajustes del sistema (requiere rol de Admin o Employee)
  .put(validateAuthCookie(["Admin", "Employee"]), controladoresAjustes.updateConfig);

// Ruta para forzar la generación y envío del reporte de inventario por correo
router
  .route("/send-report")
  // POST: Generar PDF y enviar por correo al administrador
  .post(validateAuthCookie(["Admin", "Employee"]), controladoresAjustes.sendInventoryReport);

// Exportar el enrutador de ajustes
export default router;
