import clientesModel from "../models/Clientes.js";
import bcrypt from "bcryptjs";

const controladoresClientes = {};

// Obtener todos los clientes registrados en el sistema
controladoresClientes.getClientes = async (req, res) => {
    try {
        // Consultar la base de datos ordenando por fecha de creación reciente
        const clientes = await clientesModel.find().sort({ createdAt: -1 });

        // Mapear los campos para devolver un formato limpio al frontend
        const mapeado = clientes.map(c => ({
            id: c._id,
            name: c.name || c.nombre || '',
            lastName: c.lastName || c.apellido || '',
            email: c.email || c.correo || '',
            phone: c.telefono || c.phone || '',
            birthdate: c.birthdate || c.fechaNacimiento || '',
            status: c.status || 'Active'
        }));

        // Responder con la lista formateada y código HTTP 200
        return res.status(200).json(mapeado);
    } catch (error) {
        // En caso de falla, mostrar error en consola y responder estado 500
        console.error("Error al obtener lista de clientes:", error);
        return res.status(500).json({ message: "Error al consultar clientes." });
    }
};

// Crear un nuevo cliente
controladoresClientes.createCliente = async (req, res) => {
    try {
        // Extraer variables recibidas en el cuerpo de la petición
        let { name, lastName, email, phone, birthdate, status, password } = req.body;

        // Comprobar que el nombre no venga vacío
        if (typeof name !== 'string' || !name.trim()) {
            return res.status(400).json({ message: "El nombre del cliente es obligatorio." });
        }

        if (typeof lastName !== 'string' || !lastName.trim()) {
            return res.status(400).json({ message: "El apellido del cliente es obligatorio." });
        }

        // Comprobar que el correo no venga vacío
        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ message: "El correo electrónico es obligatorio." });
        }

        // Limpiar espacios en blanco innecesarios
        name = name.trim();
        lastName = lastName ? lastName.trim() : '';
        email = email.trim().toLowerCase();
        phone = phone ? phone.trim() : '';

        // Expresión regular para validar el formato de correo electrónico
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "El formato de correo no es válido." });
        }

        if (phone) {
            const digits = String(phone).replace(/\D/g, '');
            const nationalDigits = digits.startsWith('503') && digits.length === 11 ? digits.slice(3) : digits;
            if (nationalDigits.length !== 8) {
                return res.status(400).json({ message: "El teléfono debe contener 8 dígitos de El Salvador." });
            }
        }

        if (birthdate) {
            const parsedBirthdate = new Date(birthdate);
            if (Number.isNaN(parsedBirthdate.getTime()) || parsedBirthdate > new Date()) {
                return res.status(400).json({ message: "La fecha de nacimiento no es válida." });
            }
        }

        if (status && !["Active", "Inactive"].includes(status)) {
            return res.status(400).json({ message: "Selecciona un estado válido para el cliente." });
        }

        let hashedPassword;
        if (password !== undefined && password !== '') {
            if (typeof password !== 'string' || password.trim().length < 6) {
                return res.status(400).json({ message: "La contraseña debe tener al menos 6 caracteres." });
            }
            hashedPassword = await bcrypt.hash(password.trim(), 10);
        }

        // Verificar en MongoDB que el correo no se encuentre registrado previamente
        const clienteExistente = await clientesModel.findOne({ $or: [{ email }, { correo: email }] });
        if (clienteExistente) {
            return res.status(400).json({ message: "Este correo ya está registrado." });
        }

        // Crear instancia del nuevo cliente con sus datos
        const nuevoCliente = new clientesModel({
            name,
            nombre: name,
            lastName,
            apellido: lastName,
            email,
            correo: email,
            telefono: phone,
            phone,
            birthdate,
            ...(hashedPassword && { password: hashedPassword }),
            status: status || 'Active',
            isVerified: true
        });

        // Guardar el registro en la base de datos
        const guardado = await nuevoCliente.save();

        // Devolver respuesta con estado 201 (Creado)
        return res.status(201).json({
            id: guardado._id,
            name: guardado.name,
            lastName: guardado.lastName,
            email: guardado.email,
            phone: guardado.phone || guardado.telefono || '',
            birthdate: guardado.birthdate || '',
            status: guardado.status || 'Active'
        });
    } catch (error) {
        console.error("Error al crear cliente:", error);
        return res.status(500).json({ message: "Error interno al crear cliente." });
    }
};

// Actualizar información de un cliente por su ID
controladoresClientes.updateClientes = async (req, res) => {
    try {
        // Obtener el ID del cliente desde la ruta del endpoint
        const { id } = req.params;
        let { name, lastName, email, phone, birthdate, status } = req.body;

        // Comprobar que se haya enviado un ID
        if (!id) {
            return res.status(400).json({ message: "Se requiere el ID del cliente." });
        }

        // Validar que los nombres recibidos no queden vacíos
        if (name !== undefined && (typeof name !== 'string' || !name.trim())) {
            return res.status(400).json({ message: "El nombre no puede estar vacío." });
        }

        if (lastName !== undefined && (typeof lastName !== 'string' || !lastName.trim())) {
            return res.status(400).json({ message: "El apellido no puede estar vacío." });
        }

        // Validar el formato y duplicidad del correo si se intenta modificar
        if (email !== undefined) {
            email = typeof email === 'string' ? email.trim().toLowerCase() : '';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                return res.status(400).json({ message: "El correo ingresado no es válido." });
            }

            // Comprobar si otro cliente ya usa este mismo correo
            const duplicaEmail = await clientesModel.findOne({
                $or: [{ email }, { correo: email }],
                _id: { $ne: id }
            });
            if (duplicaEmail) {
                return res.status(400).json({ message: "Este correo ya está en uso por otro cliente." });
            }
        }

        if (phone !== undefined && String(phone).trim()) {
            const digits = String(phone).replace(/\D/g, '');
            const nationalDigits = digits.startsWith('503') && digits.length === 11 ? digits.slice(3) : digits;
            if (nationalDigits.length !== 8) {
                return res.status(400).json({ message: "El teléfono debe contener 8 dígitos de El Salvador." });
            }
        }

        if (birthdate) {
            const parsedBirthdate = new Date(birthdate);
            if (Number.isNaN(parsedBirthdate.getTime()) || parsedBirthdate > new Date()) {
                return res.status(400).json({ message: "La fecha de nacimiento no es válida." });
            }
        }

        if (status !== undefined && !["Active", "Inactive"].includes(status)) {
            return res.status(400).json({ message: "Selecciona un estado válido para el cliente." });
        }

        // Armar el objeto con los campos a modificar
        const updateFields = {
            ...(name && { name: name.trim(), nombre: name.trim() }),
            ...(lastName !== undefined && { lastName: lastName.trim(), apellido: lastName.trim() }),
            ...(email && { email, correo: email }),
            ...(phone !== undefined && { phone: phone.trim(), telefono: phone.trim() }),
            ...(birthdate !== undefined && { birthdate, fechaNacimiento: birthdate }),
            ...(status && { status })
        };

        // Buscar por ID y actualizar el registro en la base de datos
        const clienteActualizado = await clientesModel.findByIdAndUpdate(
            id,
            updateFields,
            { returnDocument: 'after' }
        );

        // Si no se encuentra el ID, devolver error 404
        if (!clienteActualizado) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }

        // Devolver únicamente los datos que necesita la interfaz administrativa.
        return res.status(200).json({
            message: "Cliente actualizado exitosamente",
            customer: {
                id: clienteActualizado._id,
                name: clienteActualizado.name || clienteActualizado.nombre || '',
                lastName: clienteActualizado.lastName || clienteActualizado.apellido || '',
                email: clienteActualizado.email || clienteActualizado.correo || '',
                phone: clienteActualizado.phone || clienteActualizado.telefono || '',
                birthdate: clienteActualizado.birthdate || clienteActualizado.fechaNacimiento || '',
                status: clienteActualizado.status || 'Active'
            }
        });
    } catch (error) {
        console.error("Error al actualizar cliente:", error);
        return res.status(500).json({ message: "Error interno al actualizar cliente." });
    }
};

// Eliminar un cliente por su ID
controladoresClientes.deleteClientes = async (req, res) => {
    try {
        // Tomar el ID de los parámetros de la URL
        const { id } = req.params;

        // Buscar y remover el documento en MongoDB
        const clienteEliminado = await clientesModel.findByIdAndDelete(id);

        // Si no existía el registro, responder 404
        if (!clienteEliminado) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        }

        // Responder confirmación de eliminación exitosa
        return res.status(200).json({ message: "Cliente eliminado exitosamente." });
    } catch (error) {
        console.error("Error al eliminar cliente:", error);
        return res.status(500).json({ message: "Error al eliminar cliente." });
    }
};

export default controladoresClientes;
