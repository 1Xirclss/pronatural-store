import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import toast from 'react-hot-toast';
import EditSaleModal from '../components/EditSaleModal';

function getStatusBadge(status) {
  switch (status) {
    case 'Completado':
      return { bg: 'bg-[#1b4332]/40 text-[#4ade80] border-[#30b466]/30', dot: 'bg-[#4ade80]' };
    case 'Pendiente':
      return { bg: 'bg-amber-950/40 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' };
    case 'En Proceso':
      return { bg: 'bg-blue-950/40 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' };
    case 'Enviado':
      return { bg: 'bg-purple-950/40 text-purple-400 border-purple-500/30', dot: 'bg-purple-400' };
    case 'Entregado':
      return { bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
    case 'Pendiente WhatsApp':
      return { bg: 'bg-teal-950/40 text-teal-400 border-teal-500/30', dot: 'bg-teal-400' };
    case 'Cancelado':
    case 'cancelled':
      return { bg: 'bg-rose-950/40 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' };
    default:
      return { bg: 'bg-white/5 text-gray-400 border-white/10', dot: 'bg-gray-400' };
  }
}

export default function SalesHistory() {
  const { sales, deleteSale, updateSaleStatus } = useGlobalData();
  const [filterMode, setFilterMode] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSales, setExpandedSales] = useState({});

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const toggleExpand = (id) => setExpandedSales(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredSales = sales.filter(sale => {
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase().replace('#', '');
      const saleId = String(sale._id || sale.id || '').toLowerCase();
      const shortRef = saleId.length > 6 ? saleId.slice(-6).toLowerCase() : saleId;
      const clientName = (sale.customerId?.name ? `${sale.customerId.name} ${sale.customerId.lastName}` : sale.client || '').toLowerCase();
      const notes = String(sale.notes || '').toLowerCase();
      // Buscar también en nombres de productos
      const productNames = (sale.products || []).map(p =>
        (p.productId?.nombreProducto || p.name || '').toLowerCase()
      ).join(' ');
      if (!saleId.includes(q) && !shortRef.includes(q) && !clientName.includes(q) && !notes.includes(q) && !productNames.includes(q)) {
        return false;
      }
    }
    if (filterMode === 'all') return true;
    const saleDateStr = (sale.createdAt || sale.date) ? (sale.createdAt || sale.date).split('T')[0] : '';
    if (filterMode === 'date' && filterValue) return saleDateStr === filterValue;
    if (filterMode === 'month' && filterValue) return saleDateStr.startsWith(filterValue);
    return true;
  }).sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de venta?')) {
      deleteSale(id);
      toast.success('Venta eliminada del registro');
    }
  };

  const handleConfirmWhatsAppSale = async (id) => {
    if (window.confirm('¿Confirmar que el pago de WhatsApp fue recibido?')) {
      try {
        await updateSaleStatus(id, 'Completado');
        toast.success('Venta de WhatsApp confirmada y stock descontado.');
      } catch (error) {
        toast.error('Error al confirmar la venta.');
      }
    }
  };

  const handleEdit = (sale) => {
    setSelectedSale(sale);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (id, payload) => {
    try {
      await updateSaleStatus(id, payload);
      toast.success('Venta actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la venta');
      throw error;
    }
  };

  const handleFilterModeChange = (e) => {
    setFilterMode(e.target.value);
    setFilterValue('');
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Historial de Ventas</h1>
          <p className="text-gray-400 text-[14px] mt-1">Revisa el registro completo de transacciones realizadas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por ID, cliente, producto o notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#161b1e] text-gray-200 text-[13px] px-3.5 py-2 rounded-[12px] border border-white/10 focus:outline-none focus:border-[#4ade80] transition-colors w-full sm:w-[300px]"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs">✕</button>
            )}
          </div>
          <div className="flex items-center gap-3 bg-[#161b1e] p-1.5 rounded-[12px] border border-white/10">
            <select
              value={filterMode}
              onChange={handleFilterModeChange}
              className="bg-transparent text-gray-300 text-[13px] font-medium px-2 py-1 outline-none border-r border-white/10 cursor-pointer"
            >
              <option value="all">Todas las ventas</option>
              <option value="date">Día específico</option>
              <option value="month">Mes específico</option>
            </select>
            {filterMode === 'date' && (
              <input type="date" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}
                className="bg-transparent text-gray-300 text-[13px] outline-none px-2 py-1" />
            )}
            {filterMode === 'month' && (
              <input type="month" value={filterValue} onChange={(e) => setFilterValue(e.target.value)}
                className="bg-transparent text-gray-300 text-[13px] outline-none px-2 py-1" />
            )}
          </div>
        </div>
      </div>

      <div className="bg-[#161b1e] border border-white/5 rounded-[12px] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-[16px] text-white font-semibold">Registro General</h2>
          <div className="text-[12px] text-gray-400">Total Transacciones: {sales.length}</div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-white/5 bg-[#0d1114]">
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold w-[30px]"></th>
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold w-[100px]">ID Venta</th>
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Cliente</th>
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Fecha</th>
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Productos</th>
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Monto</th>
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold">Estado</th>
                <th className="py-4 px-4 text-[11px] uppercase tracking-wider text-gray-500 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-gray-500 text-[14px]">
                    No hay ventas registradas
                  </td>
                </tr>
              ) : (
                filteredSales.map(sale => {
                  const saleDate = sale.createdAt ? new Date(sale.createdAt) : (sale.date ? new Date(sale.date) : new Date());
                  const formattedDate = saleDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                  const productsArray = sale.products || sale.items || [];
                  const totalItems = productsArray.reduce((acc, curr) => acc + (curr.quantity || 1), 0);
                  const clientName = sale.customerId?.name
                    ? `${sale.customerId.name} ${sale.customerId.lastName || ''}`
                    : sale.client || 'Cliente General';
                  const clientEmail = sale.customerId?.email || '';
                  const saleAmount = sale.total || sale.amount || 0;
                  const saleId = sale._id || sale.id;
                  const isExpanded = expandedSales[saleId];
                  const badge = getStatusBadge(sale.status);

                  return (
                    <>
                      <tr key={saleId} className={`hover:bg-white/[0.02] transition-colors ${isExpanded ? 'bg-white/[0.015]' : ''}`}>
                        {/* Toggle expand */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => toggleExpand(saleId)}
                            className="w-6 h-6 rounded-[6px] bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
                            title={isExpanded ? 'Contraer' : 'Ver productos'}
                          >
                            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                              className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                        <td className="py-4 px-4 text-[13px] font-mono text-[#4ade80] font-medium">
                          {String(saleId).slice(-6).toUpperCase()}
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-[13px] text-gray-200 font-medium">{clientName}</div>
                          {clientEmail && <div className="text-[11px] text-gray-500 mt-0.5">{clientEmail}</div>}
                        </td>
                        <td className="py-4 px-4 text-[13px] text-gray-400">{formattedDate}</td>
                        <td className="py-4 px-4">
                          <div className="text-[13px] text-gray-300 font-medium">{totalItems} art{totalItems !== 1 ? 's' : ''}.</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {productsArray.slice(0, 2).map((p, i) => {
                              const nombre = p.productId?.nombreProducto || p.name || 'Producto';
                              return <span key={i}>{nombre}{i < Math.min(productsArray.length, 2) - 1 ? ', ' : ''}</span>;
                            })}
                            {productsArray.length > 2 && <span className="text-gray-600"> +{productsArray.length - 2} más</span>}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-[14px] text-white font-bold">${saleAmount.toFixed(2)}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-[6px] text-[11px] font-bold border ${badge.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.dot}`}></span>
                            {sale.status === 'cancelled' ? 'Cancelado' : sale.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {sale.status === 'Pendiente WhatsApp' && (
                              <button onClick={() => handleConfirmWhatsAppSale(sale.id || sale._id)}
                                className="w-8 h-8 rounded-[8px] bg-[#4ade80]/10 hover:bg-[#4ade80]/20 flex items-center justify-center text-[#4ade80] transition-colors cursor-pointer"
                                title="Confirmar Venta WhatsApp">
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              </button>
                            )}
                            <button onClick={() => handleEdit(sale)}
                              className="w-8 h-8 rounded-[8px] bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                              title="Editar Venta">
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            </button>
                            <button onClick={() => handleDelete(sale.id || sale._id)}
                              className="w-8 h-8 rounded-[8px] bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center text-red-400 transition-colors cursor-pointer"
                              title="Eliminar Venta">
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Fila expandida con detalle de productos ── */}
                      {isExpanded && (
                        <tr key={`${saleId}-detail`} className="bg-[#0d1114]">
                          <td colSpan="8" className="px-8 py-5">
                            <div className="mb-3 flex items-center gap-2">
                              <span className="text-[10px] font-bold text-[#4ade80] tracking-widest uppercase">Detalle de Productos</span>
                              <div className="flex-1 h-px bg-white/5"></div>
                            </div>
                            <div className="grid gap-2">
                              {productsArray.map((item, idx) => {
                                const prod = item.productId;
                                const nombre = prod?.nombreProducto || item.name || 'Producto eliminado';
                                const sku = prod?.sku || item.sku || '—';
                                const categoria = prod?.idCategoria || item.category || '—';
                                const qty = item.quantity || 1;
                                const unitPrice = item.unitPrice || prod?.precio || item.price || 0;
                                const subtotal = item.subtotal || (unitPrice * qty);
                                return (
                                  <div key={idx} className="flex items-center justify-between bg-white/[0.03] border border-white/5 rounded-[8px] px-4 py-3">
                                    <div className="flex items-center gap-4">
                                      <div className="w-8 h-8 rounded-[6px] bg-[#4ade80]/10 flex items-center justify-center flex-shrink-0">
                                        <span className="text-[11px] font-bold text-[#4ade80]">{qty}</span>
                                      </div>
                                      <div>
                                        <p className="text-[13px] font-semibold text-gray-200">{nombre}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                          <span className="text-[10px] text-gray-500 font-mono">SKU: {sku}</span>
                                          {categoria && categoria !== '—' && (
                                            <span className="text-[10px] text-gray-600">·</span>
                                          )}
                                          {categoria && categoria !== '—' && (
                                            <span className="text-[10px] text-purple-400 font-medium">{categoria}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[13px] font-bold text-white">${subtotal.toFixed(2)}</p>
                                      <p className="text-[10px] text-gray-500 mt-0.5">${unitPrice.toFixed(2)} × {qty}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            {/* Notas de la venta */}
                            {sale.notes && (
                              <div className="mt-3 px-4 py-2.5 bg-white/[0.02] border border-white/5 rounded-[8px]">
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Notas de envío</p>
                                <p className="text-[12px] text-gray-400">{sale.notes}</p>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <EditSaleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sale={selectedSale}
        onSave={handleSaveEdit}
      />
    </div>
  );
}