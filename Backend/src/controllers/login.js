import clientesModel from "../models/Clientes.js";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

const loginClientesController = {};

// Inicio de sesión de clientes
loginClientesController.login = async (req, res) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ message: "Por favor ingresa un correo electrónico válido." });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ message: "Por favor ingresa tu contraseña." });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    // Buscar cliente por correo
    const clientesFound = await clientesModel.findOne({ 
      $or: [{ email: cleanEmail }, { correo: cleanEmail }] 
    });

    if (!clientesFound) {
      return res.status(400).json({ message: "El usuario o correo ingresado no existe." });
    }

    // Verificar si la cuenta está bloqueada temporalmente
    if (clientesFound.timeOut && clientesFound.timeOut > Date.now()) {
      const remainingMinutes = Math.ceil((clientesFound.timeOut - Date.now()) / (60 * 1000));
      return res.status(403).json({ 
        message: `Cuenta bloqueada temporalmente. Intenta nuevamente en ${remainingMinutes} minuto(s).` 
      });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, clientesFound.password);

    if (!isMatch) {
      clientesFound.loginAttemps = (clientesFound.loginAttemps || 0) + 1;

      if (clientesFound.loginAttemps >= 5) {
        clientesFound.timeOut = Date.now() + 5 * 60 * 1000;
        clientesFound.loginAttemps = 0;
        await clientesFound.save();

        return res.status(403).json({ 
          message: "Cuenta bloqueada por múltiples intentos fallidos. Intenta en 5 minutos." 
        });
      }

      await clientesFound.save();
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Resetear intentos fallidos
    clientesFound.loginAttemps = 0;
    clientesFound.timeOut = null;
    await clientesFound.save();

    // Generar token JWT y cookie de sesión
    const token = jsonwebtoken.sign(
      { id: clientesFound._id, userType: "Customer", role: "Customer" },
      config.JWT.secret,
      { expiresIn: "30d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ 
      message: "Inicio de sesión exitoso.",
      user: {
        id: clientesFound._id,
        name: clientesFound.name || clientesFound.nombre,
        email: clientesFound.email || clientesFound.correo,
        role: "Customer"
      }
    });
  } catch (error) {
    console.error("Error en login de cliente:", error);
    return res.status(500).json({ message: "Error interno al iniciar sesión." });
  }
};

export default loginClientesController;