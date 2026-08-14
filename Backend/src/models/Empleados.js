import mongoose from "mongoose";

// Definición del esquema para el personal y empleados de la tienda
const empleadosSchema = new mongoose.Schema(
  {
    // Nombre del empleado (obligatorio)
    nombre: { type: String, required: true },

    // Apellido del empleado (obligatorio)
    apellido: { type: String, required: true },

    // Cargo o puesto de trabajo asignado (Admin, Employee, etc.)
    cargo: { type: String, required: true },

    // Teléfono de contacto del empleado
    telefono: { type: String },

    // Correo electrónico corporativo de acceso (único u obligatorio)
    correo: { type: String, required: true, unique: true },

    // Contraseña encriptada para iniciar sesión
    contraseña: { type: String, required: true },

    // Salario asignado al empleado
    salario: { type: Number, required: true },

    // Fecha de nacimiento del empleado (opcional)
    fechaNacimiento: { type: Date },

    // Indicador si la cuenta fue verificada
    isVerified: { type: Boolean, default: false },

    // Flag para obligar cambio de contraseña en el primer inicio de sesión
    firstLogin: { type: Boolean, default: true },

    // Intentos fallidos de autenticación
    loginAttemps: { type: Number, default: 0 },

    // Expiración de bloqueo por intentos fallidos
    timeOut: { type: Date }
  },
  { 
    // Desactivar campo de versión __v
    versionKey: false, 
    timestamps: true 
  }
);

// Exportar modelo en la colección Empleados
export default mongoose.model("Empleados", empleadosSchema, "Empleados");
