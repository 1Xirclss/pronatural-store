

import express from "express";
import empleadosController from "../controllers/EmpleadosController.js";
import { validateAuthCookie } from "../middlewares/authMiddleware.js";

// Instanciar el router de Express para el módulo de empleados
const router = express.Router();

// Ruta raíz de empleados / (Protegida solo para el rol de Admin)
router.route("/")
  // GET: Obtener la lista de empleados
  .get(validateAuthCookie(["Admin"]), empleadosController.getEmpleados)
  // POST: Crear un nuevo registro de empleado
  .post(validateAuthCookie(["Admin"]), empleadosController.createEmpleado);

// Rutas individuales por ID de empleado /:id (Protegidas para Admin)
router.route("/:id")
  // GET: Obtener el detalle de un empleado
  .get(validateAuthCookie(["Admin"]), empleadosController.getEmpleadoById)
  // PUT: Editar los datos de un empleado
  .put(validateAuthCookie(["Admin"]), empleadosController.updateEmpleado)
  // DELETE: Remover a un empleado del sistema
  .delete(validateAuthCookie(["Admin"]), empleadosController.deleteEmpleado);

// Exportar el router de empleados
export default router;
