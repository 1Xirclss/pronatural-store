// Objeto agrupador del controlador de cierre de sesión
const logoutController = {};

// Función para cerrar la sesión del usuario eliminando la cookie de autenticación
logoutController.logout = async (req, res) => {
    // Limpiar la cookie de autenticación en el navegador del cliente
    res.clearCookie("authCookie");

    // Responder con mensaje de éxito de cierre de sesión
    return res.status(200).json({ message: "Sesión cerrada" });
};

export default logoutController;