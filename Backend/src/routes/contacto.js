

import { Router } from "express";
import contactoController from "../controllers/contactoController.js";

// Instanciar el router para mensajes del formulario de contacto
const router = Router();

// POST / - Enviar un mensaje desde el formulario de contacto de la tienda al correo del administrador
router.post("/", contactoController.sendMessage);

// Exportar el enrutador de contacto
export default router;
