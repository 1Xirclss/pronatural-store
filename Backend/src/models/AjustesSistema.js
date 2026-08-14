import mongoose, { Schema, model } from "mongoose";

// Definición del esquema para la configuración general del sistema y tienda
const ajustesSistemaSchema = new Schema(
  {
    // Nombre comercial de la tienda
    storeName: { type: String, default: "Pro Natural" },

    // Registro o número de identificación fiscal RUC / NIT
    ruc: { type: String, default: "" },

    // Correo electrónico principal de contacto administrativo
    email: { type: String, default: "mam270508@gmail.com" },

    // Teléfono fijo o de atención al cliente
    phone: { type: String, default: "+503 2222-2222" },

    // Dirección física de la tienda o casa matriz
    address: { type: String, default: "San Salvador, El Salvador" },

    // Dirección web oficial del proyecto
    website: { type: String, default: "https://pronatural.com" },

    // Número de teléfono para pedidos por WhatsApp
    whatsapp: { type: String, default: "50369674467" },

    // Enlace de Google Maps de la ubicación física
    mapUrl: { type: String, default: "" },

    // Usuario o enlace de Instagram
    instagram: { type: String, default: "@pronatural" },

    // Usuario o enlace de Facebook
    facebook: { type: String, default: "fb.com/pronatural" },

    // Usuario o enlace de TikTok
    tiktok: { type: String, default: "@pronatural" },

    // Usuario o canal de YouTube
    youtube: { type: String, default: "youtube.com/@pronatural" },

    // Porcentaje de impuesto aplicable en El Salvador (%) (Ej. 0, 13)
    taxRate: { type: Number, default: 0 },

    // Tarifa fija de envío / delivery ($ USD)
    deliveryFee: { type: Number, default: 3.50 },

    // Objetivos y metas de ventas de la empresa
    metas: {
      diaria: { type: Number, default: 150 },
      semanal: { type: Number, default: 1050 },
      mensual: { type: Number, default: 4500 }
    },

    // Configuración del módulo de notificaciones del sistema
    notificaciones: {
      enabled: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      outOfStock: { type: Boolean, default: true }
    },

    // Programación de envío automático de reportes de inventario
    reporteSemanal: {
      enabled: { type: Boolean, default: false },
      dia: { type: Number, default: 1 }, // 1 = Día Lunes de la semana
      hora: { type: Number, default: 8 }, // 8 = Hora 8:00 AM
      minuto: { type: Number, default: 0 } // 0 = Minuto 00
    }
  },
  {
    // Agregar campos automáticos de createdAt y updatedAt
    timestamps: true,
  }
);

// Exportar el modelo asignado a la colección AjustesSistema
export default model("AjustesSistema", ajustesSistemaSchema, "AjustesSistema");
