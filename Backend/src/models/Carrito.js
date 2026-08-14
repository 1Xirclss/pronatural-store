import { Schema, model } from "mongoose";

// Esquema para el almacenamiento del carrito de compras temporal o persistente
const carritoSchema = new Schema(
  {
    // Identificador único de sesión o cliente para asociar el carrito
    sessionId: { type: String, required: true, unique: true },

    // Arreglo de elementos agregados al carrito
    productos: [
      {
        // Referencia al ID del producto en la colección Productos
        productId: { type: Schema.Types.ObjectId, ref: "Productos", required: true },

        // Cantidad seleccionada de unidades (mínimo 1)
        quantity: { type: Number, required: true, min: 1 },
      }
    ],
  },
  {
    // Generar marcas de tiempo automáticas y desactivar campo __v
    timestamps: true,
    versionKey: false
  }
);

// Exportar modelo en la colección Carrito
export default model("Carrito", carritoSchema, "Carrito");
