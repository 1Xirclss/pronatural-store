import usersModel from "../models/Usuarios.js";
import empleadosModel from "../models/Empleados.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { config } from "../../config.js";
import clientesModel from "../models/Clientes.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

const authController = {};

// Registro de usuario administrador / empleado
authController.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Verificar si el correo ya existe
    const existsAdmin = await usersModel.findOne({ correo: email });
    const existsEmpleado = await empleadosModel.findOne({ correo: email });
    if (existsAdmin || existsEmpleado) {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const randomNumber = crypto.randomBytes(3).toString("hex");

    // Guardar temporalmente en un token
    const token = jwt.sign(
      { randomNumber, name, email, password: hashedPassword },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("registrationAdminCookie", token, {
      maxAge: 15 * 60 * 1000,
      httpOnly: false,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0a0d0f; color: #ffffff; border-radius: 8px;">
        <h2 style="color: #30b466; margin-bottom: 10px;">Verificación de cuenta Admin/Vendedor</h2>
        <p style="color: #cccccc;">Para verificar tu cuenta en ProNatural Store, utiliza este código:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4ade80; letter-spacing: 4px; padding: 12px; background-color: #121619; text-align: center; border-radius: 6px; margin: 15px 0;">${randomNumber}</div>
        <p style="font-size: 12px; color: #888888;">Este código expira en 15 minutos.</p>
      </div>
    `;

    try {
      await sendEmail(email, "Verificación de cuenta Admin/Vendedor - ProNatural", htmlContent);
      return res.status(200).json({ message: "Email sent", token });
    } catch (mailErr) {
      console.warn("[MAILJET FALLBACK] Error al enviar email admin con Mailjet:", mailErr.message);
      console.log("🔑 CÓDIGO REGISTRO ADMIN (DEV):", randomNumber);
      return res.status(200).json({ message: "Código enviado", token, code: randomNumber });
    }
  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({ message: "Error de servidor: " + error.message });
  }
};

// Verificar código de registro de administrador
authController.verifyCode = async (req, res) => {
  try {
    const { verificationCodeRequest, code, token: bodyToken } = req.body;
    const inputCode = verificationCodeRequest || code;

    const rawCookieHeader = req.headers.cookie;
    let token = req.cookies?.registrationAdminCookie || bodyToken;

    if (!token && rawCookieHeader) {
      const match = rawCookieHeader.match(/registrationAdminCookie=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) return res.status(400).json({ message: "La sesión de verificación ha expirado." });

    const decoded = jwt.verify(token, config.JWT.secret);
    const { randomNumber: storedCode, name, email, password } = decoded;

    if (inputCode !== storedCode) {
      return res.status(400).json({ message: "Código inválido" });
    }

    const newAdmin = new usersModel({
      nombre: name,
      correo: email,
      contraseña: password,
      isVerified: true,
    });

    await newAdmin.save();
    res.clearCookie("registrationAdminCookie");
    return res.status(200).json({ message: "Administrador registrado correctamente" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Inicio de sesión general (Admin, Empleado o Cliente)
authController.login = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    const emailRegex = new RegExp("^" + email + "$", "i");

    let user = await usersModel.findOne({ correo: emailRegex });
    let role = "Admin";
    let isCliente = false;
    let isEmpleado = false;

    if (!user) {
      user = await empleadosModel.findOne({ correo: emailRegex });
      if (user) {
        role = "Employee";
        isEmpleado = true;
      }
    }

    if (!user) {
      user =
        (await clientesModel.findOne({ email: emailRegex })) ||
        (await clientesModel.findOne({ correo: emailRegex }));
      if (user) {
        role = "Customer";
        isCliente = true;
      }
    }

    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    if (user.timeOut && user.timeOut > Date.now()) {
      return res.status(403).json({ message: "Cuenta bloqueada temporalmente" });
    }

    const userPasswordHash = user.contraseña || user.password;
    const isMatch = await bcrypt.compare(password, userPasswordHash);

    if (!isMatch) {
      user.loginAttemps = (user.loginAttemps || 0) + 1;

      if (user.loginAttemps >= 8) {
        user.timeOut = Date.now() + 5 * 60 * 1000;
        user.loginAttemps = 0;
        await user.save();
        return res.status(403).json({ message: "Cuenta bloqueada por múltiples intentos fallidos" });
      }

      await user.save();
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Exigir cambio de contraseña en el primer inicio de sesión de empleados
    if (isEmpleado && user.firstLogin === true) {
      return res.status(403).json({
        requirePasswordChange: true,
        email: user.correo,
        message: "Por seguridad, debes cambiar la contraseña temporal asignada.",
      });
    }

    user.loginAttemps = 0;
    user.timeOut = null;
    await user.save();

    // Generar token JWT y cookie de sesión
    const token = jwt.sign(
      { id: user._id, userType: role, email: user.correo, name: user.nombre },
      config.JWT.secret,
      { expiresIn: "1d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: false,
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 24 * 3600000),
    });

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        id: user._id,
        name: user.nombre,
        email: user.correo,
        role: role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cerrar sesión
authController.logout = async (req, res) => {
  try {
    res.clearCookie("authCookie");
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Forzar cambio de contraseña temporal de primer ingreso
authController.forceChangePassword = async (req, res) => {
  try {
    let { email, oldPassword, newPassword } = req.body;
    email = email.toLowerCase().trim();

    const user = await empleadosModel.findOne({ correo: email });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.contraseña);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.contraseña = hashedPassword;
    user.firstLogin = false;
    user.loginAttemps = 0;
    user.timeOut = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, userType: "Employee", email: user.correo, name: user.nombre },
      config.JWT.secret,
      { expiresIn: "1d" }
    );

    res.cookie("authCookie", token, {
      httpOnly: false,
      path: "/",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 24 * 3600000),
    });

    return res.status(200).json({
      message: "Contraseña actualizada y login exitoso",
      token,
      user: {
        id: user._id,
        name: user.nombre,
        email: user.correo,
        role: "Employee",
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cambiar contraseña de usuario desde perfil
authController.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userEmail = req.user?.email;
    const userType = req.user?.userType;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Debes proporcionar la contraseña actual y la nueva." });
    }

    let targetUser = null;
    let isEmpleado = false;

    const emailRegex = new RegExp("^" + userEmail + "$", "i");

    if (userType === "Admin") {
      targetUser = await usersModel.findOne({ correo: emailRegex });
    } else if (userType === "Employee") {
      targetUser = await empleadosModel.findOne({ correo: emailRegex });
      isEmpleado = true;
    } else if (userType === "Customer") {
      targetUser =
        (await clientesModel.findOne({ email: emailRegex })) ||
        (await clientesModel.findOne({ correo: emailRegex }));
    }

    if (!targetUser) {
      targetUser =
        (await usersModel.findOne({ correo: emailRegex })) ||
        (await empleadosModel.findOne({ correo: emailRegex })) ||
        (await clientesModel.findOne({ email: emailRegex })) ||
        (await clientesModel.findOne({ correo: emailRegex }));
    }

    if (!targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const currentHash = targetUser.contraseña || targetUser.password;
    const isMatch = await bcrypt.compare(currentPassword, currentHash);
    if (!isMatch) {
      return res.status(400).json({ message: "La contraseña actual no es correcta" });
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    if (targetUser.contraseña !== undefined) {
      targetUser.contraseña = newHashedPassword;
    }
    if (targetUser.password !== undefined) {
      targetUser.password = newHashedPassword;
    }

    if (isEmpleado) {
      targetUser.firstLogin = false;
    }

    await targetUser.save();

    // Fecha y hora local
    const now = new Date();
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    const localTimeStr = now.toLocaleString("es-SV", options);

    const recipientEmail = targetUser.correo || targetUser.email || userEmail;
    const recipientName = targetUser.nombre || targetUser.name || "Usuario";

    const changePasswordHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #0d1114; color: #ffffff; border-radius: 12px; border: 1px solid #1f2937;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #30b466; margin: 0; font-size: 22px;">Confirmación de Cambio de Contraseña</h2>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 5px;">Portal de Seguridad ProNatural</p>
        </div>
        <p style="font-size: 14px; line-height: 1.5;">Hola <strong style="color: #ffffff;">${recipientName}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #d1d5db;">Te informamos que la contraseña asociada a tu cuenta ha sido modificada correctamente.</p>
        
        <div style="background-color: #161b1e; padding: 18px; border-left: 4px solid #30b466; margin: 25px 0; border-radius: 6px;">
          <p style="margin: 0; color: #9ca3af; font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase;">Detalles del evento de seguridad:</p>
          <p style="margin: 8px 0 0 0; color: #ffffff; font-size: 13px;"><strong>Correo de la cuenta:</strong> ${recipientEmail}</p>
          <p style="margin: 4px 0 0 0; color: #4ade80; font-size: 13px;"><strong>Fecha y Hora Local:</strong> ${localTimeStr}</p>
        </div>
        
        <p style="font-size: 13px; color: #ef4444; background-color: rgba(239, 68, 68, 0.1); padding: 12px; border-radius: 6px; border: 1px solid rgba(239, 68, 68, 0.2);">
          ⚠️ <strong>¿No realizaste esta acción?</strong> Si tú no solicitaste este cambio, ponte en contacto de inmediato con el administrador del sistema para proteger tu cuenta.
        </p>
        <hr style="border: 0; border-top: 1px solid #1f2937; margin: 25px 0;" />
        <p style="font-size: 11px; color: #6b7280; text-align: center; margin: 0;">© ProNatural Store - Notificación Automática de Seguridad</p>
      </div>
    `;

    // Notificar por correo con Mailjet
    try {
      await sendEmail(recipientEmail, "Seguridad ProNatural - Notificación de Cambio de Contraseña", changePasswordHtml);
      console.log("Correo de cambio de contraseña enviado exitosamente vía Mailjet a:", recipientEmail);
    } catch (emailError) {
      console.error("Error al enviar el correo de cambio de contraseña vía Mailjet:", emailError.message);
    }

    return res.status(200).json({ message: "Contraseña actualizada exitosamente. Se ha enviado un correo de notificación." });
  } catch (error) {
    console.error("Error en changePassword:", error);
    return res.status(500).json({ message: "Error al actualizar contraseña: " + error.message });
  }
};

export default authController;
