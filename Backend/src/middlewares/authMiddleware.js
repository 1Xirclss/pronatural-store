import jsonwebtoken from "jsonwebtoken";
import { config } from "../../config.js";

// Middleware de autenticación mediante cookies HTTP o encabezados de autorización
export const validateAuthCookie = (allowedTypes = []) => {
  return (req, res, next) => {
    try {
      // Obtener el token de las cookies de la petición o del header Authorization / Cookie manual
      const authHeader = req.headers.authorization;
      const rawCookieHeader = req.headers.cookie;

      let token = req.cookies?.authCookie;

      if (!token && authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }

      if (!token && rawCookieHeader) {
        const match = rawCookieHeader.match(/authCookie=([^;]+)/);
        if (match) token = match[1];
      }

      if (!token) {
        return res.status(403).json({ message: "No se encontró sesión activa. Autorización requerida." });
      }

      // Verificar y decodificar el token JWT
      const decoded = jsonwebtoken.verify(token, config.JWT.secret);

      // Comprobar los roles autorizados si se especificaron
      if (allowedTypes.length > 0 && !allowedTypes.includes(decoded.userType)) {
        return res.status(401).json({ message: "Acceso denegado. Rol no autorizado." });
      }

      req.user = decoded;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
        res.clearCookie("authCookie");
        return res.status(401).json({ message: "Token de sesión inválido o expirado." });
      }
      return res.status(500).json({ message: "Error interno en autenticación." });
    }
  };
};