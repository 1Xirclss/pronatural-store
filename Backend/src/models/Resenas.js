import { Schema, model } from "mongoose";

// Definición del esquema para las reseñas y testimonios de clientes
const reviewsSchema = new Schema(
  {
    // Nombre del cliente que publica la reseña (obligatorio)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Calificación otorgada entre 1 y 5 estrellas (obligatorio)
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Comentario u opinión escrita por el usuario
    comment: {
      type: String,
      required: true,
      trim: true,
    },

    // Estado de la reseña (aprobada o pendiente de moderación)
    status: {
      type: String,
      default: "approved",
      enum: ["approved", "pending"],
    }
  },
  {
    // Timestamps de fecha y versión desactivada
    timestamps: true,
    versionKey: false,
    strict: false,
  }
);

// Exportar el modelo de reseñas mapeado a la colección Reseñas
export default model("Reseñas", reviewsSchema, "Reseñas");
