import app from "./app.js";
import "./database.js";

// Función principal asíncrona para iniciar el servidor HTTP del backend
async function main() {
    // Escuchar peticiones en el puerto asignado por Render o 4000 en local
    const PORT = process.env.PORT || 4000;
    app.listen(PORT);
    // Imprimir mensaje indicando el estado activo del servidor
    console.log(`server on port ${PORT}`);
}

// Ejecutar la función de inicio del servidor
main();