import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientesModel from "../models/Clientes.js";
import { config } from "../../config.js";
import { sendEmail } from "../utils/sendMailMailjet.js";
import HTMLRecoveryEmail from "../utils/sendMailRecovery.js";

const registerClientesController = {};

// Registro de clientes con envío de código de verificación por Mailjet
registerClientesController.register = async (req, res) => {
  const { name, lastName, birthdate, email, password, isVerified } = req.body;

  // Validaciones de campos obligatorios
  if (!name || !name.trim()) {
    return res.status(400).json({ message: "El nombre es obligatorio." });
  }

  if (!email || !email.trim()) {
    return res.status(400).json({ message: "El correo electrónico es obligatorio." });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({ message: "La contraseña es obligatoria." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({ message: "El formato de correo no es válido." });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    // Validar que el correo no exista en la base de datos
    const existsClientes = await clientesModel.findOne({
      $or: [{ email: cleanEmail }, { correo: cleanEmail }]
    });
    if (existsClientes) {
      return res.status(400).json({ message: "Este correo ya está registrado." });
    }

    // Encriptar la contraseña
    const passwordHashed = await bcryptjs.hash(password.trim(), 10);

    // Generar un código aleatorio de verificación de 6 dígitos
    const randomNumber = crypto.randomBytes(3).toString("hex");

    // Guardar temporalmente en token JWT con expiración de 15 minutos
    const token = jsonwebtoken.sign(
      {
        randomNumber,
        name: name.trim(),
        lastName: lastName ? lastName.trim() : "",
        birthdate,
        email: cleanEmail,
        password: passwordHashed,
        isVerified,
      },
      config.JWT.secret,
      { expiresIn: "15m" }
    );

    res.cookie("resgistrationCookie", token, {
      maxAge: 15 * 60 * 1000,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });

    // Plantilla HTML del correo
    const htmlContent = HTMLRecoveryEmail(randomNumber);

    // Enviar el correo usando la utility oficial de Mailjet
    try {
      await sendEmail(cleanEmail, "Código de Verificación - ProNatural Store", htmlContent);
      return res.status(200).json({
        message: "Código de verificación enviado al correo.",
        token,
      });
    } catch (mailError) {
      console.warn("[MAILJET FALLBACK] Error al enviar email con Mailjet:", mailError.message);
      console.log("🔑 CÓDIGO DE VERIFICACIÓN CLIENTE (DEV):", randomNumber);
      return res.status(200).json({
        message: `Código de verificación generado: ${randomNumber}`,
        token,
        code: randomNumber,
      });
    }
  } catch (error) {
    console.error("Error en registro de cliente:", error);
    return res.status(500).json({ message: "Error interno en registro." });
  }
};

// Verificar el código enviado al correo y completar registro
registerClientesController.verifyCode = async (req, res) => {
  try {
    const { verificationCodeRequest, code, token: bodyToken } = req.body;
    const inputCode = verificationCodeRequest || code;

    if (!inputCode) {
      return res.status(400).json({ message: "Ingresa el código de verificación." });
    }

    // Obtener la cookie de registro o token alternativo
    const rawCookieHeader = req.headers.cookie;
    let token = req.cookies?.resgistrationCookie || req.cookies?.registrationCookie || bodyToken;

    if (!token && rawCookieHeader) {
      const match = rawCookieHeader.match(/resgistrationCookie=([^;]+)/) || rawCookieHeader.match(/registrationCookie=([^;]+)/);
      if (match) token = match[1];
    }

    if (!token) {
      return res.status(400).json({ message: "La sesión de verificación ha expirado. Por favor intenta registrarte de nuevo." });
    }

    // Decodificar la información guardada en el token
    const decoded = jsonwebtoken.verify(token, config.JWT.secret);
    const {
      randomNumber: storedCode,
      name,
      lastName,
      birthdate,
      email,
      password,
    } = decoded;

    // Comparar el código ingresado con el guardado
    if (inputCode.trim() !== storedCode) {
      return res.status(400).json({ message: "El código de verificación es incorrecto." });
    }

    // Guardar el cliente en la base de datos
    const NewCliente = new clientesModel({
      name,
      nombre: name,
      lastName,
      apellido: lastName,
      birthdate,
      fechaNacimiento: birthdate,
      email,
      correo: email,
      password,
      isVerified: true,
      status: "Active",
    });

    await NewCliente.save();

    res.clearCookie("resgistrationCookie");
    res.clearCookie("registrationCookie");

    return res.status(200).json({ message: "Cliente verificado y registrado correctamente." });
  } catch (error) {
    console.error("Error al verificar código:", error);
    return res.status(500).json({ message: "Error al verificar código de registro." });
  }
};

export default registerClientesController;