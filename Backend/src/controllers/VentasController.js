import salesModel from "../models/Ventas.js";
import productsModel from "../models/Productos.js";
import { config } from "../../config.js";
import { sendEmail } from "../utils/sendMailMailjet.js";

// Objeto agrupador del controlador de ventas
const controladoresVentas = {};

// Obtener el historial completo de ventas realizadas
controladoresVentas.getSales = async (req, res) => {
  try {
    const sales = await salesModel
      .find()
      .populate("customerId", "name lastName email phone")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "nombreProducto precio sku idCategoria imagenProducto")
      .sort({ createdAt: -1 });

    return res.status(200).json(sales);
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return res.status(500).json({ message: "Error al consultar ventas." });
  }
};

// Obtener un resumen de las métricas principales de ventas
controladoresVentas.getSalesSummary = async (req, res) => {
  try {
    // Filtrar ventas excluyendo las que fueron canceladas
    const sales = await salesModel.find({ status: { $ne: 'cancelled' } });

    // Contar el total de ventas válidas
    const totalSalesCount = sales.length;

    // Sumar el total de ingresos generados
    const totalRevenue = sales.reduce((acc, s) => acc + (s.total || 0), 0);

    // Calcular el valor promedio por pedido
    const averageOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    // Retornar el resumen de métricas
    return res.status(200).json({
      totalSalesCount,
      totalRevenue,
      averageOrderValue
    });
  } catch (error) {
    console.error("Error al obtener resumen de ventas:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener ventas dentro de un rango específico de fechas
controladoresVentas.getSalesByDateRange = async (req, res) => {
  try {
    // Tomar fecha inicial y final del cuerpo del request
    const { startDate, endDate } = req.body;
    const query = {};

    // Si se especificaron fechas, construir la condición de filtro en la consulta
    if (startDate || endDate) {
      query.createdAt = {};

      // Si hay fecha de inicio, agregar límite inferior
      if (startDate) query.createdAt.$gte = new Date(startDate);

      // Si hay fecha de fin, agregar límite superior
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Buscar las ventas que coincidan con el rango de fechas
    const sales = await salesModel
      .find(query)
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "nombreProducto precio")
      .sort({ createdAt: -1 });

    // Responder con la lista filtrada
    return res.status(200).json(sales);
  } catch (error) {
    console.error("Error al obtener ventas por fechas:", error);
    return res.status(500).json({ message: "Error al filtrar ventas por fecha." });
  }
};

// Obtener los detalles de una venta en específico por su ID
controladoresVentas.getSaleById = async (req, res) => {
  try {
    // Obtener id de la venta desde la URL
    const { id } = req.params;

    // Buscar la venta en MongoDB con sus referencias pobladas
    const sale = await salesModel
      .findById(id)
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "nombreProducto precio descripcion");

    // Si la venta no existe en la base de datos
    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada." });
    }

    // Devolver los detalles de la venta
    return res.status(200).json(sale);
  } catch (error) {
    console.error("Error al obtener detalle de venta:", error);
    return res.status(500).json({ message: "Error interno al consultar la venta." });
  }
};

// Registrar una nueva venta
controladoresVentas.insertSale = async (req, res) => {
  try {
    // Extraer datos del cliente, lista de productos, método de pago, estado y notas
    const { customerId, products, paymentMethod, status, notes } = req.body;

    // Obtener el ID del empleado desde el objeto del usuario autenticado si existe
    const employeeId = req.user ? req.user.id : null;

    // Validar que se reciba un arreglo válido de productos y que no esté vacío
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "La venta debe incluir al menos un producto." });
    }

    let total = 0;
    const newProducts = [];

    // Iterar cada producto solicitado para validar existencias e inventario
    for (let i = 0; i < products.length; i++) {
      const item = products[i];

      // Validar que el producto tenga un ID válido
      if (!item.productId) {
        return res.status(400).json({ message: `Producto inválido en la posición ${i + 1}.` });
      }

      // Convertir la cantidad a número
      const quantity = Number(item.quantity);

      // Comprobar que sea un número entero positivo mayor a cero
      if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        return res.status(400).json({ 
          message: "La cantidad solicitada debe ser un número entero mayor a cero (0)." 
        });
      }

      // Buscar el producto en la base de datos para obtener su precio real
      const productFound = await productsModel.findById(item.productId);

      // Si el producto no se encuentra en el catálogo
      if (!productFound) {
        return res.status(404).json({
          message: "Producto no encontrado en el catálogo.",
        });
      }

      // Validar que el stock disponible sea suficiente para cubrir la cantidad pedida
      if (productFound.stock < quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para ${productFound.nombreProducto}. Disponibles: ${productFound.stock}, solicitados: ${quantity}.`,
        });
      }

      // Calcular el precio unitario y subtotal en el servidor
      const unitPrice = typeof productFound.precio === 'number' ? productFound.precio : 0;
      const subtotal = unitPrice * quantity;
      total += subtotal;

      // Agregar al arreglo de productos procesados de la venta
      newProducts.push({
        productId: item.productId,
        quantity,
        unitPrice,
        subtotal,
      });
    }

    // Descontar la cantidad vendida del inventario de productos
    for (let i = 0; i < newProducts.length; i++) {
      const item = newProducts[i];

      // Solo descontar si el estado de la venta no es de WhatsApp pendiente
      if (status !== 'Pendiente WhatsApp') {
        const updatedProduct = await productsModel.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { returnDocument: 'after' }
        );

        // Si el stock baja de 15 unidades, enviar una alerta por correo
        if (updatedProduct && updatedProduct.stock <= 15) {
          try {
            const transporter = nodemailer.createTransport({
              service: "gmail",
              auth: {
                user: config.email.user_email,
                pass: config.email.user_password,
              },
            });

            await transporter.sendMail({
              from: `"ProNatural Store" <${config.email.user_email}>`,
              to: config.email.user_email,
              subject: `⚠️ Alerta de Bajo Stock: ${updatedProduct.nombreProducto}`,
              html: `
                <h2>Alerta de Inventario</h2>
                <p>El producto <strong>${updatedProduct.nombreProducto}</strong> ha alcanzado un nivel bajo de stock.</p>
                <p><strong>Stock disponible:</strong> <span style="color:red; font-size:18px; font-weight:bold">${updatedProduct.stock}</span> unidades.</p>
              `,
            });
          } catch (emailError) {
            console.error("Error al enviar alerta por email:", emailError);
          }
        }
      }
    }

    // Crear el objeto del modelo de venta
    const newSale = new salesModel({
      customerId: customerId || null,
      employeeId,
      products: newProducts,
      total,
      paymentMethod: paymentMethod || "cash",
      status: status || "completed",
      notes: notes || "",
    });

    // Guardar la venta en la base de datos
    const savedSale = await newSale.save();
    
    // Consultar el registro con sus relaciones de productos y clientes totalmente pobladas
    const populatedSale = await salesModel.findById(savedSale._id)
      .populate("customerId", "name lastName email")
      .populate("employeeId", "name lastName")
      .populate("products.productId", "nombreProducto precio");

    // Responder con código de éxito 201
    return res.status(201).json(populatedSale);
  } catch (error) {
    console.error("Error al registrar la venta:", error);
    return res.status(500).json({ message: "Error interno al procesar la venta." });
  }
};

// Actualizar el estado de una venta existente
controladoresVentas.updateSaleStatus = async (req, res) => {
  try {
    // Tomar ID del parámetro y nuevo estado del cuerpo
    const { id } = req.params;
    const { status, notes } = req.body;

    // Buscar la venta a modificar
    const sale = await salesModel.findById(id);

    // Si la venta no existe
    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada." });
    }

    // Normalizar comprobaciones de estado
    const isTargetCancelled = status === "Cancelado" || status === "cancelled";
    const isOriginalCancelled = sale.status === "Cancelado" || sale.status === "cancelled";

    // Si la venta se cancela, devolver las unidades al stock de inventario si no estaban ya canceladas ni eran Pendiente WhatsApp (que no habían descontado stock)
    if (isTargetCancelled && !isOriginalCancelled && sale.status !== "Pendiente WhatsApp" && sale.status !== "Pendiente") {
      for (const item of sale.products) {
        if (item.productId) {
          await productsModel.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } },
            { returnDocument: 'after' }
          );
        }
      }
    }

    // Si se completa/entrega una venta previa de WhatsApp o Pendiente, descontar el stock
    const isTargetCompleted = status === "Completado" || status === "Entregado";
    const isOriginalPending = sale.status === "Pendiente WhatsApp" || sale.status === "Pendiente";

    if (isTargetCompleted && isOriginalPending) {
      for (const item of sale.products) {
        if (item.productId) {
          await productsModel.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { returnDocument: 'after' }
          );
        }
      }
    }

    // Actualizar campos de estado y notas si se proporcionan
    if (status) sale.status = status;
    if (notes !== undefined) sale.notes = notes;

    // Guardar los cambios de la venta
    await sale.save();

    // Responder con éxito
    return res.status(200).json({ message: "Estado de la venta actualizado.", sale });
  } catch (error) {
    console.error("Error al actualizar estado de venta:", error);
    return res.status(500).json({ message: "Error al actualizar la venta." });
  }
};

// Enviar un recibo/factura digital en formato HTML por correo al cliente
controladoresVentas.sendInvoiceEmail = async (req, res) => {
  try {
    // Obtener ID de la venta y el correo de destino
    const { id } = req.params;
    const { recipientEmail } = req.body;

    // Buscar la venta en la base de datos
    const sale = await salesModel
      .findById(id)
      .populate("customerId", "name lastName email")
      .populate("products.productId", "nombreProducto precio");

    // Si la venta no existe
    if (!sale) {
      return res.status(404).json({ message: "Venta no encontrada." });
    }

    // Determinar la dirección de correo de destino
    const targetEmail = recipientEmail || sale.customerId?.email;

    // Validar que se cuente con un correo
    if (!targetEmail) {
      return res.status(400).json({ message: "Se requiere un correo de destino para la factura." });
    }

    // Construir tabla HTML con el desglose de productos
    const itemsHtml = sale.products ? sale.products.map(p => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #1f2937;">${p.productId?.nombreProducto || p.productId?.name || 'Producto'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #1f2937; text-align: center;">${p.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #1f2937; text-align: right;">$${p.unitPrice?.toFixed(2) || '0.00'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #1f2937; text-align: right;">$${p.subtotal?.toFixed(2) || '0.00'}</td>
      </tr>
    `).join('') : '';

    // Enviar el correo electrónico mediante la utility de Mailjet
    try {
      await sendEmail(
        targetEmail,
        `🧾 Recibo de Compra #${sale._id.toString().substring(0, 6).toUpperCase()} - ProNatural`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1b4332; border-radius: 8px; background-color: #0a0d0f; color: #ffffff;">
          <h2 style="color: #30b466; margin-top: 0;">ProNatural Store</h2>
          <p>Adjuntamos el desglose de tu compra:</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #0a2016; color: white;">
                <th style="padding: 8px; text-align: left;">Producto</th>
                <th style="padding: 8px; text-align: center;">Cant.</th>
                <th style="padding: 8px; text-align: right;">P. Unit</th>
                <th style="padding: 8px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <h3 style="text-align: right; color: #4ade80; margin-top: 15px;">Total: $${sale.total?.toFixed(2) || '0.00'}</h3>
        </div>
        `
      );
    } catch (mailErr) {
      console.warn("[MAILJET FALLBACK] Error al enviar recibo de compra con Mailjet:", mailErr.message);
    }

    // Retornar mensaje de confirmación
    return res.status(200).json({ message: "Factura enviada por correo." });
  } catch (error) {
    console.error("Error al enviar factura:", error);
    return res.status(500).json({ message: "Error al enviar la factura por correo." });
  }
};

// Eliminar un registro de venta por su ID
controladoresVentas.deleteSale = async (req, res) => {
  try {
    // Tomar ID del parámetro
    const { id } = req.params;

    // Eliminar la venta de la base de datos
    const eliminada = await salesModel.findByIdAndDelete(id);

    // Si la venta no fue encontrada
    if (!eliminada) {
      return res.status(404).json({ message: "Venta no encontrada." });
    }

    // Responder que la venta fue eliminada correctamente
    return res.status(200).json({ message: "Venta eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar venta:", error);
    return res.status(500).json({ message: "Error al eliminar la venta." });
  }
};

export default controladoresVentas;
