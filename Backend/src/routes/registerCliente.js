

import express from "express";
import registerClientesController from "../controllers/registerClientesController.js";

// Instanciar router para el registro público de clientes
const router = express.Router();

// POST / - Registrar datos iniciales de cliente y enviar código por correo
router.route("/").post(registerClientesController.register);

// POST /verifyCodeEmail - Verificar el código recibido en el correo y confirmar registro
router.route("/verifyCodeEmail").post(registerClientesController.verifyCode);

// Exportar el enrutador de registro de clientes
export default router;