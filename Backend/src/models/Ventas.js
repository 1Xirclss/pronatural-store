import mongoose, { Schema, model } from "mongoose";

// Definición del esquema para el registro de ventas y transacciones
const salesSchema = new Schema(
  {
    // ID del cliente que realizó la compra (referencia a la colección Clientes)
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Clientes",
      default: null
    },

    // ID del empleado o vendedor que registró la venta (referencia a Empleados)
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Empleados",
      default: null
    },

    // Detalle de productos incluidos en la transacción
    products: [
      {
        // Referencia al ID del producto comprado
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Productos"
        },

        // Cantidad de unidades vendidas
        quantity: Number,

        // Precio unitario al momento de realizar la venta
        unitPrice: Number,

        // Subtotal acumulado por producto
        subtotal: Number
      }
    ],

    // Monto total acumulado de la venta en USD (obligatorio)
    total: {
      type: Number,
      required: true,
    },

    // Método de pago utilizado (efectivo, tarjeta, transferencia, etc.)
    paymentMethod: {
      type: String,
      default: "cash",
    },

    // Estado de la venta (Completado, Pendiente WhatsApp, Cancelado)
    status: {
      type: String,
      default: "completed"
    },

    // Notas adicionales sobre la orden o el despacho
    notes: {
      type: String
    }
  },
  {
    // Timestamps automáticos de fecha de creación y modificación
    timestamps: true,
    strict: false,
  }
);

// Exportar modelo de la colección Ventas
export default model("Ventas", salesSchema, "Ventas");
