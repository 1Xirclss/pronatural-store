import categoriesModel from "../models/Categorias.js";

const controladoresCategorias = {};

// Obtener categorías
controladoresCategorias.getCategories = async (req, res) => {
  try {
    const categorias = await categoriesModel.find().sort({ nombre: 1 });
    const mapeado = categorias.map(c => ({
      id: c._id,
      nombre: c.nombre || c.name || '',
      descripcion: c.descripcion || c.description || '',
      estado: c.estado || 'Activo'
    }));
    return res.status(200).json(mapeado);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return res.status(500).json({ message: "Error al consultar categorías." });
  }
};

// Obtener categorías activas
controladoresCategorias.getActiveCategories = async (req, res) => {
  try {
    const categorias = await categoriesModel.find({ estado: { $ne: 'Inactivo' } }).sort({ nombre: 1 });
    const mapeado = categorias.map(c => ({
      id: c._id,
      nombre: c.nombre || c.name || '',
      descripcion: c.descripcion || c.description || '',
      estado: c.estado || 'Activo'
    }));
    return res.status(200).json(mapeado);
  } catch (error) {
    console.error("Error al obtener categorías activas:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
};

// Obtener categoría por ID
controladoresCategorias.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await categoriesModel.findById(id);
    if (!cat) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }
    const mapeado = {
      id: cat._id,
      nombre: cat.nombre || cat.name,
      descripcion: cat.descripcion || cat.description,
      estado: cat.estado || 'Activo'
    };
    return res.status(200).json(mapeado);
  } catch (error) {
    console.error("Error al obtener categoría por ID:", error);
    return res.status(500).json({ message: "Error al consultar categoría." });
  }
};

// Crear categoría
controladoresCategorias.createCategory = async (req, res) => {
  try {
    let { nombre, name, descripcion, description } = req.body;
    const catName = (nombre || name || '').trim();
    const catDesc = (descripcion || description || '').trim();

    if (!catName) {
      return res.status(400).json({ message: "El nombre de la categoría es obligatorio." });
    }

    // Evitar nombres duplicados
    const existente = await categoriesModel.findOne({ 
      nombre: { $regex: new RegExp(`^${catName}$`, 'i') } 
    });

    if (existente) {
      return res.status(400).json({ message: "Ya existe una categoría con este nombre." });
    }

    const nuevaCategoria = new categoriesModel({
      nombre: catName,
      name: catName,
      descripcion: catDesc,
      description: catDesc,
      estado: 'Activo'
    });

    const guardada = await nuevaCategoria.save();

    const mapeado = {
      id: guardada._id,
      nombre: guardada.nombre,
      descripcion: guardada.descripcion,
      estado: guardada.estado
    };

    return res.status(201).json(mapeado);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    return res.status(500).json({ message: "Error al crear la categoría." });
  }
};

// Alias para rutas que invocan insertCategory
controladoresCategorias.insertCategory = controladoresCategorias.createCategory;

// Actualizar categoría
controladoresCategorias.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { nombre, name, descripcion, description, estado } = req.body;
    const catName = (nombre || name || '').trim();
    const catDesc = (descripcion || description || '').trim();

    if (!id) {
      return res.status(400).json({ message: "Se requiere el ID de la categoría." });
    }

    if (catName) {
      const existente = await categoriesModel.findOne({
        nombre: { $regex: new RegExp(`^${catName}$`, 'i') },
        _id: { $ne: id }
      });
      if (existente) {
        return res.status(400).json({ message: "El nombre de la categoría ya está en uso." });
      }
    }

    const updateData = {
      ...(catName && { nombre: catName, name: catName }),
      ...(catDesc !== undefined && { descripcion: catDesc, description: catDesc }),
      ...(estado && { estado })
    };

    const actualizada = await categoriesModel.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    );

    if (!actualizada) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    const mapeado = {
      id: actualizada._id,
      nombre: actualizada.nombre,
      descripcion: actualizada.descripcion,
      estado: actualizada.estado
    };

    return res.status(200).json(mapeado);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    return res.status(500).json({ message: "Error al actualizar la categoría." });
  }
};

// Activar o desactivar categoría
controladoresCategorias.toggleCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await categoriesModel.findById(id);
    if (!cat) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }
    cat.estado = cat.estado === 'Activo' ? 'Inactivo' : 'Activo';
    await cat.save();

    return res.status(200).json({ message: "Estado actualizado.", category: cat });
  } catch (error) {
    console.error("Error al cambiar estado de categoría:", error);
    return res.status(500).json({ message: "Error al cambiar estado." });
  }
};

// Eliminar categoría
controladoresCategorias.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const eliminada = await categoriesModel.findByIdAndDelete(id);

    if (!eliminada) {
      return res.status(404).json({ message: "Categoría no encontrada." });
    }

    return res.status(200).json({ message: "Categoría eliminada exitosamente." });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return res.status(500).json({ message: "Error al eliminar categoría." });
  }
};

export default controladoresCategorias;
