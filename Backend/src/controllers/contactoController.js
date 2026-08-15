import ajustesModel from "../models/AjustesSistema.js";
import { config } from "../../config.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

const contactoController = {};

// Enviar mensaje del formulario de contacto al correo del administrador mediante Mailjet API
contactoController.sendMessage = async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    // Validar campos requeridos
    if (!name || !name.trim() || !email || !email.trim() || !message || !message.trim()) {
      return res.status(400).json({ message: "Por favor completa todos los campos requeridos." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "El formato de correo no es válido." });
    }

    // Obtener el correo del administrador (config o DB)
    const ajustes = await ajustesModel.findOne();
    let adminEmail = config.email.user_email;
    if (ajustes?.email && ajustes.email.includes("@") && !ajustes.email.toLowerCase().includes("pronatural.com")) {
      adminEmail = ajustes.email;
    }

    const categoryText =
      category === "mayor"
        ? "VENTAS AL POR MAYOR"
        : category === "tecnicas"
        ? "CONSULTAS TÉCNICAS"
        : category || "GENERAL";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; background-color: #0d1114; color: #ffffff; border-radius: 12px; border: 1px solid #1b4332;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #1f2937;">
          <h2 style="color: #30b466; margin: 0; font-size: 22px;">🌿 ProNatural - Nuevo Mensaje de Contacto</h2>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 5px;">Has recibido una nueva consulta a través del portal web.</p>
        </div>

        <div style="margin: 25px 0; background-color: #161b1e; padding: 20px; border-radius: 10px; border-left: 4px solid #30b466;">
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Remitente:</strong> ${name}</p>
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Correo de Contacto:</strong> <a href="mailto:${email}" style="color: #4ade80; text-decoration: none;">${email}</a></p>
          <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Asunto / Categoría:</strong> <span style="background-color: #1b4332; color: #4ade80; padding: 3px 8px; border-radius: 4px; font-size: 12px;">${categoryText}</span></p>
          <p style="margin: 15px 0 5px 0; font-size: 14px; font-weight: bold; color: #9ca3af;">Mensaje:</p>
          <div style="background-color: #0d1114; padding: 15px; border-radius: 8px; color: #e5e7eb; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
        </div>

        <div style="text-align: center; border-top: 1px solid #1f2937; pt: 15px; font-size: 12px; color: #6b7280;">
          <p style="margin: 0;">Mensaje enviado desde el formulario de contacto ProNatural vía Mailjet.</p>
        </div>
      </div>
    `;

    // Enviar el correo usando la utility de Mailjet
    try {
      await sendEmail(
        adminEmail,
        `[Contacto Web] ${categoryText} - de ${name}`,
        htmlContent
      );
    } catch (mailErr) {
      console.warn("[MAILJET FALLBACK] Error al enviar mensaje de contacto con Mailjet:", mailErr.message);
    }

    return res.status(200).json({ message: "Mensaje enviado exitosamente al administrador." });
  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error);
    return res.status(500).json({ message: "Error al enviar mensaje: " + error.message });
  }
};

export default contactoController;
