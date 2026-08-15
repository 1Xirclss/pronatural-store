

import express from "express";
import recoveryAdminController from "../controllers/recoveryAdminController.js";

// Instanciar router para recuperación de contraseñas de administradores / empleados
const router = express.Router();

// POST /requestCode - Solicitar código de recuperación por correo
router.post("/requestCode", recoveryAdminController.requestCode);

// POST /verifyCode - Comprobar si el código ingresado coincide con el enviado
router.post("/verifyCode", recoveryAdminController.verifyCode);

// POST /newPassword - Guardar la nueva contraseña de acceso
router.post("/newPassword", recoveryAdminController.newPassword);

// Exportar el enrutador de recuperación administrativa
export default router;
