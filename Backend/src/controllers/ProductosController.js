import productsModel from "../models/Productos.js";
import ventasModel from "../models/Ventas.js";
import { v2 as cloudinary } from "cloudinary";

// Objeto agrupador del controlador de productos
const controladoresProductos = {};

// Obtener el producto más vendido basado en ventas completadas/enviadas/entregadas
controladoresProductos.getMostSoldProduct = async (req, res) => {
  try {
    const estadosValidos = [
      'Completado', 'completado', 'completed',
      'Enviado', 'enviado',
      'Entregado', 'entregado',
      'Pendiente WhatsApp'
    ];

    // Agregar ventas sumando cantidades por producto
    // Convertimos productId a string para manejar tanto ObjectId como string
    const topProductos = await ventasModel.aggregate([
      { $match: { status: { $in: estadosValidos } } },
      { $unwind: '$products' },
      {
        $group: {
          _id: { $toString: '$products.productId' },
          totalVendido: { $sum: '$products.quantity' }
        }
      },
      { $sort: { totalVendido: -1 } },
      { $limit: 1 }
    ]);

    let producto = null;
    if (topProductos.length > 0 && topProductos[0]._id) {
      // Intentar buscar por ObjectId
      const mongoose = (await import('mongoose')).default;
      let idToFind = topProductos[0]._id;
      try {
        if (mongoose.Types.ObjectId.isValid(idToFind)) {
          producto = await productsModel.findById(idToFind);
        }
      } catch(e) {
        // ignorar error de cast
      }
    }

    // Fallback: producto más reciente
    if (!producto) {
      producto = await productsModel.findOne().sort({ createdAt: -1 });
    }

    if (!producto) {
      return res.status(404).json({ message: 'No hay productos disponibles.' });
    }

    const totalVendido = topProductos.length > 0 ? topProductos[0].totalVendido : 0;

    return res.status(200).json({
      id: producto._id,
      name: producto.nombreProducto || '',
      desc: producto.descripcion || '',
      price: typeof producto.precio === 'number' ? producto.precio : 0,
      stock: typeof producto.stock === 'number' ? producto.stock : 0,
      img: producto.imagenProducto && producto.imagenProducto.length > 0 ? producto.imagenProducto[0] : null,
      sku: producto.sku || producto._id,
      totalVendido
    });
  } catch (error) {
    console.error('Error al obtener producto más vendido:', error);
    return res.status(500).json({ message: 'Error al consultar el producto más vendido.' });
  }
};

// Obtener la lista de todos los productos del catálogo
controladoresProductos.getProducts = async (req, res) => {
  try {
    // Consultar productos ordenando del más reciente al más antiguo
    const productos = await productsModel.find().sort({ createdAt: -1 });

    // Transformar el formato para enviarlo estandarizado al cliente web
    const mapeado = productos.map(prod => ({
      id: prod._id,
      name: prod.nombreProducto || '',
      desc: prod.descripcion || '',
      price: typeof prod.precio === 'number' ? prod.precio : 0,
      stock: typeof prod.stock === 'number' ? prod.stock : 0,
      category: prod.idCategoria || '',
      img: prod.imagenProducto && prod.imagenProducto.length > 0 ? prod.imagenProducto[0] : null,
      public_id: prod.public_id || null,
      sku: prod.sku || prod._id,
      specs: prod.specs || {}
    }));

    // Retornar los productos formateados
    return res.status(200).json(mapeado);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({ message: "Error al consultar productos." });
  }
};

// Obtener la información de un producto en específico por su ID
controladoresProductos.getProduct = async (req, res) => {
  try {
    // Tomar el ID enviado en los parámetros del endpoint
    const { id } = req.params;

    // Buscar en MongoDB el documento del producto
    const prod = await productsModel.findById(id);

    // Si no se encuentra el producto, retornar 404
    if (!prod) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // Formatear los datos del producto
    const mapeado = {
      id: prod._id,
      name: prod.nombreProducto,
      desc: prod.descripcion,
      price: prod.precio,
      stock: prod.stock,
      category: prod.idCategoria,
      img: prod.imagenProducto && prod.imagenProducto.length > 0 ? prod.imagenProducto[0] : null,
      public_id: prod.public_id || null,
      sku: prod.sku || prod._id,
      specs: prod.specs || {}
    };

    // Responder con los datos del producto
    return res.status(200).json(mapeado);
  } catch (error) {
    console.error("Error al obtener producto por ID:", error);
    return res.status(500).json({ message: "Error interno al consultar producto." });
  }
};

// Crear un nuevo producto en el catálogo
controladoresProductos.createProduct = async (req, res) => {
  try {
    // Extraer los campos enviados en el formulario de creación
    const { name, desc, description, price, stock, category, specs } = req.body;
    
    // Obtener la imagen subida por multer o desde el cuerpo de la petición
    const imgPath = req.file ? req.file.path : (req.body.img || null);
    const publicId = req.file ? req.file.filename : null;

    // Validar que el nombre del producto no esté vacío
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "El nombre del producto es obligatorio." });
    }

    // Convertir el precio a formato numérico
    const parsedPrice = Number(price);

    // Validar que el precio sea mayor que cero
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ 
        message: "El precio del producto debe ser un número positivo mayor a cero (0.00)." 
      });
    }

    // Convertir el stock a tipo numérico
    const parsedStock = Number(stock);

    // Validar que el stock sea un entero no negativo
    if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
      return res.status(400).json({ 
        message: "El stock inicial debe ser un número entero mayor o igual a cero (0)." 
      });
    }

    // Parsear especificaciones técnicas (specs) ya sea en formato JSON String o como Objeto
    let parsedSpecs = {};
    if (typeof specs === 'string') {
      try {
        parsedSpecs = JSON.parse(specs);
      } catch (e) {
        parsedSpecs = {};
      }
    } else if (typeof specs === 'object' && specs !== null) {
      parsedSpecs = specs;
    }

    const skuGen = req.body.sku || `PN-${(category || 'GEN').substring(0,3).toUpperCase()}-${String(Date.now()).slice(-4)}`;

    // Crear la instancia del producto con sus propiedades
    const nuevoProducto = new productsModel({
      nombreProducto: name.trim(),
      descripcion: (desc || description || '').trim(),
      precio: parsedPrice,
      stock: parsedStock,
      idCategoria: category || 'General',
      imagenProducto: imgPath ? [imgPath] : [],
      public_id: publicId,
      sku: skuGen,
      specs: parsedSpecs
    });

    // Guardar el documento en la base de datos
    const productoGuardado = await nuevoProducto.save();

    // Mapear los datos guardados para retornarlos al frontend
    const mapeado = {
      id: productoGuardado._id,
      name: productoGuardado.nombreProducto,
      desc: productoGuardado.descripcion,
      price: productoGuardado.precio,
      stock: productoGuardado.stock,
      category: productoGuardado.idCategoria,
      img: productoGuardado.imagenProducto && productoGuardado.imagenProducto.length > 0 ? productoGuardado.imagenProducto[0] : null,
      public_id: productoGuardado.public_id || null,
      sku: productoGuardado.sku || productoGuardado._id,
      specs: productoGuardado.specs || {}
    };

    // Responder con estado 201 de creado exitosamente
    return res.status(201).json(mapeado);
  } catch (error) {
    console.error("Error al crear producto:", error);
    return res.status(500).json({ message: "Error al registrar el producto." });
  }
};

// Actualizar un producto existente
controladoresProductos.updateProduct = async (req, res) => {
  try {
    // Tomar el ID desde los parámetros del endpoint
    const { id } = req.params;
    const { name, desc, description, price, stock, category, specs } = req.body;

    // Verificar si el producto a modificar existe en la base de datos
    const existente = await productsModel.findById(id);
    if (!existente) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // Si se envió un nuevo precio, validar que sea mayor a cero
    if (price !== undefined) {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ message: "El precio debe ser un número positivo mayor a cero (0.00)." });
      }
    }

    // Si se envió un nuevo stock, validar que sea entero y no negativo
    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (isNaN(parsedStock) || parsedStock < 0 || !Number.isInteger(parsedStock)) {
        return res.status(400).json({ message: "El stock debe ser un número entero mayor o igual a cero (0)." });
      }
    }

    // Armar el objeto con los datos recibidos que van a ser modificados
    const updateData = {
      ...(name && { nombreProducto: name.trim() }),
      ...(desc !== undefined || description !== undefined ? { descripcion: (desc || description || '').trim() } : {}),
      ...(price !== undefined && { precio: Number(price) }),
      ...(stock !== undefined && { stock: Number(stock) }),
      ...(category && { idCategoria: category }),
      ...(specs && { specs })
    };

    // Si se adjunta un nuevo archivo de imagen vía Multer
    if (req.file) {
      // Eliminar la imagen anterior en Cloudinary si posee un public_id
      if (existente.public_id) {
        try {
          await cloudinary.uploader.destroy(existente.public_id);
        } catch (e) {
          console.error("Error al eliminar imagen previa de Cloudinary:", e);
        }
      }
      updateData.imagenProducto = [req.file.path];
      updateData.public_id = req.file.filename;
    } else if (req.body.img !== undefined) {
      updateData.imagenProducto = req.body.img ? [req.body.img] : [];
    }

    // Ejecutar la actualización en MongoDB
    const productoActualizado = await productsModel.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: 'after' }
    );

    // Mapear los datos actualizados para responder
    const mapeado = {
      id: productoActualizado._id,
      name: productoActualizado.nombreProducto,
      desc: productoActualizado.descripcion,
      price: productoActualizado.precio,
      stock: productoActualizado.stock,
      category: productoActualizado.idCategoria,
      img: productoActualizado.imagenProducto && productoActualizado.imagenProducto.length > 0 ? productoActualizado.imagenProducto[0] : null,
      public_id: productoActualizado.public_id || null,
      sku: productoActualizado.sku || productoActualizado._id,
      specs: productoActualizado.specs || {}
    };

    // Devolver el producto actualizado
    return res.status(200).json(mapeado);
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    return res.status(500).json({ message: "Error al actualizar producto." });
  }
};

// Eliminar un producto por su ID
controladoresProductos.deleteProduct = async (req, res) => {
  try {
    // Obtener ID del producto a eliminar
    const { id } = req.params;

    const productoExistente = await productsModel.findById(id);
    if (!productoExistente) {
      return res.status(404).json({ message: "Producto no encontrado." });
    }

    // Eliminar la imagen asociada en Cloudinary
    if (productoExistente.public_id) {
      try {
        await cloudinary.uploader.destroy(productoExistente.public_id);
      } catch (e) {
        console.error("Error al eliminar imagen de Cloudinary:", e);
      }
    }

    // Eliminar el documento en la base de datos
    await productsModel.findByIdAndDelete(id);

    // Confirmación de eliminación
    return res.status(200).json({ message: "Producto eliminado exitosamente." });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.status(500).json({ message: "Error al eliminar producto." });
  }
};

export default controladoresProductos;
