import { Schema, model } from "mongoose";

// Definición del esquema para la gestión de clientes en el sistema
const clientesSchema = new Schema(
    {
        // Nombre del cliente
        name: { type: String },

        // Apellidos del cliente
        lastName: { type: String },

        // Fecha de nacimiento para promociones o registro
        birthdate: { type: Date },

        // Correo electrónico de acceso y notificación
        email: { type: String },

        // Contraseña encriptada
        password: { type: String },

        // Estado de verificación de cuenta
        isVerified: { type: Boolean },

        // Contador de intentos fallidos de inicio de sesión
        loginAttemps: { type: Number },

        // Fecha y hora hasta la cual la cuenta permanece bloqueada por seguridad
        timeOut: { type: Date },
    },
    {
        // Timestamps de creación/actualización y colección explícita Clientes
        timestamps: true,
        strict: false,
        collection: "Clientes"
    },
);

// Exportar modelo de Clientes
export default model("Clientes", clientesSchema);