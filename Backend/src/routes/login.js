

import express from "express";
import loginClientesController from "../controllers/login.js";

// Instanciar router para inicio de sesión de clientes
const router = express.Router();

// POST / - Iniciar sesión de cliente comprobando credenciales y generando cookie de sesión
router.route("/").post(loginClientesController.login);

// Exportar el enrutador de login
export default router;