import { Schema, model } from "mongoose";

// Esquema para usuarios administradores del sistema
const usersSchema = new Schema({
    // Nombre del usuario administrador
    nombre: { type: String, required: true },

    // Apellido del administrador
    apellido: { type: String },

    // Correo electrónico único para inicio de sesión
    correo: { type: String, required: true, unique: true },

    // Contraseña encriptada
    contraseña: { type: String, required: true },

    // Número de teléfono de contacto
    telefono: { type: String },

    // Indicador de cuenta verificada
    isVerified: { type: Boolean, default: false },

    // Intentos fallidos de inicio de sesión
    loginAttemps: { type: Number, default: 0 },

    // Fecha límite de bloqueo temporal
    timeOut: { type: Date }
}, {
    // Timestamps automáticos y compatibilidad de campos flexibles
    timestamps: true,
    strict: false
});

// Exportar modelo en la colección Admin
export default model("Admin", usersSchema, "Admin");
