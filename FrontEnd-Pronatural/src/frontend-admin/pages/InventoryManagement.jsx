import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';
import { ADMIN_PREFIX } from '../../config';
import toast from 'react-hot-toast';

function MetricHorizontal({ icon, bgClass, textClass, label, value }) {
  return (
    <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-5 flex items-center gap-5">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgClass} ${textClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-400 text-[12px] mb-1">{label}</p>
        <p className="text-white text-[24px] font-bold leading-none">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let bg = '', text = '';
  if (status === 'En Stock') { bg = 'bg-[#1b4332]'; text = 'text-[#4ade80]'; }
  else if (status === 'Stock Bajo') { bg = 'bg-red-950/80'; text = 'text-red-400'; }
  else if (status === 'Agotado') { bg = 'bg-red-900/40'; text = 'text-red-300'; }
  else { bg = 'bg-white/10'; text = 'text-gray-400'; }
  return (
    <span className={`px-2.5 py-1 rounded-[6px] text-[10px] font-bold tracking-wide ${bg} ${text}`}>
      {status}
    </span>
  );
}

export default function InventoryManagement() {
  const { products, categories, updateStock, updateProduct } = useGlobalData();
  const navigate = useNavigate();

  const [showFilter, setShowFilter] = useState(false);
  const [filterText, setFilterText] = useState('');

  // Estados para Modal de Reposición de Stock
  const [reponerItem, setReponerItem] = useState(null);
  const [addStockAmount, setAddStockAmount] = useState(10);
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  // Estados para Modal de Edición de Producto
  const [editItem, setEditItem] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: ''
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const LOW_STOCK_THRESHOLD = 15;
  const lowStockCount = products.filter(p => (p.stock || 0) <= LOW_STOCK_THRESHOLD).length;

  const filteredProducts = products.filter(p => {
    const nameStr = p.name || p.nombreProducto || p.nombre || '';
    const catStr = p.category || p.categoria || '';
    return (
      nameStr.toLowerCase().includes(filterText.toLowerCase()) || 
      catStr.toLowerCase().includes(filterText.toLowerCase())
    );
  });

  const topInventory = filteredProducts.slice(0, 4).map(p => {
    const pId = p.id || p._id;
    const pStock = typeof p.stock === 'number' ? p.stock : 0;
    const catName = p.category || p.categoria || 'General';
    return {
      rawProduct: p,
      id: pId,
      category: String(catName).toUpperCase(),
      name: p.name || p.nombreProducto || p.nombre || 'Producto',
      stock: pStock,
      unit: 'u',
      status: pStock <= 0 ? 'Agotado' : pStock <= LOW_STOCK_THRESHOLD ? 'Stock Bajo' : 'En Stock',
      img: p.img || p.imagen || null,
      progress: Math.min(100, Math.round((pStock / 200) * 100)),
    };
  });
  
  const tableData = filteredProducts.map(p => {
    const pId = p.id || p._id;
    const pStock = typeof p.stock === 'number' ? p.stock : 0;
    const catName = p.category || p.categoria || 'General';
    return {
      rawProduct: p,
      id: pId,
      name: p.name || p.nombreProducto || p.nombre || 'Producto',
      category: catName,
      status: pStock <= 0 ? 'Agotado' : pStock <= LOW_STOCK_THRESHOLD ? 'Stock Bajo' : 'En Stock',
      stock: pStock,
      unit: 'u',
      img: p.img || p.imagen || 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'
    };
  });

  // Abrir Modal de Reponer
  const handleOpenReponer = (item) => {
    setReponerItem(item);
    setAddStockAmount(10);
  };

  // Confirmar Reposición de Stock
  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!reponerItem) return;
    setIsSubmittingStock(true);
    try {
      const currentStock = Number(reponerItem.stock || 0);
      const added = Number(addStockAmount || 0);
      const newTotal = currentStock + added;

      await updateStock(reponerItem.id, newTotal);
      toast.success(`Stock actualizado: +${added} unidades agregadas a "${reponerItem.name}"`);
      setReponerItem(null);
    } catch (err) {
      toast.error('Error al actualizar el stock');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  // Abrir Modal de Edición
  const handleOpenEdit = (item) => {
    const raw = item.rawProduct || item;
    setEditItem(raw);
    setEditFormData({
      name: raw.name || raw.nombreProducto || raw.nombre || '',
      category: raw.category || raw.categoria || '',
      price: raw.precio || raw.price || 0,
      stock: raw.stock || 0,
      description: raw.description || raw.descripcion || ''
    });
  };

  // Confirmar Edición de Producto
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editItem) return;
    setIsSubmittingEdit(true);
    try {
      const productId = editItem._id || editItem.id;
      const updatedPayload = {
        name: editFormData.name,
        nombreProducto: editFormData.name,
        nombre: editFormData.name,
        category: editFormData.category,
        categoria: editFormData.category,
        price: Number(editFormData.price),
        precio: Number(editFormData.price),
        stock: Number(editFormData.stock),
        description: editFormData.description,
        descripcion: editFormData.description
      };

      await updateProduct(productId, updatedPayload);
      toast.success(`Producto "${editFormData.name}" actualizado exitosamente`);
      setEditItem(null);
    } catch (err) {
      toast.error('Error al actualizar el producto');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Gestión de Inventario</h1>
          <p className="text-gray-400 text-[14px] mt-1 max-w-xl">
            Gestione sus existencias, actualice cantidades y realice el seguimiento del estado de los productos en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto">
          {showFilter && (
            <input 
              type="text" 
              placeholder="Buscar producto o categoría..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="px-4 py-2 bg-[#161b1e] border border-white/10 text-white text-[13px] rounded-[10px] focus:outline-none focus:border-[#30b466] transition-colors w-64"
              autoFocus
            />
          )}
          <button 
            onClick={() => { setShowFilter(!showFilter); if(showFilter) setFilterText(''); }}
            className={`flex items-center gap-2 px-5 py-2.5 bg-transparent border text-[13px] font-medium rounded-[10px] transition-colors cursor-pointer ${showFilter ? 'border-[#30b466] text-[#4ade80]' : 'border-white/10 text-gray-300 hover:bg-white/5'}`}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            {showFilter ? 'Cerrar Filtro' : 'Filtrar'}
          </button>
          <button 
            onClick={() => navigate(`${ADMIN_PREFIX}/catalogo`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#30b466] hover:bg-[#289655] text-[#0a110d] text-[13px] font-bold rounded-[10px] transition-colors cursor-pointer"
          >
            + Añadir Producto
          </button>
        </div>
      </div>

      {/* Tarjetas Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <MetricHorizontal 
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>}
          bgClass="bg-[#1b4332]" textClass="text-[#4ade80]"
          label="Total de Productos" value={String(products.length)}
        />
        <MetricHorizontal 
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          bgClass="bg-red-950/80" textClass="text-red-400"
          label="Productos en Stock Bajo" value={String(lowStockCount)}
        />
        <MetricHorizontal 
          icon={<svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
          bgClass="bg-[#3e3427]" textClass="text-[#d4a373]"
          label="Categorías Activas" value={String(categories.length || 3)}
        />
      </div>

      {/* Top Tarjetas de Inventario (Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {topInventory.map(item => (
          <div key={item.id} className="bg-[#161b1e] border border-white/5 rounded-[14px] flex flex-col overflow-hidden relative group">
            <div className="h-[160px] bg-[#0d1114] relative">
              {item.img ? (
                <img src={item.img} alt={item.name} className="w-full h-full object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal transition-all" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="40" height="40" fill="none" stroke="#333" strokeWidth="1" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <StatusBadge status={item.status} />
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-end mb-2">
                <p className="text-[10px] text-gray-500 font-bold tracking-widest">{item.category}</p>
                {item.stock !== null && (
                  <p className={`text-[15px] font-bold ${item.status === 'Stock Bajo' || item.status === 'Agotado' ? 'text-red-400' : 'text-white'}`}>
                    {item.stock} <span className="text-[11px] font-normal text-gray-500">{item.unit}</span>
                  </p>
                )}
              </div>
              <h3 className="text-[15px] text-white font-semibold leading-tight mb-4 flex-1">
                {item.name}
              </h3>
              <div className="w-full h-1 bg-white/5 rounded-full mb-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${item.status === 'Stock Bajo' || item.status === 'Agotado' ? 'bg-red-500' : 'bg-[#30b466]'}`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>

              {/* Botones Editar y Reponer funcionales */}
              <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-auto">
                <button 
                  onClick={() => handleOpenEdit(item)}
                  className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                <button 
                  onClick={() => handleOpenReponer(item)}
                  className={`flex items-center gap-1.5 text-[12px] font-semibold transition-colors cursor-pointer ${item.status === 'Stock Bajo' || item.status === 'Agotado' ? 'text-red-400 hover:text-red-300' : 'text-[#4ade80] hover:text-[#75e29f]'}`}
                >
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Reponer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla Completa de Inventario */}
      <div className="bg-[#161b1e] rounded-[14px] p-6 border border-white/5 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5">
              <th className="pb-4 text-[12px] text-gray-400 font-medium">Nombre del Producto</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium">Categoría</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium text-center">Estado</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium text-right pr-12">Nivel de Stock</th>
              <th className="pb-4 text-[12px] text-gray-400 font-medium text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableData.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <img src={item.img} className="w-8 h-8 rounded-[6px] object-cover" alt="" />
                    <span className="text-[13px] text-white font-medium">{item.name}</span>
                  </div>
                </td>
                <td className="py-4 text-[13px] text-gray-400">{item.category}</td>
                <td className="py-4 text-center">
                  <StatusBadge status={item.status} />
                </td>
                <td className={`py-4 text-[13px] font-bold text-right pr-12 ${item.status === 'Stock Bajo' || item.status === 'Agotado' ? 'text-red-400' : 'text-gray-200'}`}>
                  {item.stock} <span className="text-[11px] font-normal text-gray-500">{item.unit}</span>
                </td>
                <td className="py-4">
                  <div className="flex items-center justify-center gap-3">
                    {/* Botón Editar Tabla */}
                    <button 
                      onClick={() => handleOpenEdit(item)}
                      title="Editar producto"
                      className="text-[#30b466] hover:text-[#4ade80] transition-colors cursor-pointer p-1"
                    >
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    {/* Botón Reponer Tabla */}
                    <button 
                      onClick={() => handleOpenReponer(item)}
                      title="Reponer stock"
                      className={`${item.status === 'Stock Bajo' || item.status === 'Agotado' ? 'text-red-400 hover:text-red-300' : 'text-[#30b466] hover:text-[#4ade80]'} transition-colors cursor-pointer p-1`}
                    >
                      <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: REPONER STOCK */}
      {reponerItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121619] border border-white/10 rounded-[16px] max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/10">
              <div>
                <p className="text-[10px] font-bold text-[#4ade80] tracking-widest uppercase">Actualización de Inventario</p>
                <h3 className="text-[18px] font-bold text-white mt-0.5">{reponerItem.name}</h3>
              </div>
              <button 
                onClick={() => setReponerItem(null)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-5">
              <div className="bg-[#0d1114] p-4 rounded-[10px] flex items-center justify-between border border-white/5">
                <div>
                  <p className="text-[11px] text-gray-400">Stock Actual en BD</p>
                  <p className="text-[20px] font-bold text-white">{reponerItem.stock} <span className="text-[12px] text-gray-500 font-normal">unidades</span></p>
                </div>
                <StatusBadge status={reponerItem.status} />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-2">
                  Unidades a Agregar (+):
                </label>
                <div className="flex gap-2 mb-3">
                  {[5, 10, 25, 50, 100].map(amount => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setAddStockAmount(amount)}
                      className={`flex-1 py-2 text-[12px] font-bold rounded-[8px] border transition-colors cursor-pointer ${addStockAmount === amount ? 'bg-[#1b4332] border-[#30b466] text-[#4ade80]' : 'bg-[#0d1114] border-white/10 text-gray-400 hover:text-white'}`}
                    >
                      +{amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  value={addStockAmount}
                  onChange={(e) => setAddStockAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#0d1114] border border-white/15 rounded-[10px] px-4 py-3 text-white text-[14px] focus:outline-none focus:border-[#30b466]"
                />
              </div>

              <div className="bg-[#1b4332]/40 p-3 rounded-[8px] border border-[#30b466]/30 flex justify-between items-center">
                <span className="text-[12px] text-gray-300">Nuevo Total Calculado:</span>
                <span className="text-[16px] font-bold text-[#4ade80]">
                  {(reponerItem.stock || 0) + (parseInt(addStockAmount) || 0)} u
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReponerItem(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-[12px] font-bold uppercase tracking-wider rounded-[10px] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStock}
                  className="flex-1 py-3 bg-[#30b466] hover:bg-[#289655] text-[#0a110d] text-[12px] font-bold uppercase tracking-wider rounded-[10px] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingStock ? 'Guardando...' : 'Confirmar Reposición'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR PRODUCTO */}
      {editItem && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#121619] border border-white/10 rounded-[16px] max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-4 pb-3 border-b border-white/10">
              <div>
                <p className="text-[10px] font-bold text-[#4ade80] tracking-widest uppercase">Edición de Producto</p>
                <h3 className="text-[18px] font-bold text-white mt-0.5">{editFormData.name || 'Editar Producto'}</h3>
              </div>
              <button 
                onClick={() => setEditItem(null)} 
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-[#0d1114] border border-white/15 rounded-[10px] px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#30b466]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                    Categoría
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full bg-[#0d1114] border border-white/15 rounded-[10px] px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#30b466]"
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories.map((cat) => (
                      <option key={cat._id || cat.id || cat.nombre} value={cat.nombre || cat.name}>
                        {cat.nombre || cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                    Precio ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editFormData.price}
                    onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                    className="w-full bg-[#0d1114] border border-white/15 rounded-[10px] px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#30b466]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                  Nivel de Stock (Existencias Totales)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={editFormData.stock}
                  onChange={(e) => setEditFormData({ ...editFormData, stock: e.target.value })}
                  className="w-full bg-[#0d1114] border border-white/15 rounded-[10px] px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#30b466]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 tracking-wider uppercase mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows="3"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full bg-[#0d1114] border border-white/15 rounded-[10px] px-4 py-2.5 text-white text-[13px] focus:outline-none focus:border-[#30b466]"
                ></textarea>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 text-[12px] font-bold uppercase tracking-wider rounded-[10px] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="flex-1 py-3 bg-[#30b466] hover:bg-[#289655] text-[#0a110d] text-[12px] font-bold uppercase tracking-wider rounded-[10px] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingEdit ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
