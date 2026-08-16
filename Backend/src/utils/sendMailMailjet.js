// 1. Importamos Mailjet, Nodemailer y el archivo config
import Mailjet from "node-mailjet";
import nodemailer from "nodemailer";
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

const sendViaNodemailer = async (to, subject, html, attachments = null) => {
  const userEmail = config.email.user_email;
  const userPassword = config.email.user_password;

  if (!userEmail || !userPassword || userPassword === "password123") {
    console.warn("[EMAIL] No hay credenciales válidas de Gmail (USER_EMAIL / USER_PASSWORD) en .env");
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: userEmail,
      pass: userPassword,
    },
  });

  const mailOptions = {
    from: `"ProNatural Store" <${userEmail}>`,
    to,
    subject,
    html,
  };

  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    mailOptions.attachments = attachments.map((att) => ({
      filename: att.filename || att.Filename || "archivo.pdf",
      content: att.content || att.Base64Content,
      contentType: att.contentType || att.ContentType || "application/pdf",
    }));
  }

  const info = await transporter.sendMail(mailOptions);
  console.log(`[NODEMAILER GMAIL] Correo enviado exitosamente a ${to}: ${info.messageId}`);
  return info;
};

/**
 * Función reutilizable para enviar correos (intenta Mailjet y si no está o falla, usa Nodemailer Gmail)
 * @param {string} to - Email del destinatario
 * @param {string} subject - Asunto del correo
 * @param {string} html - Contenido HTML del correo
 * @param {Array} attachments - Lista opcional de adjuntos (archivos PDF, imágenes, etc.)
 */
export const sendEmail = async (to, subject, html, attachments = null) => {
  const client = getMailjetClient();
  if (client) {
    try {
      const messagePayload = {
        From: {
          Email: config.mailjet.fromEmail || "no-reply@pronatural.com",
          Name: config.mailjet.fromName || "ProNatural Store",
        },
        To: [{ Email: to }],
        Subject: subject,
        HTMLPart: html,
      };

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
    } catch (mjErr) {
      console.warn(`[MAILJET FALLBACK] Error con Mailjet (${mjErr.message}), enviando por Nodemailer Gmail...`);
      return await sendViaNodemailer(to, subject, html, attachments);
    }
  } else {
    return await sendViaNodemailer(to, subject, html, attachments);
  }
};
