import { Schema, model } from "mongoose";

// Definición del esquema para las categorías del catálogo de productos
const categoriesSchema = new Schema(
  {
    // Nombre identificador de la categoría (obligatorio)
    nombre: {
      type: String,
      required: true,
    },

    // Descripción o detalle explicativo de la categoría
    descripcion: {
      type: String,
    },

    // Clasificación o tipo de la categoría
    tipo: { 
      type: String 
    },

    // Cantidad estimada o contabilidad de productos asociados
    cantidad: { 
      type: Number, 
      default: 0 
    }
  },
  {
    // Habilitar timestamps automáticos y permitir atributos opcionales flexibles
    timestamps: true,
    strict: false,
  }
);

// Exportar modelo para la colección Categorias
export default model("Categorias", categoriesSchema, "Categorias");
