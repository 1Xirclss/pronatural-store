import ajustesModel from "../models/AjustesSistema.js";
import productsModel from "../models/Productos.js";
import categoriasModel from "../models/Categorias.js";
import PDFDocument from "pdfkit";
import cron from "node-cron";
import { config } from "../../config.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

const controladoresAjustes = {};

// Obtener la configuración general del sistema
controladoresAjustes.getConfig = async (req, res) => {
  try {
    let ajustes = await ajustesModel.findOne();
    if (!ajustes) {
      const nuevosAjustes = new ajustesModel({});
      ajustes = await nuevosAjustes.save();
    }
    return res.status(200).json(ajustes);
  } catch (error) {
    console.log("Error al obtener ajustes: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Actualizar la configuración del sistema y sincronizar el cron job
controladoresAjustes.updateConfig = async (req, res) => {
  try {
    const data = req.body;
    let ajustes = await ajustesModel.findOne();

    if (!ajustes) {
      ajustes = new ajustesModel(data);
    } else {
      // Asignar propiedades para evitar pérdida de subdocumentos en Mongo
      if (data.storeName !== undefined) ajustes.storeName = data.storeName;
      if (data.ruc !== undefined) ajustes.ruc = data.ruc;
      if (data.email !== undefined) ajustes.email = data.email;
      if (data.phone !== undefined) ajustes.phone = data.phone;
      if (data.address !== undefined) ajustes.address = data.address;
      if (data.website !== undefined) ajustes.website = data.website;
      if (data.whatsapp !== undefined) ajustes.whatsapp = data.whatsapp;
      if (data.mapUrl !== undefined) ajustes.mapUrl = data.mapUrl;
      if (data.instagram !== undefined) ajustes.instagram = data.instagram;
      if (data.facebook !== undefined) ajustes.facebook = data.facebook;
      if (data.tiktok !== undefined) ajustes.tiktok = data.tiktok;
      if (data.youtube !== undefined) ajustes.youtube = data.youtube;
      if (data.taxRate !== undefined) ajustes.taxRate = Number(data.taxRate);
      if (data.deliveryFee !== undefined) ajustes.deliveryFee = Number(data.deliveryFee);

      if (data.metas) {
        ajustes.metas = {
          diaria: Number(data.metas.diaria ?? ajustes.metas?.diaria ?? 150),
          semanal: Number(data.metas.semanal ?? ajustes.metas?.semanal ?? 1050),
          mensual: Number(data.metas.mensual ?? ajustes.metas?.mensual ?? 4500)
        };
      }

      if (data.notificaciones) {
        ajustes.notificaciones = {
          enabled: Boolean(data.notificaciones.enabled ?? true),
          lowStock: Boolean(data.notificaciones.lowStock ?? true),
          outOfStock: Boolean(data.notificaciones.outOfStock ?? true)
        };
      }

      if (data.reporteSemanal) {
        ajustes.reporteSemanal = {
          enabled: Boolean(data.reporteSemanal.enabled),
          dia: Number(data.reporteSemanal.dia ?? 1),
          hora: Number(data.reporteSemanal.hora ?? 8),
          minuto: Number(data.reporteSemanal.minuto ?? 0)
        };
      }
    }

    // Guardar cambios en la base de datos
    await ajustes.save();

    await controladoresAjustes.initCronJob();

    return res.status(200).json({ message: "Ajustes actualizados exitosamente", ajustes });
  } catch (error) {
    console.log("Error al actualizar ajustes: " + error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

let scheduledJob = null;

// Inicializar o reiniciar la tarea programada (cron job) para el envío automático del PDF
controladoresAjustes.initCronJob = async () => {
  try {
    const ajustes = await ajustesModel.findOne();

    // Detener la tarea previa si ya estaba corriendo
    if (scheduledJob) {
      scheduledJob.stop();
      scheduledJob = null;
    }

    // Verificar si el envío automático está activado en los ajustes
    if (ajustes && ajustes.reporteSemanal && ajustes.reporteSemanal.enabled) {
      const dia = Number(ajustes.reporteSemanal.dia ?? 1);
      const hora = Number(ajustes.reporteSemanal.hora ?? 8);
      const minuto = Number(ajustes.reporteSemanal.minuto ?? 0);

      // Construir la expresión cron: "minuto hora * * dia"
      const cronExpression = `${minuto} ${hora} * * ${dia}`;

      const diasNombre = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      const diaTexto = diasNombre[dia] || "Día " + dia;
      const minutoFormat = minuto.toString().padStart(2, '0');

      // Programar la tarea periódica con node-cron en la zona horaria local
      scheduledJob = cron.schedule(cronExpression, async () => {
        console.log(`[Cron Job] Ejecutando envío automático de reporte de inventario (${cronExpression})...`);
        try {
          await controladoresAjustes.sendInventoryReport();
          console.log("[Cron Job] Reporte de inventario enviado automáticamente con éxito por correo.");
        } catch (err) {
          console.error("[Cron Job Error] Error durante el envío automático del reporte:", err);
        }
      }, {
        scheduled: true,
        timezone: "America/El_Salvador"
      });

      console.log(`[Cron Job] Programación activa exitosamente: Todos los ${diaTexto} a las ${hora}:${minutoFormat} hrs (${cronExpression})`);
    } else {
      console.log("[Cron Job] Envío automático de reportes deshabilitado en ajustes.");
    }
  } catch (error) {
    console.log("Error al configurar cron job:", error);
  }
};

// Generar PDF de inventario y enviarlo por correo al administrador
controladoresAjustes.sendInventoryReport = async (req, res) => {
  try {
    const ajustes = await ajustesModel.findOne();
    const adminEmail = req?.user?.email || ajustes?.email || config.email.user_email;

    // Cargar productos y categorías de la base de datos
    const [products, categories] = await Promise.all([
      productsModel.find().sort({ stock: 1 }),
      categoriasModel.find()
    ]);

    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat._id.toString()] = cat.nombre;
    });

    const totalProducts = products.length;
    let totalStockCount = 0;
    let totalInventoryValue = 0;
    let lowStockAlertCount = 0;

    // Calcular métricas generales de inventario
    products.forEach(p => {
      const stock = typeof p.stock === 'number' ? p.stock : 0;
      const price = typeof p.precio === 'number' ? p.precio : (typeof p.price === 'number' ? p.price : 0);
      totalStockCount += stock;
      totalInventoryValue += stock * price;
      if (stock <= 15) lowStockAlertCount++;
    });

    // Crear el documento PDF en memoria
    const doc = new PDFDocument({ size: 'LETTER', margin: 0, bufferPages: true });
    let buffers = [];
    doc.on("data", buffers.push.bind(buffers));

    // Dibujar encabezado institucional en el PDF
    const drawHeader = (doc) => {
      doc.rect(0, 0, 612, 85).fill("#1b4332");
      doc.rect(0, 85, 612, 4).fill("#30b466");

      doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold").text("PRO NATURAL", 40, 22);
      doc.fillColor("#4ade80").fontSize(10).font("Helvetica-Bold").text("REPORTE EJECUTIVO DE INVENTARIO Y STOCK", 40, 48);

      const todayStr = new Date().toLocaleDateString("es-SV", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      doc.fillColor("#ffffff").fontSize(9).font("Helvetica").text(`Fecha: ${todayStr}`, 400, 35, { width: 172, align: "right" });
    };

    // Dibujar tarjetas de resumen métrico
    const drawSummaryCards = (doc) => {
      const startY = 102;
      const cardW = 125;
      const cardH = 45;
      const gap = 8;
      const cards = [
        { label: "PRODUCTOS TOTALES", value: `${totalProducts}`, color: "#1e293b" },
        { label: "UNIDADES EN STOCK", value: `${totalStockCount}`, color: "#0284c7" },
        { label: "VALOR EN INVENTARIO", value: `$${totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#059669" },
        { label: "ALERTAS DE STOCK", value: `${lowStockAlertCount}`, color: lowStockAlertCount > 0 ? "#dc2626" : "#059669" }
      ];

      cards.forEach((card, idx) => {
        const x = 40 + idx * (cardW + gap);
        doc.rect(x, startY, cardW, cardH).fillAndStroke("#f8fafc", "#e2e8f0");
        doc.rect(x, startY, cardW, 3).fill(card.color);
        doc.fillColor("#64748b").fontSize(7).font("Helvetica-Bold").text(card.label, x + 8, startY + 8, { width: cardW - 16 });
        doc.fillColor(card.color).fontSize(12).font("Helvetica-Bold").text(card.value, x + 8, startY + 22, { width: cardW - 16 });
      });
    };

    // Dibujar encabezados de la tabla de productos
    const drawTableHeader = (doc, y) => {
      doc.rect(40, y, 532, 22).fill("#161b1e");
      doc.fillColor("#ffffff").fontSize(8).font("Helvetica-Bold");

      doc.text("PRODUCTO", 50, y + 6, { width: 180, align: "left" });
      doc.text("CATEGORÍA", 230, y + 6, { width: 100, align: "left" });
      doc.text("STOCK", 335, y + 6, { width: 50, align: "center" });
      doc.text("PRECIO UNIT.", 390, y + 6, { width: 80, align: "right" });
      doc.text("ESTADO", 480, y + 6, { width: 80, align: "center" });
    };

    drawHeader(doc);
    drawSummaryCards(doc);

    let currentY = 160;
    drawTableHeader(doc, currentY);
    currentY += 22;

    // Renderizar filas de productos con paginación dinámica
    products.forEach((p, index) => {
      if (currentY > 710) {
        doc.addPage();
        drawHeader(doc);
        currentY = 100;
        drawTableHeader(doc, currentY);
        currentY += 22;
      }

      const isEven = index % 2 === 0;
      const rowBg = isEven ? "#f8fafc" : "#ffffff";

      doc.rect(40, currentY, 532, 22).fill(rowBg);
      doc.rect(40, currentY + 21, 532, 1).fill("#f1f5f9");

      const nameStr = (p.nombreProducto || p.name || p.nombre || "Producto").substring(0, 32);
      const catStr = (p.categoria || categoryMap[p.idCategoria?.toString()] || p.idCategoria || "General").substring(0, 18);
      const stock = typeof p.stock === 'number' ? p.stock : 0;
      const price = typeof p.precio === 'number' ? p.precio : (typeof p.price === 'number' ? p.price : 0);

      doc.fillColor("#0f172a").fontSize(8.5).font("Helvetica-Bold").text(nameStr, 50, currentY + 6, { width: 180, align: "left" });
      doc.fillColor("#475569").fontSize(8).font("Helvetica").text(catStr, 230, currentY + 6, { width: 100, align: "left" });

      const stockColor = stock <= 15 ? "#dc2626" : "#0f172a";
      doc.fillColor(stockColor).fontSize(8.5).font(stock <= 15 ? "Helvetica-Bold" : "Helvetica").text(`${stock}`, 335, currentY + 6, { width: 50, align: "center" });
      doc.fillColor("#059669").fontSize(8.5).font("Helvetica-Bold").text(`$${price.toFixed(2)}`, 390, currentY + 6, { width: 80, align: "right" });

      let badgeBg = "#ecfdf5";
      let badgeText = "#059669";
      let badgeLabel = "Disponible";

      if (stock === 0) {
        badgeBg = "#fef2f2";
        badgeText = "#dc2626";
        badgeLabel = "Agotado";
      } else if (stock <= 15) {
        badgeBg = "#fffbe6";
        badgeText = "#d97706";
        badgeLabel = "Stock Bajo";
      }

      const badgeX = 490;
      const badgeY = currentY + 4;
      const badgeW = 60;
      const badgeH = 14;

      doc.rect(badgeX, badgeY, badgeW, badgeH).fill(badgeBg);
      doc.fillColor(badgeText).fontSize(7).font("Helvetica-Bold").text(badgeLabel, badgeX, badgeY + 3, { width: badgeW, align: "center" });

      currentY += 22;
    });

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.rect(40, 750, 532, 1).fill("#e2e8f0");
      doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica").text("ProNatural Store - Sistema de Control de Inventario y Seguridad", 40, 756, { width: 300, align: "left" });
      doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica").text(`Página ${i + 1} de ${range.count}`, 472, 756, { width: 100, align: "right" });
    }

    doc.end();

    const pdfBuffer = await new Promise((resolve) => {
      doc.on("end", () => resolve(Buffer.concat(buffers)));
    });

    // Enviar el reporte generado por correo mediante la utility de Mailjet
    try {
      await sendEmail(
        adminEmail,
        `Reporte de Inventario - ProNatural - ${new Date().toLocaleDateString("es-SV")}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0d1114; color: #ffffff; border-radius: 10px;">
          <h2 style="color: #30b466; margin-top: 0;">Reporte de Inventario Generado</h2>
          <p>Hola,</p>
          <p>Adjunto a este correo encontrarás el informe detallado de inventario en formato PDF con la paleta oficial de ProNatural.</p>
          <div style="background-color: #161b1e; padding: 15px; border-left: 4px solid #30b466; margin: 15px 0;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">RESUMEN RÁPIDO:</p>
            <p style="margin: 5px 0 0 0; color: #ffffff;"><strong>Total Productos:</strong> ${totalProducts}</p>
            <p style="margin: 3px 0 0 0; color: #ffffff;"><strong>Unidades en Stock:</strong> ${totalStockCount}</p>
            <p style="margin: 3px 0 0 0; color: #4ade80;"><strong>Valor Total:</strong> $${totalInventoryValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p style="margin: 3px 0 0 0; color: ${lowStockAlertCount > 0 ? '#ef4444' : '#4ade80'};"><strong>Productos en Alerta (<=15):</strong> ${lowStockAlertCount}</p>
          </div>
          <p style="font-size: 12px; color: #6b7280;">Este informe fue generado automáticamente por el sistema ProNatural vía Mailjet.</p>
        </div>
        `,
        [
          {
            filename: `Inventario_ProNatural_${new Date().toISOString().split("T")[0]}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf"
          }
        ]
      );
    } catch (mailErr) {
      console.warn("[MAILJET FALLBACK] Error enviando reporte por Mailjet:", mailErr.message);
    }

    if (res) {
      return res.status(200).json({ message: "Reporte de inventario enviado exitosamente por correo." });
    }
  } catch (error) {
    console.error("Error al generar y enviar reporte de inventario:", error);
    if (res) {
      return res.status(500).json({ message: "Error al generar reporte: " + error.message });
    }
  }
};

export default controladoresAjustes;
