

import express from "express";
import logoutController from "../controllers/logoutController.js";

// Instanciar router para cierre de sesión
const router = express.Router();

// POST / - Cerrar la sesión eliminando las cookies de autenticación
router.route("/").post(logoutController.logout);

// Exportar el enrutador de logout
export default router;