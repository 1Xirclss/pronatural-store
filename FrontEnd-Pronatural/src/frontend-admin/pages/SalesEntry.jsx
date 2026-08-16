import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import toast from 'react-hot-toast';
export default function SalesEntry() {
  const { products, customers, addSale, config } = useGlobalData();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [client, setClient] = useState('Cliente General');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [amountGiven, setAmountGiven] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [lastSale, setLastSale] = useState(null);

  const taxRate = config?.taxRate ?? 0;

  // Normalizar nombre y SKU del producto (MongoDB usa nombreProducto, localmente puede ser name)
  const getName = (p) => p.nombreProducto || p.name || p.nombre || '';
  const getSku = (p) => p.sku || p.codigo || '';
  const getPrice = (p) => typeof p.precio === 'number' ? p.precio : (typeof p.price === 'number' ? p.price : 0);

  const exactMatch = products.find(p => getSku(p) && getSku(p).toLowerCase() === search.toLowerCase());
  const filteredProducts = search.length > 1
    ? products.filter(p =>
        getName(p).toLowerCase().includes(search.toLowerCase()) ||
        getSku(p).toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const addToCart = (product) => {
    const prodId = product._id || product.id;
    const existing = cart.find(item => (item._id || item.id) === prodId);
    if (existing) {
      if (existing.qty >= product.stock) {
        toast.error('No hay suficiente stock');
        return;
      }
      setCart(cart.map(item => (item._id || item.id) === prodId ? { ...item, qty: item.qty + 1 } : item));
    } else {
      if (product.stock <= 0) {
        toast.error('Producto sin stock');
        return;
      }
      // Normalizar campos para que el ticket funcione correctamente
      setCart([...cart, {
        ...product,
        id: prodId,
        name: getName(product),
        price: getPrice(product),
        qty: 1
      }]);
    }
    setSearch('');
  };
  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if ((item._id || item.id) === id) {
        const newQty = item.qty + delta;
        if (newQty > item.stock) {
          toast.error('Has alcanzado el límite de stock');
          return item;
        }
        if (newQty < 1) {
          return null;
        }
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(Boolean));
  };
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const taxes = (subtotal * taxRate) / 100;
  const total = subtotal + taxes;
  const change = Math.max(0, parseFloat(amountGiven || '0') - total);
  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    if (paymentMethod === 'Efectivo' && parseFloat(amountGiven || '0') < total) {
      toast.error('El monto entregado es menor al total');
      return;
    }
    try {
      const saved = await addSale({
        client,
        amount: total,
        total,
        paymentMethod,
        products: cart.map(c => ({ productId: c._id || c.id, quantity: c.qty, name: c.name, price: c.price })),
        items: cart.map(c => ({ id: c._id || c.id, quantity: c.qty, name: c.name, price: c.price })),
        status: 'Completado'
      });
      setLastSale({
        ...saved,
        cart: [...cart],
        amountGiven: paymentMethod === 'Efectivo' ? amountGiven : total,
        change: change
      });
      setShowTicket(true);
      toast.success('¡Venta registrada con éxito!');
      setCart([]);
      setClient('Cliente General');
      setAmountGiven('');
    } catch (error) {
      toast.error('Error al registrar la venta');
    }
  };
  return (
    <>
      <div className="max-w-[1200px] mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Nueva Venta</h1>
              <p className="text-gray-400 text-[14px] mt-1">Registrar una nueva transacción en el punto de venta.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 ml-2">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-400"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span className="text-gray-400 text-[11px] font-medium tracking-wide">
                {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          <div className="flex flex-col gap-6">
            <div className={`border rounded-[12px] p-2 relative transition-all duration-300 ${exactMatch ? 'bg-[#1b4332]/20 border-[#30b466]' : 'bg-[#161b1e] border-white/5'}`}>
              <div className="relative z-20">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${exactMatch ? 'text-[#4ade80]' : 'text-gray-400'}`}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar productos o escanear código (SKU)..."
                  className={`w-full bg-[#0d1114] border rounded-[8px] pl-12 pr-12 py-3.5 text-[14px] text-white transition-all duration-300 focus:outline-none ${exactMatch ? 'border-[#30b466]/50 focus:border-[#4ade80] placeholder-[#30b466]/50 shadow-[0_0_15px_rgba(48,180,102,0.1)]' : 'border-white/5 focus:border-white/20 placeholder-gray-500'}`}
                />
              </div>
              {filteredProducts.length > 0 && (
                <div className="absolute top-[110%] left-0 right-0 bg-[#161b1e] border border-white/10 rounded-[12px] overflow-hidden shadow-2xl z-30 max-h-[300px] overflow-y-auto">
                  {filteredProducts.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => addToCart(p)}
                      className="flex items-center gap-4 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0 transition-colors"
                    >
                      <img src={p.img || 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'} className="w-10 h-10 rounded-[6px] object-cover" alt="" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-white font-medium truncate">{p.name}</p>
                        <p className="text-[11px] text-gray-500 font-mono">Stock: {p.stock} | {p.sku}</p>
                      </div>
                      <p className="text-[#4ade80] font-bold text-[14px]">${p.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-[#161b1e] border border-white/5 rounded-[12px] overflow-hidden min-h-[300px] overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Producto</th>
                    <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-medium text-center">Cant.</th>
                    <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-medium text-right">Precio</th>
                    <th className="py-4 px-6 text-[11px] uppercase tracking-wider text-gray-500 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-12 text-center text-gray-500 text-[13px]">
                        El carrito está vacío. Busca un producto para añadirlo.
                      </td>
                    </tr>
                  ) : (
                    cart.map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-4">
                            <img src={item.img || 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'} className="w-12 h-12 rounded-[8px] object-cover bg-[#0d1114]" alt="" />
                            <div>
                              <p className="text-[14px] text-white font-medium">{item.name}</p>
                              <p className="text-[11px] text-gray-500 line-clamp-1">{item.desc}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                            <span className="text-[15px] font-bold text-white w-6 text-center">{item.qty}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-full border border-[#30b466]/30 flex items-center justify-center text-[#4ade80] hover:bg-[#30b466]/10 transition-colors cursor-pointer">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right text-[14px] text-gray-300">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-right text-[15px] text-white font-medium">
                          ${(item.price * item.qty).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-col gap-4 sticky top-[30px] self-start">
            <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-5">
              <label className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-3 block">Cliente (Opcional)</label>
              <div className="relative">
                <select
                  value={client}
                  onChange={e => setClient(e.target.value)}
                  className="w-full bg-[#0d1114] border border-white/5 rounded-[8px] px-4 py-2.5 text-[13px] text-white focus:outline-none focus:border-[#4ade80] transition-colors appearance-none cursor-pointer"
                >
                  <option value="Cliente General">Cliente General</option>
                  {customers.map((c, index) => (
                    <option key={c._id || c.id || index} value={c._id || c.id}>{c.name} {c.lastName}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-5">
              <label className="text-[11px] uppercase tracking-wider text-gray-500 font-medium mb-4 block">Método de Pago</label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setPaymentMethod('Efectivo')}
                  className={`py-3 flex flex-col items-center justify-center gap-1.5 rounded-[10px] border transition-colors cursor-pointer ${
                    paymentMethod === 'Efectivo' 
                    ? 'bg-[#1b4332]/20 border-[#30b466] text-[#4ade80]' 
                    : 'bg-[#0d1114] border-white/5 text-gray-400 hover:border-white/20'
                  }`}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
                  <span className="text-[11px] font-bold uppercase">Efectivo</span>
                </button>

              </div>
              {paymentMethod === 'Efectivo' && (
                <>
                  <label className="text-[11px] text-gray-400 mb-2 block">Monto Entregado</label>
                  <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      value={amountGiven}
                      onChange={(e) => setAmountGiven(e.target.value)}
                      className="w-full bg-[#0d1114] border border-white/5 rounded-[8px] pl-8 pr-4 py-2.5 text-[14px] text-white focus:outline-none focus:border-[#4ade80] transition-colors"
                    />
                  </div>
                  <div className="bg-[#0d1114] border border-white/5 rounded-[8px] px-4 py-3 flex items-center justify-between">
                    <span className="text-[13px] text-gray-400">Cambio a entregar</span>
                    <span className="text-[15px] font-bold text-[#4ade80]">${change.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
            <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-5">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-400">Subtotal</span>
                  <span className="text-gray-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-gray-400">Impuestos ({taxRate}%)</span>
                  <span className="text-gray-200">${taxes.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5 mb-6">
                <span className="text-[12px] text-gray-400 uppercase tracking-widest font-bold">Total a Pagar</span>
                <span className="text-[20px] font-bold text-[#4ade80]">${total.toFixed(2)}</span>
              </div>
              <button 
                onClick={handleConfirmSale}
                className="w-full py-3.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] text-[13px] font-bold rounded-[8px] transition-colors flex justify-center items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(48,180,102,0.3)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                CONFIRMAR VENTA
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de Ticket Virtual */}
      {showTicket && lastSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a110d]/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#161b1e] border border-white/10 rounded-[16px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col">
            
            {/* Header del Ticket */}
            <div className="bg-[#0d1114] p-6 text-center border-b border-white/5">
              <div className="w-12 h-12 bg-[#30b466]/20 rounded-full flex items-center justify-center mx-auto mb-3 text-[#4ade80]">
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2 className="text-white font-bold tracking-wider uppercase text-[15px]">Venta Exitosa</h2>
              <p className="text-gray-500 text-[12px] mt-1 tracking-widest">{lastSale._id || lastSale.id}</p>
            </div>

            {/* Cuerpo del Ticket */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-400 text-[12px]">Fecha:</span>
                <span className="text-white text-[13px]">{new Date(lastSale.createdAt || lastSale.date).toLocaleString('es-ES')}</span>
              </div>
              
              <div className="border-t border-dashed border-white/10 pt-4 mb-4">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold block mb-3">Productos</span>
                {lastSale.cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start mb-2">
                    <div className="flex gap-2 text-[13px] text-gray-300">
                      <span>{item.qty}x</span>
                      <span className="line-clamp-1">{item.name}</span>
                    </div>
                    <span className="text-white text-[13px]">${(item.qty * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-white/10 pt-4 space-y-2">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-gray-200">${lastSale.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-gray-400">Método de Pago:</span>
                  <span className="text-gray-200 uppercase">{lastSale.paymentMethod}</span>
                </div>
                {lastSale.paymentMethod === 'Efectivo' && (
                  <>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Entregado:</span>
                      <span className="text-gray-200">${parseFloat(lastSale.amountGiven || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="text-gray-400">Cambio:</span>
                      <span className="text-[#4ade80] font-bold">${lastSale.change.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-white/10 pt-4 mt-4 mb-4">
                {(() => {
                  const customer = customers.find(c => (c._id || c.id) === lastSale.client);
                  if (customer) {
                    return (
                      <div className="text-[12px] text-gray-400">
                        <span className="block text-gray-300 font-bold mb-1">Datos del Cliente:</span>
                        <span>{customer.name} {customer.lastName}</span>
                        {customer.phone && <span className="block mt-1">Tel: {customer.phone}</span>}
                      </div>
                    );
                  }
                  return (
                    <div className="text-[12px] text-gray-400">
                      <span className="block text-gray-300 font-bold mb-1">Datos del Cliente:</span>
                      <span>Cliente General</span>
                    </div>
                  );
                })()}
              </div>

              <div className="border-t border-white/10 pt-4 mt-4 flex justify-between items-center">
                <span className="text-white font-bold text-[14px] uppercase tracking-wider">Total</span>
                <span className="text-[#4ade80] font-bold text-[20px]">${lastSale.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer del Ticket */}
            <div className="p-4 bg-[#0d1114] border-t border-white/5 flex flex-col gap-2">
              {lastSale.client !== 'Cliente General' && customers.find(c => (c._id || c.id) === lastSale.client) && (
                <>
                  <button 
                    onClick={async () => {
                      try {
                        toast.loading('Enviando factura...', { id: 'email' });
                        await sendInvoice(lastSale._id || lastSale.id);
                        toast.success('¡Factura enviada exitosamente!', { id: 'email' });
                      } catch (error) {
                        toast.error('Error al enviar factura', { id: 'email' });
                      }
                    }}
                    className="w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-400 hover:text-indigo-300 text-[12px] font-bold uppercase tracking-wider rounded-[8px] transition-colors flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    Enviar Factura al Correo
                  </button>
                  <button 
                    onClick={() => {
                      const customer = customers.find(c => (c._id || c.id) === lastSale.client);
                      if (customer && customer.phone) {
                        let msg = `¡Hola ${customer.name}! Gracias por tu compra en Pro Natural.\n\nAquí está el resumen de tu ticket #${(lastSale._id || lastSale.id).toString().substring(0,6)}:\n\n`;
                        lastSale.cart.forEach(item => {
                          msg += `- ${item.qty}x ${item.name} ($${(item.qty * item.price).toFixed(2)})\n`;
                        });
                        msg += `\nTotal: $${lastSale.total.toFixed(2)}\n\n¡Gracias por tu preferencia!`;
                        window.open(`https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      } else {
                        toast.error('El cliente no tiene un teléfono registrado');
                      }
                    }}
                    className="w-full py-2.5 bg-[#25D366]/20 hover:bg-[#25D366]/40 border border-[#25D366]/50 text-[#25D366] text-[12px] font-bold uppercase tracking-wider rounded-[8px] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.386 0 12.03c0 2.128.552 4.195 1.6 6.014L.045 23.955l6.064-1.589A12.006 12.006 0 0012.031 24c6.645 0 12.031-5.385 12.031-12.03S18.677 0 12.031 0zm0 22.015c-1.8 0-3.565-.483-5.112-1.4l-.367-.217-3.8.995 1.015-3.705-.238-.378C2.476 15.545 1.969 13.82 1.969 12.03 1.969 6.486 6.487 1.984 12.031 1.984c5.543 0 10.046 4.502 10.046 10.046 0 5.543-4.503 10.046-10.046 9.985zM17.54 14.5c-.302-.152-1.794-.886-2.073-.988-.278-.101-.481-.152-.684.152-.202.304-.783.988-.961 1.19-.177.203-.354.228-.657.076-1.547-.768-2.684-1.391-3.712-2.73-.243-.316-.011-.476.128-.642.278-.335.532-.614.733-.842.152-.178.203-.304.304-.507.101-.203.05-.38-.026-.532-.076-.152-.683-1.646-.936-2.253-.247-.594-.499-.513-.684-.523h-.583c-.202 0-.532.076-.811.38-.278.304-1.064 1.04-1.064 2.533 0 1.494 1.089 2.937 1.24 3.14.152.203 2.14 3.266 5.187 4.582 2.215.955 2.879.882 3.424.743.619-.158 1.794-.734 2.047-1.443.253-.71.253-1.317.177-1.443-.075-.126-.277-.202-.581-.354z"></path></svg>
                    Enviar por WhatsApp
                  </button>
                </>
              )}
              <div className="flex gap-2 w-full mt-1">
                <button 
                  onClick={() => setShowTicket(false)}
                  className="flex-1 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] text-[12px] font-bold uppercase tracking-wider rounded-[8px] transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
