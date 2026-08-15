

import express from "express";
import recoveryPasswordController from "../controllers/recoveryPasswordController.js";

// Instanciar router para la recuperación de contraseña de clientes
const router = express.Router();

// POST /requestCode - Solicitar código de verificación para cliente
router.route("/requestCode").post(recoveryPasswordController.requestCode);

// POST /verifyCode - Validar el código de recuperación ingresado por el cliente
router.route("/verifyCode").post(recoveryPasswordController.verifyCode);

// POST /newPassword - Registrar la nueva contraseña del cliente
router.route("/newPassword").post(recoveryPasswordController.newPassword);

// Exportar enrutador de recuperación de contraseña de clientes
export default router;