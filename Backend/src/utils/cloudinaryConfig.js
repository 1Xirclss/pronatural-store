import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../../config.js";

//#1- Configuramos cloudinary con nuestras credenciales
cloudinary.config({
    cloud_name: (config.cloudinary.cloudinary_name || "").replace(/['"]/g, ""),
    api_key: (config.cloudinary.cloudinary_api_key || "").replace(/['"]/g, ""),
    api_secret: (config.cloudinary.cloudinary_api_secret || "").replace(/['"]/g, "")
});

//#2- Configurar como guardar las imagenes
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "pronatural-store",
        allowed_formats: ["jpg", "png", "jpeg", "gif", "webp"]
    }
});

//#3- Configurar multer
const upload = multer({ storage });

export default upload;
