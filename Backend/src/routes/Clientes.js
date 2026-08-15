import express from "express";
import clientesController from "../controllers/ClientesController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

// Definir el router de Express para el manejo de endpoints de clientes
const router = express.Router();

// Rutas raíz para clientes / protegidas para usuarios con rol Admin o Employee
router.route("/")
    // GET: Obtener la lista completa de clientes registrados
    .get(validateAuthCookie(["Admin", "Employee"]), clientesController.getClientes)
    // POST: Registrar un nuevo cliente desde el panel de administración
    .post(validateAuthCookie(["Admin", "Employee"]), clientesController.createCliente);

// Rutas con identificador dinámico /:id protegidas con autenticación
router.route("/:id")
    // PUT: Actualizar la información de un cliente específico
    .put(validateAuthCookie(["Admin", "Employee"]), clientesController.updateClientes)
    // DELETE: Eliminar un cliente por su ID de MongoDB
    .delete(validateAuthCookie(["Admin", "Employee"]), clientesController.deleteClientes);

// Exportar el enrutador de clientes
export default router;