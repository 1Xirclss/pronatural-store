import ajustesModel from "../models/AjustesSistema.js";
import adminModel from "../models/Usuarios.js";
import { config } from "../../config.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

const contactoController = {};
const escapeHtml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

// Enviar mensaje del formulario de contacto al correo de los administradores
contactoController.sendMessage = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    // Validar campos requeridos
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string' || !name.trim() || !email.trim() || !message.trim()) {
      return res.status(400).json({ message: "Por favor completa todos los campos requeridos." });
    }

    if (name.trim().length < 2 || name.trim().length > 120) {
      return res.status(400).json({ message: "El nombre debe tener entre 2 y 120 caracteres." });
    }

    if (/[\r\n\0]/.test(name)) {
      return res.status(400).json({ message: "El nombre contiene caracteres no permitidos." });
    }

    if (message.trim().length < 5 || message.trim().length > 5000) {
      return res.status(400).json({ message: "El mensaje debe tener entre 5 y 5000 caracteres." });
    }

    if (!['mayor', 'tecnicas', 'general'].includes(category)) {
      return res.status(400).json({ message: "Selecciona un motivo válido para tu consulta." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim().length > 254 || !emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "El formato de correo no es válido." });
    }

    // Obtener las cuentas de los administradores
    let adminEmails = [];

    try {
      const admins = await adminModel.find({}, "correo email").lean();
      admins.forEach(a => {
        const mail = a.correo || a.email;
        if (mail && mail.includes("@") && !adminEmails.includes(mail.trim().toLowerCase())) {
          adminEmails.push(mail.trim().toLowerCase());
        }
      });
    } catch (dbErr) {
      console.warn("No se pudieron cargar administradores de la base de datos:", dbErr.message);
    }

    // Buscar en ajustes del sistema
    const ajustes = await ajustesModel.findOne();
    if (ajustes?.email && ajustes.email.includes("@")) {
      const ajEmail = ajustes.email.trim().toLowerCase();
      if (!adminEmails.includes(ajEmail)) {
        adminEmails.push(ajEmail);
      }
    }

    // Fallback a variable de entorno configurada
    if (config.email?.user_email && config.email.user_email.includes("@")) {
      const envEmail = config.email.user_email.trim().toLowerCase();
      if (!adminEmails.includes(envEmail)) {
        adminEmails.push(envEmail);
      }
    }

    if (adminEmails.length === 0) {
      adminEmails.push("mam270508@gmail.com");
    }

    const categoryText =
      category === "mayor"
        ? "VENTAS AL POR MAYOR"
        : category === "tecnicas"
        ? "CONSULTAS TÉCNICAS"
        : category || "GENERAL";

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(email.trim());
    const safeMessage = escapeHtml(message.trim());

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #0d1114; color: #ffffff; border-radius: 12px; border: 1px solid #1b4332;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1f2937;">
          <h2 style="color: #30b466; margin: 0; font-size: 22px;">🌿 ProNatural - Nuevo Mensaje de Contacto</h2>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 5px;">Has recibido una nueva consulta a través del portal web de clientes.</p>
        </div>

        <div style="margin: 25px 0; background-color: #161b1e; padding: 20px; border-radius: 10px; border-left: 4px solid #30b466;">
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Remitente / Usuario:</strong> ${safeName}</p>
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Correo del Usuario:</strong> <a href="mailto:${safeEmail}" style="color: #4ade80; text-decoration: none;">${safeEmail}</a></p>
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Asunto / Categoría:</strong> <span style="background-color: #1b4332; color: #4ade80; padding: 3px 8px; border-radius: 4px; font-size: 12px;">${categoryText}</span></p>
          <p style="margin: 15px 0 5px 0; font-size: 14px; font-weight: bold; color: #9ca3af;">Mensaje:</p>
          <div style="background-color: #0d1114; padding: 15px; border-radius: 8px; color: #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeMessage}</div>
        </div>

        <div style="text-align: center; border-top: 1px solid #1f2937; padding-top: 15px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">Puedes responder directamente a este correo para comunicarte con <strong>${email}</strong>.</p>
        </div>
      </div>
    `;

    // Enviar el correo a los administradores indicando el replyTo del remitente
    let sentCount = 0;
    for (const targetAdmin of adminEmails) {
      try {
        await sendEmail(
          targetAdmin,
          `[Contacto Web] ${categoryText} - De: ${name.trim()} (${email.trim()})`,
          htmlContent,
          null,
          email.trim()
        );
        sentCount += 1;
      } catch (mailErr) {
        console.warn(`[EMAIL ERROR] Fallo al enviar al admin ${targetAdmin}:`, mailErr.message);
      }
    }

    if (sentCount === 0) {
      return res.status(502).json({ message: "No se pudo entregar tu mensaje. Inténtalo de nuevo más tarde." });
    }

    return res.status(200).json({ message: "Mensaje enviado exitosamente al administrador." });
  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error);
    return res.status(500).json({ message: "No se pudo enviar el mensaje. Inténtalo de nuevo más tarde." });
  }
};

export default contactoController;
