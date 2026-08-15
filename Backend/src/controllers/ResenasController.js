import reviewsModel from "../models/Resenas.js";

// Objeto agrupador del controlador de reseñas
const reviewsController = {};

// Función para consultar la lista de todas las reseñas de los clientes
reviewsController.getReviews = async (req, res) => {
  try {
    // Buscar en MongoDB ordenando de la más reciente a la más antigua
    const reviews = await reviewsModel.find().sort({ createdAt: -1, fechaPublicacion: -1 });

    // Mapear los campos: soporta tanto formato inglés (nuevo) como español (heredado)
    const mapeado = reviews.map(r => ({
      _id: r._id,
      id: r._id,
      name: r.name || r.nombreCliente || 'Cliente ProNatural',
      rating: r.rating ?? r.calificacion ?? 5,
      comment: r.comment || r.comentario || '',
      date: r.date || r.fechaPublicacion || r.createdAt || '',
      status: r.status || 'approved'
    }));

    // Retornar las reseñas encontradas con código HTTP 200
    return res.status(200).json(mapeado);
  } catch (error) {
    // Imprimir el error en la consola del servidor
    console.error("Error al obtener reseñas:", error);
    return res.status(500).json({ message: "Error interno al consultar reseñas." });
  }
};

// Función para registrar y publicar una nueva reseña de cliente
reviewsController.createReview = async (req, res) => {
  try {
    // Extraer nombre, valoración y comentario del cuerpo de la solicitud
    let { name, rating, comment } = req.body;

    // Validar que el nombre del autor no esté vacío
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Ingresa tu nombre para publicar la reseña." });
    }

    // Validar que el comentario tenga al menos 3 caracteres de contenido
    if (!comment || !comment.trim() || comment.trim().length < 3) {
      return res.status(400).json({ 
        message: "El comentario debe tener al menos 3 caracteres." 
      });
    }

    // Convertir la calificación enviada a número
    const parsedRating = Number(rating);

    // Validar que la calificación sea un número entero comprendido entre 1 y 5 estrellas
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5 || !Number.isInteger(parsedRating)) {
      return res.status(400).json({ 
        message: "La calificación debe ser un entero entre 1 y 5 estrellas." 
      });
    }

    // Crear la nueva instancia del modelo de reseñas
    const newReview = new reviewsModel({
      name: name.trim(),
      rating: parsedRating,
      comment: comment.trim()
    });

    // Guardar el documento en la base de datos
    await newReview.save();

    // Retornar respuesta de éxito con estado 201 (Creado)
    return res.status(201).json({ 
      message: "Reseña publicada con éxito.", 
      review: newReview 
    });
  } catch (error) {
    // Manejar cualquier falla del servidor
    console.error("Error al crear reseña:", error);
    return res.status(500).json({ message: "Error al publicar la reseña." });
  }
};

// Función para eliminar una reseña de la plataforma por su ID
reviewsController.deleteReview = async (req, res) => {
  try {
    // Obtener el ID enviado en la ruta de la petición
    const { id } = req.params;

    // Comprobar que el ID haya sido proporcionado
    if (!id) {
      return res.status(400).json({ message: "Se requiere el ID de la reseña." });
    }

    // Buscar y eliminar el registro de la reseña en MongoDB
    const deletedReview = await reviewsModel.findByIdAndDelete(id);

    // Si la reseña especificada no existe
    if (!deletedReview) {
      return res.status(404).json({ message: "Reseña no encontrada." });
    }

    // Retornar mensaje de eliminación exitosa
    return res.status(200).json({ message: "Reseña eliminada exitosamente." });
  } catch (error) {
    // Loguear el error y responder con estado 500
    console.error("Error al eliminar reseña:", error);
    return res.status(500).json({ message: "Error al eliminar la reseña." });
  }
};

export default reviewsController;
