// Aplicación principal Express del Backend ProNatural Store
// Configura middlewares de seguridad, CORS, Swagger UI, Rate Limiter y montado de rutas API
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit";

// Importación de módulos de rutas del sistema
import authRoutes from "./src/routes/auth.js";
import categoriasRoutes from "./src/routes/Categorias.js";
import productosRoutes from "./src/routes/Productos.js";
import ventasRoutes from "./src/routes/Ventas.js";
import inventarioRoutes from "./src/routes/Inventario.js";
import empleadosRoutes from "./src/routes/Empleados.js";
import clientesRoutes from "./src/routes/Clientes.js";
import registerClienteRoutes from "./src/routes/registerCliente.js";
import carritoRoutes from "./src/routes/Carrito.js";
import resenasRoutes from "./src/routes/Resenas.js";
import recoveryAdminRoutes from "./src/routes/recoveryAdmin.js";
import recoveryPasswordRoutes from "./src/routes/recoveryPassword.js";
import ajustesRoutes from "./src/routes/Ajustes.js";
import contactoRoutes from "./src/routes/contacto.js";

// Instanciar aplicación Express
const app = express();

// Middleware de límite de solicitudes HTTP / Rate Limiting (Retorna código HTTP 429)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
  max: 500, // Límite máximo de solicitudes por IP
  statusCode: 429, // Código de estado HTTP 429 explicito
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    error: "Too Many Requests",
    message: "Límite de solicitudes alcanzado. Demasiadas peticiones enviadas al servidor desde esta IP, por favor intenta más tarde."
  }
});

// Aplicar el limitador de peticiones a todos los endpoints de la API /api/
app.use("/api/", apiLimiter);

// Configuración de CORS dinámica para desarrollo y producción
const allowedOrigins = [
    "http://localhost:5173", 
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://192.168.0.13:5173",
    process.env.FRONTEND_URL // Soporte para Vercel/Render
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Permitir peticiones sin origen (como Postman o curl) o que estén en la lista permitida
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            // En producción, si es un dominio no autorizado, rechaza la petición
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true,
}));

// Middleware para procesar cookies enviadas en las peticiones HTTP
app.use(cookieParser());

// Middleware para parsear cuerpos de peticiones en formato JSON (hasta 50mb para imágenes en base64)
app.use(express.json({ limit: "50mb" }));

// Middleware para parsear datos codificados en URL
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Definición y montaje de las rutas de la API en sus respectivos endpoints
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriasRoutes);
app.use("/api/products", productosRoutes);
app.use("/api/sales", ventasRoutes);
app.use("/api/inventory", inventarioRoutes);
app.use("/api/employees", empleadosRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/registerCliente", registerClienteRoutes);
app.use("/api/carrito", carritoRoutes);
app.use("/api/reviews", resenasRoutes);
app.use("/api/auth/recoveryAdmin", recoveryAdminRoutes);
app.use("/api/auth/recoveryCustomer", recoveryPasswordRoutes);
app.use("/api/ajustes", ajustesRoutes);
app.use("/api/contacto", contactoRoutes);

// Manejador Global de Errores
app.use((err, req, res, next) => {
    console.error("Error Global:", err.message);
    
    // Configurar estado HTTP adecuado
    const statusCode = err.status || 500;
    
    // Enviar respuesta JSON
    res.status(statusCode).json({
        success: false,
        message: statusCode === 500 ? "Error interno del servidor. Intenta de nuevo más tarde." : err.message,
        error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
});

// Exportar la aplicación Express configurada
export default app;
