import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useGlobalData } from '../../context/GlobalDataContext';
function ProductModal({ onClose, onSave, initialData }) {
  const { categories: globalCategories } = useGlobalData();
  const categories = globalCategories.map(c => typeof c === 'string' ? c : (c.nombre || c.name)).filter(Boolean);
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        originSpec: initialData.origin || (initialData.specs && initialData.specs.ORIGEN) || '',
        altitudeSpec: (initialData.specs && initialData.specs.ALTITUD) || '',
        flavorSpec: (initialData.specs && initialData.specs.SABOR) || '',
        processSpec: (initialData.specs && initialData.specs.PROCESO) || '',
      };
    }
    return {
      name: '', price: '', category: categories[0] || 'Aceites y Bálsamos', desc: '', stock: '', img: '',
      originSpec: '', altitudeSpec: '', flavorSpec: '', processSpec: ''
    };
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.name.trim()) { toast.error('El nombre del producto es requerido'); return; }
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('El precio debe ser un número mayor a 0');
      return;
    }
    const stockNum = parseInt(form.stock) || 0;
    if (stockNum < 0) {
      toast.error('El stock debe ser mayor o igual a 0');
      return;
    }
    setIsSubmitting(true);
    try {
      await onSave({
        id: isEditing ? (form.id || form._id) : undefined,
        name: form.name.trim(),
        price: priceNum,
        category: form.category || 'General',
        desc: form.desc ? form.desc.trim() : '',
        img: form.img || '',
        stock: stockNum,
        sku: form.sku || `PN-${(form.category || 'GEN').substring(0,3).toUpperCase()}-${String(Date.now()).slice(-4)}`,
        origin: form.originSpec || '',
        specs: {
          ORIGEN: form.originSpec || '',
          ALTITUD: form.altitudeSpec || '',
          SABOR: form.flavorSpec || '',
          PROCESO: form.processSpec || ''
        },
        file: form.file
      });
      onClose();
    } catch (err) {
      console.error("Error al guardar producto:", err);
      toast.error(err.message || "Error al guardar el producto");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl p-6 w-full max-w-[480px] max-h-[90vh] overflow-y-auto custom-scrollbar">
        <h3 className="text-white font-bold text-lg mb-5">{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Nombre del Producto *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Miel de Abeja Cruda"
              className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#22c55e] transition-colors" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Precio ($) *</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                placeholder="18.50"
                className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#22c55e] transition-colors" />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Stock Inicial</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })}
                placeholder="45"
                className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#22c55e] transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Categoría</label>
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
              className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#22c55e] transition-colors">
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Imagen del Producto (Seleccionar archivo)</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const preview = URL.createObjectURL(file);
                  setForm({ ...form, file, previewUrl: preview });
                }
              }}
              className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#22c55e] transition-colors file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#22c55e]/20 file:text-[#4ade80] hover:file:bg-[#22c55e]/30 cursor-pointer" 
            />
            {(form.previewUrl || form.img) && (
              <div className="mt-3 flex items-center gap-3">
                <div className="h-16 w-16 rounded-[8px] overflow-hidden bg-white/5 border border-white/10 relative">
                  <img src={form.previewUrl || form.img} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-xs text-gray-400">
                  {form.file ? (
                    <p className="text-[#4ade80] font-medium">📷 {form.file.name}</p>
                  ) : (
                    <p>Imagen actual del producto</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-[#1e2a1e] pt-4">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Especificaciones Técnicas (Opcional)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 block">Origen</label>
                <input value={form.originSpec} onChange={e => setForm({ ...form, originSpec: e.target.value })}
                  placeholder="Ej: Sonsonate, El Salvador"
                  className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#22c55e] transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 block">Altitud</label>
                <input value={form.altitudeSpec} onChange={e => setForm({ ...form, altitudeSpec: e.target.value })}
                  placeholder="Ej: 800 msnm"
                  className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#22c55e] transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 block">Sabor</label>
                <input value={form.flavorSpec} onChange={e => setForm({ ...form, flavorSpec: e.target.value })}
                  placeholder="Ej: Notas de azahar y cítricos"
                  className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#22c55e] transition-colors" />
              </div>
              <div>
                <label className="text-gray-400 text-[10px] uppercase tracking-wider mb-1 block">Proceso</label>
                <input value={form.processSpec} onChange={e => setForm({ ...form, processSpec: e.target.value })}
                  placeholder="Ej: Filtrado en frío"
                  className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-[#22c55e] transition-colors" />
              </div>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Descripción</label>
            <textarea rows={3} value={form.desc} onChange={e => setForm({ ...form, desc: e.target.value })}
              placeholder="Descripción del producto..."
              className="w-full bg-[#0d1117] border border-[#1e2a1e] rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#22c55e] transition-colors resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="flex-1 py-2.5 border border-[#1e2a1e] text-gray-400 rounded-lg text-sm hover:bg-[#1e2a1e] transition-colors disabled:opacity-50 cursor-pointer">Cancelar</button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-[#22c55e] text-[#0d1117] font-bold rounded-lg text-sm hover:bg-[#16a34a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                isEditing ? 'Guardar Cambios' : 'Crear Producto'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
function ProductCard({ product, onEdit, onDelete }) {
  const stockNum = product.stock || 0;
  return (
    <div className="bg-[#161b22] border border-[#1e2a1e] rounded-xl overflow-hidden group hover:border-[#22c55e]/40 transition-all duration-200 flex flex-col h-full">
      <div className="relative h-44 bg-[#0d1117] overflow-hidden shrink-0">
        <img
          src={product.img || 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={e => { e.target.src = 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'; }}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-[6px]">
          <span className={`text-[10px] font-bold ${stockNum <= 15 ? 'text-red-400' : 'text-[#4ade80]'}`}>
            {stockNum} u.
          </span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-0.5">{product.category}</p>
        <h3 className="text-white font-bold text-[14px] mb-1 leading-tight">{product.name}</h3>
        <p className="text-gray-600 text-[11px] mb-2 font-mono">SKU: {product.sku}</p>
        <div className="flex items-center justify-between mt-auto mb-4">
          <p className="text-gray-400 text-xs">Precio:</p>
          <p className="text-[#22c55e] text-[15px] font-bold">${product.price.toFixed(2)}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1 py-2 border border-white/10 text-gray-300 text-xs font-medium rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            Editar
          </button>
          <button
            onClick={() => {
              if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
                onDelete(product.id || product._id);
              }
            }}
            className="w-10 flex items-center justify-center py-2 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-colors cursor-pointer"
            title="Eliminar"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
export default function AdminCatalog() {
  const { products, addProduct, updateProduct, deleteProduct, categories: globalCategories } = useGlobalData();
  const categoriesList = globalCategories.map(c => typeof c === 'string' ? c : (c.nombre || c.name)).filter(Boolean);
  const FILTERS = ['Todos', ...categoriesList];
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const filtered = products.filter(p => {
    if (activeFilter === 'Todos') return true;
    return (p.category || '').toUpperCase().includes(activeFilter.toUpperCase()) ||
           (p.name || '').toLowerCase().includes(activeFilter.toLowerCase());
  });
  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        await updateProduct(productData.id || productData._id, productData);
        toast.success('Producto actualizado exitosamente');
      } else {
        await addProduct(productData);
        toast.success('Producto registrado exitosamente');
      }
      setEditingProduct(null);
      setShowModal(false);
    } catch (error) {
      console.error('Error al guardar producto:', error);
      toast.error(error.message || 'Error al registrar el producto');
      throw error;
    }
  };
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };
  const handleDeleteClick = (id) => {
    deleteProduct(id);
    toast.success('Producto eliminado');
  };
  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      {(showModal || editingProduct) && (
        <ProductModal 
          initialData={editingProduct} 
          onClose={() => { setShowModal(false); setEditingProduct(null); }} 
          onSave={handleSave} 
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Catálogo de Productos</h1>
          <p className="text-gray-400 text-[14px] mt-1">Gestión y visualización de productos del sistema.</p>
        </div>
      </div>
      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTERS.map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
              activeFilter === filter
                ? 'bg-[#22c55e] text-[#0d1117]'
                : 'bg-[#161b22] text-gray-400 border border-[#1e2a1e] hover:border-gray-600 hover:text-white'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filtered.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        ))}
        <button
          onClick={() => { setEditingProduct(null); setShowModal(true); }}
          className="bg-[#161b22] border-2 border-dashed border-[#1e2a1e] rounded-xl flex flex-col items-center justify-center min-h-[320px] gap-3 hover:border-[#22c55e]/50 hover:bg-[#1e2a1e] transition-all group cursor-pointer"
        >
          <div className="w-12 h-12 border-2 border-dashed border-gray-600 rounded-full flex items-center justify-center group-hover:border-[#22c55e] transition-colors">
            <span className="text-gray-600 text-2xl group-hover:text-[#22c55e] transition-colors">+</span>
          </div>
          <p className="text-gray-500 text-sm group-hover:text-gray-300 transition-colors">Agregar Producto</p>
        </button>
      </div>
    </div>
  );
}
