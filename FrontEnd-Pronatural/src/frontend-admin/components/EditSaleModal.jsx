import { useState, useEffect } from 'react';

export default function EditSaleModal({ isOpen, onClose, sale, onSave }) {
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (sale) {
      setStatus(sale.status || 'Completado');
      setNotes(sale.notes || '');
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(sale.id || sale._id, { status, notes });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#161b1e] rounded-[16px] w-full max-w-md border border-white/10 shadow-2xl overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-[18px] font-bold text-white">Editar Venta</h2>
            <p className="text-[12px] text-gray-400 mt-1">
              Venta ID: <span className="font-mono text-[#4ade80]">{String(sale.id || sale._id).slice(-6).toUpperCase()}</span>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Estado de la Venta</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#0d1114] border border-white/10 rounded-[8px] py-3 px-4 text-[13px] text-white focus:outline-none focus:border-[#4ade80]/50 appearance-none transition-colors cursor-pointer"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En Proceso">En Proceso</option>
                <option value="Enviado">Enviado</option>
                <option value="Entregado">Entregado</option>
                <option value="Completado">Completado</option>
                <option value="Pendiente WhatsApp">Pendiente WhatsApp</option>
                <option value="Cancelado">Cancelado</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </div>
            </div>
            {(status === 'Cancelado' || status === 'cancelled') && sale.status !== 'Cancelado' && sale.status !== 'cancelled' && (
              <p className="text-[11px] text-orange-400 mt-2">
                ⚠️ Al cambiar el estado a "Cancelado", los productos serán devueltos al inventario.
              </p>
            )}
            {(status === 'Completado' || status === 'Entregado') && (sale.status === 'Pendiente WhatsApp' || sale.status === 'Pendiente') && (
              <p className="text-[11px] text-[#4ade80] mt-2">
                ✓ Al cambiar a "{status}", se descontará el stock de inventario.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Notas del Pedido</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Entregado a tiempo, falta pagar $5..."
              className="w-full bg-[#0d1114] border border-white/10 rounded-[8px] py-3 px-4 text-[13px] text-white focus:outline-none focus:border-[#4ade80]/50 resize-none h-24 transition-colors placeholder:text-gray-600"
            ></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-[8px] bg-white/5 hover:bg-white/10 text-white text-[13px] font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3 px-4 rounded-[8px] bg-[#4ade80]/20 hover:bg-[#4ade80]/30 text-[#4ade80] text-[13px] font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
            >
              {isSaving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
