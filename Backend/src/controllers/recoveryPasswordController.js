import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import HTMLRecoveryEmail from "../utils/sendMailRecovery.js";
import { config } from "../../config.js";
import customerModel from "../models/Clientes.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

const recoveryPasswordController = {};

// Solicitar código de recuperación de contraseña de clientes con Mailjet
recoveryPasswordController.requestCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Ingresa tu correo electrónico." });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Buscar cliente por correo
    const userFound = await customerModel.findOne({
      $or: [{ email: cleanEmail }, { correo: cleanEmail }]
    });

    if (!userFound) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    // Generar código aleatorio de recuperación
    const randomCode = crypto.randomBytes(3).toString("hex");

    // Guardar token temporal en cookie
    const token = jsonwebtoken.sign(
      { email: cleanEmail, randomCode, userType: "Cliente", verified: false },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", token, {
      maxAge: 15 * 60 * 1000,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });

    // Generar HTML utilizando el template HTMLRecoveryEmail
    const htmlContent = HTMLRecoveryEmail(randomCode);

    // Enviar el correo usando la utility sendEmail de Mailjet
    try {
      await sendEmail(cleanEmail, "Código de recuperación de contraseña - ProNatural", htmlContent);
      return res.status(200).json({ message: "Código enviado al correo.", token });
    } catch (mailError) {
      console.warn("[MAILJET FALLBACK] Error al enviar correo de recuperación con Mailjet:", mailError.message);
      console.log("🔑 CÓDIGO DE RECUPERACIÓN CLIENTE (DEV):", randomCode);
      return res.status(200).json({
        message: `Código de recuperación generado: ${randomCode}`,
        token,
        code: randomCode,
      });
    }
  } catch (error) {
    console.error("Error en requestCode:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Verificar el código ingresado por el cliente
recoveryPasswordController.verifyCode = async (req, res) => {
  try {
    const { code, token: bodyToken } = req.body;

    const rawCookieHeader = req.headers.cookie;
    let token = req.cookies?.recoveryCookie || bodyToken;

    if (!token && rawCookieHeader) {
      const match = rawCookieHeader.match(/recoveryCookie=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return res.status(400).json({ message: "La sesión de recuperación ha expirado." });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (!code || code.trim() !== decoded.randomCode) {
      return res.status(400).json({ message: "El código de recuperación es incorrecto." });
    }

    const newToken = jsonwebtoken.sign(
      { email: decoded.email, userType: "Cliente", verified: true },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("recoveryCookie", newToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({ message: "Código verificado correctamente.", token: newToken });
  } catch (error) {
    console.error("Error en verifyCode:", error);
    return res.status(500).json({ message: "Error al verificar código." });
  }
};

// Cambiar la contraseña del cliente
recoveryPasswordController.newPassword = async (req, res) => {
  try {
    const { newPassword, confirmNewPassword, token: bodyToken } = req.body;

    if (!newPassword || !newPassword.trim()) {
      return res.status(400).json({ message: "Ingresa la nueva contraseña." });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: "Las contraseñas no coinciden." });
    }

    const rawCookieHeader = req.headers.cookie;
    let token = req.cookies?.recoveryCookie || bodyToken;

    if (!token && rawCookieHeader) {
      const match = rawCookieHeader.match(/recoveryCookie=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return res.status(400).json({ message: "La sesión de recuperación ha expirado." });
    }

    const decoded = jsonwebtoken.verify(token, config.JWT.secret);

    if (!decoded.verified) {
      return res.status(400).json({ message: "Debes verificar el código primero." });
    }

    const passwordHash = await bcrypt.hash(newPassword.trim(), 10);

    await customerModel.findOneAndUpdate(
      { $or: [{ email: decoded.email }, { correo: decoded.email }] },
      { password: passwordHash, contraseña: passwordHash },
      { returnDocument: "after" }
    );

    res.clearCookie("recoveryCookie");

    return res.status(200).json({ message: "Contraseña actualizada exitosamente." });
  } catch (error) {
    console.error("Error en newPassword:", error);
    return res.status(500).json({ message: "Error al actualizar la contraseña." });
  }
};

export default recoveryPasswordController;