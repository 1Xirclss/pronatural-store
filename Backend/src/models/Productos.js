import { Schema, model } from "mongoose";

// Esquema principal para los productos registrados en el catálogo
const productsSchema = new Schema({
    // Nombre comercial del producto
    nombreProducto: { type: String },

    // Descripción del producto
    descripcion: { type: String },

    // Precio de venta unitario en USD
    precio: { type: Number },

    // Cantidad de existencias en inventario
    stock: { type: Number },

    // Categoría a la que pertenece el producto
    idCategoria: { type: String },

    // Arreglo de rutas/URLs de las imágenes del producto
    imagenProducto: { type: [String] },

    // Identificador público único del asset en Cloudinary para eliminación remota
    public_id: { type: String },

    // Estado del producto (Disponible, Agotado, Inactivo)
    estado: { type: String, default: "Disponible" },

    // Fecha de vencimiento o caducidad del producto
    fechaVencimiento: { type: String }
}, {
    // Timestamps de creación y flexibilidad para especificaciones dinámicas (specs)
    timestamps: true,
    strict: false
});

// Exportar modelo de la colección Productos
export default model("Productos", productsSchema, "Productos");