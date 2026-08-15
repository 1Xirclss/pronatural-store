// 1. Importamos Mailjet y el archivo config
import Mailjet from "node-mailjet";
import { config } from "../../config.js";

// 2. Conectamos con la API de Mailjet usando las claves del .env
let mailjetClient = null;

const getMailjetClient = () => {
  if (
    !mailjetClient &&
    config.mailjet.apiKey &&
    config.mailjet.secretKey &&
    config.mailjet.apiKey !== "tu_api_key_aqui"
  ) {
    mailjetClient = Mailjet.apiConnect(
      config.mailjet.apiKey,
      config.mailjet.secretKey
    );
  }
  return mailjetClient;
};

/**
 * Función reutilizable para enviar correos con Mailjet por API HTTP
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido HTML del correo
 * @param {Array} attachments - Lista opcional de adjuntos (archivos PDF, imágenes, etc.)
 */
export const sendEmail = async (to, subject, html, attachments = null) => {
  try {
    const client = getMailjetClient();

    if (!client) {
      console.warn(
        "[MAILJET] API Keys de Mailjet no están configuradas en .env. Se omite el envío por API HTTP."
      );
      return null;
    }

    const messagePayload = {
      From: {
        Email: config.mailjet.fromEmail || "no-reply@pronatural.com",
        Name: config.mailjet.fromName || "ProNatural Store",
      },
      To: [{ Email: to }],
      Subject: subject,
      HTMLPart: html,
    };

    // Procesar adjuntos si existen
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      messagePayload.Attachments = attachments.map((att) => ({
        ContentType: att.contentType || att.ContentType || "application/pdf",
        Filename: att.filename || att.Filename || "archivo.pdf",
        Base64Content: Buffer.isBuffer(att.content)
          ? att.content.toString("base64")
          : att.content || att.Base64Content,
      }));
    }

    const result = await client
      .post("send", { version: "v3.1" })
      .request({
        Messages: [messagePayload],
      });

    console.log(`[MAILJET] Correo enviado exitosamente a ${to}`);
    return result.body;
  } catch (error) {
    console.error(
      "[MAILJET ERROR] Error enviando correo con Mailjet:",
      error.response?.body || error.message
    );
    throw error;
  }
};
