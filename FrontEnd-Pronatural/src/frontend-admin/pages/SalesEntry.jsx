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
  const parsedAmountGiven = Number(amountGiven);
  const change = Number.isFinite(parsedAmountGiven) ? Math.max(0, parsedAmountGiven - total) : 0;
  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }
    if (paymentMethod === 'Efectivo' && (!Number.isFinite(parsedAmountGiven) || parsedAmountGiven < total)) {
      toast.error('Ingresa un monto válido igual o mayor al total.');
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
      toast.error(error.message || 'No se pudo registrar la venta. Inténtalo de nuevo.');
    }
  };
  return (
    <>
      <div className="mx-auto max-w-[1440px] space-y-6 pb-10">
        <header className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#17221c] via-[#121a17] to-[#101416] px-5 py-6 sm:px-7">
          <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border border-[#30b466]/10" />
          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#63d895]">Punto de venta</p>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[30px]">Nueva venta</h1>
              <p className="mt-1 text-sm text-slate-400">Escanea o busca productos y registra el pago.</p>
            </div>
            <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-2.5 text-xs font-medium text-slate-300">
              {new Date().toLocaleDateString('es-SV', { day: '2-digit', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </header>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-4">
            <div className={`relative rounded-2xl border p-2 transition-colors ${exactMatch ? 'border-[#30b466]/60 bg-[#30b466]/[0.04]' : 'border-white/[0.08] bg-[#161b1e]'}`}>
              <div className="relative">
                <svg className={`absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${exactMatch ? 'text-[#63d895]' : 'text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4" strokeLinecap="round"/></svg>
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && exactMatch) { e.preventDefault(); addToCart(exactMatch); } }}
                  placeholder="Buscar producto o escanear código SKU…"
                  aria-label="Buscar producto o escanear código SKU"
                  className="w-full rounded-xl border border-white/[0.06] bg-[#0d1114] py-4 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-[#30b466]/60 focus:outline-none focus:ring-2 focus:ring-[#30b466]/10"
                />
              </div>
              {search.length > 1 && (
                <div className="absolute inset-x-2 top-[calc(100%+8px)] z-30 max-h-80 overflow-y-auto rounded-xl border border-white/10 bg-[#171d20] shadow-2xl">
                  {filteredProducts.length > 0 ? filteredProducts.map((product) => {
                    const productId = product._id || product.id;
                    const productName = getName(product);
                    const productPrice = getPrice(product);
                    return (
                      <button
                        key={productId}
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="flex w-full items-center gap-3 border-b border-white/[0.05] p-3 text-left transition hover:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-45 last:border-b-0 sm:gap-4 sm:p-4"
                      >
                        <img src={product.img || product.image || 'https://placehold.co/96x96/161b22/30b466?text=PN'} className="h-12 w-12 shrink-0 rounded-lg bg-[#0d1114] object-cover" alt="" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-100">{productName}</span>
                          <span className="mt-1 block text-xs text-slate-500">SKU {getSku(product) || '—'} · Stock {product.stock ?? 0}</span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-[#63d895]">${productPrice.toFixed(2)}</span>
                      </button>
                    );
                  }) : <p className="p-5 text-center text-sm text-slate-400">No encontramos productos con ese nombre o código.</p>}
                </div>
              )}
              <p className="px-2 pb-1 pt-2 text-[11px] text-slate-500">Escribe al menos dos caracteres o escanea el SKU para agregar un producto.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#14191c]">
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-white">Productos de la venta</h2>
                  <p className="mt-1 text-xs text-slate-500">{cart.reduce((count, item) => count + item.qty, 0)} unidades · {cart.length} productos</p>
                </div>
                <span className="rounded-full bg-[#30b466]/10 px-3 py-1 text-xs font-semibold text-[#63d895]">Carrito</span>
              </div>
              {cart.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
                  <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-slate-500" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.6"><path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 9H6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
                  </span>
                  <p className="text-sm font-semibold text-slate-200">El carrito está vacío</p>
                  <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">Busca un producto por nombre o escanea su código para comenzar la venta.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.06]">
                  {cart.map((item) => (
                    <article key={item.id} className="flex flex-col gap-4 p-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-5 sm:px-5">
                      <img src={item.img || item.image || 'https://placehold.co/96x96/161b22/30b466?text=PN'} className="h-14 w-14 shrink-0 rounded-xl bg-[#0d1114] object-cover" alt="" />
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-semibold text-slate-100">{item.name}</h3>
                        <p className="mt-1 text-xs text-slate-500">${item.price.toFixed(2)} por unidad</p>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#0d1114] p-1">
                          <button type="button" onClick={() => updateQty(item.id, -1)} aria-label={`Quitar una unidad de ${item.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-slate-300 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#63d895]">−</button>
                          <span className="w-9 text-center text-sm font-semibold text-white">{item.qty}</span>
                          <button type="button" onClick={() => updateQty(item.id, 1)} aria-label={`Agregar una unidad de ${item.name}`} className="grid h-9 w-9 place-items-center rounded-lg text-[#63d895] transition hover:bg-[#30b466]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#63d895]">+</button>
                        </div>
                        <span className="min-w-[78px] text-right text-sm font-bold text-white">${(item.price * item.qty).toFixed(2)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-5">
            <section className="rounded-2xl border border-white/[0.08] bg-[#161b1e] p-5">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-white">Cliente</h2>
                <p className="mt-1 text-xs text-slate-500">Opcional, para asociar la compra.</p>
              </div>
              <select
                value={client}
                onChange={(e) => setClient(e.target.value)}
                aria-label="Cliente de la venta"
                className="w-full appearance-none rounded-xl border border-white/[0.08] bg-[#0d1114] px-4 py-3 text-sm text-white focus:border-[#30b466]/60 focus:outline-none focus:ring-2 focus:ring-[#30b466]/10"
              >
                <option value="Cliente General">Cliente General</option>
                {customers.map((customer, index) => <option key={customer._id || customer.id || index} value={customer._id || customer.id}>{customer.name} {customer.lastName}</option>)}
              </select>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-[#161b1e] p-5">
              <h2 className="text-sm font-semibold text-white">Forma de pago</h2>
              <button type="button" aria-pressed={paymentMethod === 'Efectivo'} onClick={() => setPaymentMethod('Efectivo')} className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[#30b466]/35 bg-[#30b466]/[0.08] p-4 text-left text-[#63d895]">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#30b466]/10" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 9h.01M18 15h.01" strokeLinecap="round"/></svg></span>
                <span><span className="block text-sm font-semibold">Efectivo</span><span className="mt-0.5 block text-xs text-slate-400">Pago en caja</span></span>
                <span className="ml-auto h-2 w-2 rounded-full bg-[#63d895]" />
              </button>
              {paymentMethod === 'Efectivo' && (
                <div className="mt-5">
                  <label htmlFor="amount-given" className="mb-2 block text-xs font-medium text-slate-400">Monto recibido</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">$</span>
                    <input id="amount-given" type="number" min="0" step="0.01" inputMode="decimal" value={amountGiven} onChange={(e) => setAmountGiven(e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-white/[0.08] bg-[#0d1114] py-3 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-[#30b466]/60 focus:outline-none focus:ring-2 focus:ring-[#30b466]/10" />
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-[#0d1114] px-4 py-3">
                    <span className="text-xs text-slate-400">Cambio</span>
                    <span className="text-sm font-bold text-[#63d895]">${change.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-[#161b1e] p-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400"><span>Subtotal</span><span className="text-slate-200">${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Impuestos ({taxRate}%)</span><span className="text-slate-200">${taxes.toFixed(2)}</span></div>
              </div>
              <div className="my-5 border-t border-white/[0.08]" />
              <div className="flex items-end justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Total a pagar</span>
                <span className="text-2xl font-bold tracking-tight text-[#63d895]">${total.toFixed(2)}</span>
              </div>
              <button type="button" onClick={handleConfirmSale} disabled={cart.length === 0} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#30b466] px-4 py-4 text-sm font-bold text-[#07130c] shadow-[0_10px_28px_rgba(48,180,102,0.16)] transition hover:-translate-y-0.5 hover:bg-[#3ac574] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#63d895] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7 10 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10"/></svg>
                Confirmar venta
              </button>
            </section>
          </aside>
        </div>
      </div>      {/* Modal de Ticket Virtual */}
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
