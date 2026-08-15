import empleadosModel from "../models/Empleados.js";
import bcrypt from "bcryptjs";

// Objeto que agrupa los controladores de empleados
const empleadosController = {};

// Función para obtener la lista de todos los empleados
empleadosController.getEmpleados = async (req, res) => {
  try {
    // Buscar todos los empleados en la base de datos ordenados por fecha
    const empleados = await empleadosModel.find().sort({ createdAt: -1 });

    // Mapear los datos para enviarlos con la estructura que espera el frontend
    const mapped = empleados.map(e => ({
      id: e._id,
      name: e.nombre || '',
      lastName: e.apellido || '',
      role: e.cargo || 'Employee',
      phone: e.telefono || '',
      email: e.correo || '',
      password: "", // No enviamos la contraseña por seguridad
      salary: typeof e.salario === 'number' ? e.salario : 0,
      birthdate: e.fechaNacimiento ? e.fechaNacimiento.toISOString().split('T')[0] : (e.birthdate || '')
    }));

    // Retornar la lista con código de éxito 200
    return res.status(200).json(mapped);
  } catch (error) {
    // Imprimir el error en consola si falla la consulta
    console.error("Error al obtener la lista de empleados:", error);
    return res.status(500).json({ message: "Error interno al consultar empleados." });
  }
};

// Función para obtener un solo empleado por su ID
empleadosController.getEmpleadoById = async (req, res) => {
  try {
    // Obtener el id desde los parámetros de la URL
    const { id } = req.params;

    // Buscar en la base de datos por el id único
    const e = await empleadosModel.findById(id);

    // Si el empleado no existe, responder con estado 404
    if (!e) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    // Formatear los datos del empleado encontrado
    const mapped = {
      id: e._id,
      name: e.nombre,
      lastName: e.apellido,
      role: e.cargo,
      phone: e.telefono,
      email: e.correo,
      password: "",
      salary: e.salario,
      birthdate: e.fechaNacimiento ? e.fechaNacimiento.toISOString().split('T')[0] : ''
    };

    // Devolver el empleado encontrado
    return res.status(200).json(mapped);
  } catch (error) {
    // Manejar errores de servidor
    console.error("Error al obtener empleado por ID:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Función para registrar un nuevo empleado
empleadosController.createEmpleado = async (req, res) => {
  try {
    // Extraer los datos enviados en el cuerpo de la petición
    let { name, lastName, role, phone, email, password, salary, birthdate } = req.body;
    
    // Validar que el nombre no venga vacío
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "El nombre del empleado es obligatorio." });
    }

    // Validar que el correo no esté vacío
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "El correo electrónico es obligatorio." });
    }

    // Validar que la contraseña sea provista
    if (!password || !password.trim()) {
      return res.status(400).json({ message: "La contraseña es obligatoria." });
    }

    // Limpiar espacios en blanco de los textos
    name = name.trim();
    lastName = lastName ? lastName.trim() : '';
    email = email.trim().toLowerCase();
    phone = phone ? phone.trim() : '';

    // Convertir y validar que el salario no sea negativo
    const numSalary = Number(salary) >= 0 ? Number(salary) : 0;

    // Expresión regular para verificar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "El formato del correo electrónico no es válido." });
    }

    // Buscar si ya existe un empleado registrado con el mismo correo
    const empleadoExistente = await empleadosModel.findOne({ correo: email });
    if (empleadoExistente) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }

    // Encriptar la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password.trim(), 10);
    
    // Crear la instancia del nuevo documento de empleado
    const nuevoEmpleado = new empleadosModel({
      nombre: name,
      apellido: lastName,
      cargo: role || 'Employee',
      telefono: phone,
      correo: email,
      contraseña: hashedPassword,
      salario: numSalary,
      fechaNacimiento: birthdate ? new Date(birthdate) : undefined
    });

    // Guardar en MongoDB
    const guardado = await nuevoEmpleado.save();

    // Formatear los datos para la respuesta sin incluir la contraseña
    const mapped = {
      id: guardado._id,
      name: guardado.nombre,
      lastName: guardado.apellido,
      role: guardado.cargo,
      phone: guardado.telefono,
      email: guardado.correo,
      password: "", 
      salary: guardado.salario,
      birthdate: guardado.fechaNacimiento ? guardado.fechaNacimiento.toISOString().split('T')[0] : ''
    };

    // Retornar respuesta con código 201 de creado
    return res.status(201).json(mapped);
  } catch (error) {
    console.error("Error al crear empleado:", error);

    // Si ocurre un error de duplicado en la base de datos
    if (error.code === 11000) {
      return res.status(400).json({ message: "El correo electrónico ya está registrado." });
    }

    // En cualquier otro caso de error
    return res.status(500).json({ message: "Error interno al crear empleado." });
  }
};

// Función para actualizar los datos de un empleado
empleadosController.updateEmpleado = async (req, res) => {
  try {
    // Tomar el id de los parámetros de la petición
    const { id } = req.params;
    let { name, lastName, role, phone, email, password, salary, birthdate } = req.body;
    
    // Verificar que el empleado a editar existe en la base de datos
    const existente = await empleadosModel.findById(id);
    if (!existente) {
      return res.status(404).json({ message: "Empleado no encontrado." });
    }

    // Si se envía correo, validar su formato y que no esté duplicado
    if (email) {
      email = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // Validar la estructura del email
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "El formato de correo no es válido." });
      }

      // Buscar si otro empleado distinto tiene ese mismo correo
      const duplicaCorreo = await empleadosModel.findOne({ correo: email, _id: { $ne: id } });
      if (duplicaCorreo) {
        return res.status(400).json({ message: "El correo ya está en uso por otro empleado." });
      }
    }

    // Construir el objeto de actualización con los datos recibidos
    const updateData = {
      ...(name && { nombre: name.trim() }),
      ...(lastName !== undefined && { apellido: lastName.trim() }),
      ...(role && { cargo: role }),
      ...(phone !== undefined && { telefono: phone.trim() }),
      ...(email && { correo: email }),
      ...(salary !== undefined && { salario: Number(salary) >= 0 ? Number(salary) : 0 }),
      ...(birthdate !== undefined && { fechaNacimiento: birthdate ? new Date(birthdate) : null })
    };

    // Si se envió una nueva contraseña, encriptarla si no viene encriptada previamente
    if (password && password.trim() !== "") {
      if (!password.startsWith('$2')) {
        updateData.contraseña = await bcrypt.hash(password.trim(), 10);
      }
    }

    // Actualizar el documento en MongoDB y retornar la versión modificada
    const actualizado = await empleadosModel.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    );

    // Mapear la respuesta para el frontend
    const mapped = {
      id: actualizado._id,
      name: actualizado.nombre,
      lastName: actualizado.apellido,
      role: actualizado.cargo,
      phone: actualizado.telefono,
      email: actualizado.correo,
      password: "", 
      salary: actualizado.salario
    };

    // Responder éxito 200
    return res.status(200).json(mapped);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return res.status(500).json({ message: "Error interno al actualizar empleado." });
  }
};

// Función para borrar un empleado por su ID
empleadosController.deleteEmpleado = async (req, res) => {
  try {
    // Obtener el ID de la URL
    const { id } = req.params;

    // Eliminar el registro en la base de datos
    const eliminado = await empleadosModel.findByIdAndDelete(id);

    // Comprobar si el registro existía
    if (!eliminado) {
      return res.status(404).json({ message: "El empleado a eliminar no existe." });
    }

    // Responder que se eliminó correctamente
    return res.status(200).json({ message: "Empleado eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return res.status(500).json({ message: "Error interno al eliminar empleado." });
  }
};

export default empleadosController;
