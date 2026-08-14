import mongoose from "mongoose";
import { config } from "./config.js";
import controladoresAjustes from "./src/controllers/AjustesController.js";

// Configuración robusta de Mongoose
const connectDB = async () => {
    try {
        await mongoose.connect(config.db.URI, { 
            family: 4, // Forzar resolución IPv4
            serverSelectionTimeoutMS: 5000, // Timeout de selección de servidor
        });
        console.log("DB is connected successfully");
        
        // Inicializar los trabajos cron programados
        await controladoresAjustes.initCronJob();
    } catch (error) {
        console.error("Error inicial de conexión a MongoDB:", error.message);
        // Intentar reconectar después de 5 segundos
        setTimeout(connectDB, 5000);
    }
};

const connection = mongoose.connection;

// Manejo de desconexiones en tiempo de ejecución
connection.on("disconnected", () => {
    console.warn("Mongoose se ha desconectado. Intentando reconectar...");
});

connection.on("error", (err) => {
    console.error("Error en la base de datos MongoDB:", err.message);
});

// Iniciar conexión
connectDB();
