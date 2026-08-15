

import { Router } from "express";
import authController from "../controllers/authController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

// Instanciar el router de autenticación
const router = Router();

// POST /register - Registro inicial de administradores / vendedores
router.route("/register").post(authController.register);

// POST /verifyCode - Verificación del código enviado por correo
router.route("/verifyCode").post(authController.verifyCode);

// POST /login - Inicio de sesión unificado (Admin, Empleado, Cliente)
router.route("/login").post(authController.login);

// POST /logout - Cierre de sesión y limpieza de cookies
router.route("/logout").post(authController.logout);

// POST /forceChangePassword - Cambio de contraseña obligatorio en primer inicio de sesión
router.route("/forceChangePassword").post(authController.forceChangePassword);

// POST /changePassword - Cambio voluntario de contraseña desde el perfil (requiere estar autenticado)
router.route("/changePassword").post(validateAuthCookie(["Admin", "Employee", "Customer"]), authController.changePassword);

// Exportar el enrutador de autenticación
export default router;
