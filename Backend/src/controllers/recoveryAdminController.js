import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import HTMLRecoveryEmail from "../utils/sendMailRecovery.js";
import { config } from "../../config.js";
import usersModel from "../models/Usuarios.js";
import empleadosModel from "../models/Empleados.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

const recoveryAdminController = {};

// Solicitar código de recuperación de contraseña para administradores / empleados con Mailjet
recoveryAdminController.requestCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Por favor ingresa tu correo electrónico." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Buscar usuario en administradores o empleados
    let userFound = await usersModel.findOne({ correo: cleanEmail });
    let role = "Admin";
    let isEmpleado = false;

    if (!userFound) {
      userFound = await empleadosModel.findOne({ correo: cleanEmail });
      role = "Employee";
      isEmpleado = true;
    }

    if (!userFound) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const randomCode = crypto.randomBytes(3).toString("hex");

    // Guardar estado temporal en cookie JWT por 15 minutos
    const token = jsonwebtoken.sign(
      { email: cleanEmail, randomCode, userType: role, verified: false, isEmpleado },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryAdminCookie", token, {
      maxAge: 15 * 60 * 1000,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });

    const htmlContent = HTMLRecoveryEmail(randomCode);

    // Enviar código por correo utilizando la utility sendEmail de Mailjet
    try {
      await sendEmail(cleanEmail, "Código de recuperación de cuenta administrativa - ProNatural", htmlContent);
      return res.status(200).json({ message: "Código enviado al correo.", token });
    } catch (mailError) {
      console.warn("[MAILJET FALLBACK] Error al enviar código admin con Mailjet:", mailError.message);
      console.log("🔑 CÓDIGO DE RECUPERACIÓN ADMIN (DEV):", randomCode);
      return res.status(200).json({
        message: `Código de recuperación generado: ${randomCode}`,
        token,
        code: randomCode,
      });
    }
  } catch (error) {
    console.error("Error en requestCode de admin:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Verificar el código recibido por correo
recoveryAdminController.verifyCode = async (req, res) => {
  try {
    const { code, token: bodyToken } = req.body;
    const rawCookieHeader = req.headers.cookie;

    let token = req.cookies?.recoveryAdminCookie || bodyToken;

    if (!token && rawCookieHeader) {
      const match = rawCookieHeader.match(/recoveryAdminCookie=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) return res.status(400).json({ message: "La sesión de recuperación ha expirado." });

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (!code || code.trim() !== decoded.randomCode) {
      return res.status(400).json({ message: "El código de recuperación es incorrecto." });
    }

    // Actualizar token autorizando el cambio de contraseña
    const newToken = jsonwebtoken.sign(
      { email: decoded.email, userType: decoded.userType, verified: true, isEmpleado: decoded.isEmpleado },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryAdminCookie", newToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Código verificado correctamente.", token: newToken });
  } catch (error) {
    console.error("Error en verifyCode de admin:", error);
    return res.status(500).json({ message: "Error interno al verificar código." });
  }
};

// Establecer nueva contraseña
recoveryAdminController.newPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, token: bodyToken } = req.body;

    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ message: "Ingresa la nueva contraseña." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }

    const rawCookieHeader = req.headers.cookie;
    let token = req.cookies?.recoveryAdminCookie || bodyToken;

    if (!token && rawCookieHeader) {
      const match = rawCookieHeader.match(/recoveryAdminCookie=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) return res.status(400).json({ message: "La sesión de recuperación ha expirado." });

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(400).json({ message: "Primero debes verificar el código de recuperación." });
    }

    const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

    if (decoded.isEmpleado) {
      await empleadosModel.findOneAndUpdate(
        { correo: decoded.email },
        { contraseña: passwordHash },
        { returnDocument: "after" }
      );
    } else {
      await usersModel.findOneAndUpdate(
        { correo: decoded.email },
        { contraseña: passwordHash },
        { returnDocument: "after" }
      );
    }

    res.clearCookie("recoveryAdminCookie");
    return res.status(200).json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    console.error("Error en newPassword de admin:", error);
    return res.status(500).json({ message: "Error al actualizar la contraseña." });
  }
};

export default recoveryAdminController;
