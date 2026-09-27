import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useCart } from '../../hooks/useCart';
import { useGlobalData } from '../../context/GlobalDataContext';
import { getCloudinaryUrl } from '../../utils/cloudinary';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();
  const { config } = useGlobalData();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const deliveryFee = config?.deliveryFee ?? 3.50;
  const taxRate = config?.taxRate ?? 0;
  const shipping = items.length > 0 ? deliveryFee : 0;
  const taxes = (subtotal * taxRate) / 100;
  const total = subtotal + shipping + taxes;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#fdfaf6]">
      <header className="border-b border-[#e9e7df] bg-[radial-gradient(ellipse_at_top_right,_rgba(48,180,102,0.08),_transparent_40%)] px-5 py-9 sm:px-8 md:px-12 md:py-12 lg:px-24">
        <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-[#7d8a80] uppercase">
          <Link to="/catalogo" className="transition-colors hover:text-orange-700">Cat&aacute;logo</Link>
          <span className="mx-2 text-[#b45309]">/</span>Tu selecci&oacute;n
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl leading-none font-bold tracking-[-0.055em] text-[#0b2216] md:text-[60px]">Tu carrito</h1>
            <p className="mt-3 text-[10px] font-bold tracking-[0.17em] text-gray-400 uppercase">
              {items.length} {items.length === 1 ? 'producto' : 'productos'} listos para acompa&ntilde;arte
            </p>
          </div>
          {items.length > 0 && (
            <motion.p key={subtotal} initial={shouldReduceMotion ? false : { opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-slate-500">
              Subtotal <span className="ml-2 font-semibold text-[#0b2216]">${subtotal.toFixed(2)}</span>
            </motion.p>
          )}
        </div>
      </header>

      {items.length === 0 ? (
        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.35 }}
          className="flex min-h-[440px] flex-col items-center justify-center px-5 py-20 text-center"
        >
          <div className="mb-7 grid h-20 w-20 place-items-center rounded-full border border-[#dce5dc] bg-white text-[#0b2216] shadow-sm" aria-hidden="true">
            <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <p className="text-[11px] font-bold tracking-[0.2em] text-[#0b2216] uppercase">Tu carrito est&aacute; vac&iacute;o</p>
          <p className="mt-3 mb-8 max-w-sm text-sm leading-6 text-slate-500">Explora el cat&aacute;logo y guarda aqu&iacute; los productos que quieras llevar.</p>
          <Link to="/catalogo" className="inline-flex min-h-12 items-center bg-[#0a2016] px-8 text-[10px] font-bold tracking-[0.16em] text-white uppercase transition-colors hover:bg-[#123827] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a2016]">
            Explorar el cat&aacute;logo
          </Link>
        </motion.section>
      ) : (
        <main className="grid items-start lg:grid-cols-[minmax(0,1fr)_390px]">
          <section aria-label="Productos en el carrito" className="px-5 py-7 sm:px-8 md:px-12 md:py-10 lg:px-16 xl:px-24">
            <div className="mb-5 flex items-center justify-between border-b border-[#e5e6df] pb-3">
              <h2 className="text-[10px] font-bold tracking-[0.18em] text-[#78847b] uppercase">Tus productos</h2>
              <span className="text-[10px] text-slate-400">{items.length} {items.length === 1 ? 'art&iacute;culo' : 'art&iacute;culos'}</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.article
                    key={item.id}
                    layout
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, x: -14, height: 0, marginBottom: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
                    className="flex flex-col gap-4 rounded-xl border border-[#e8e8e1] bg-white p-4 shadow-[0_10px_28px_-26px_rgba(11,34,22,0.5)] sm:flex-row sm:items-center sm:gap-5 sm:p-5"
                  >
                    <Link to={`/producto/${item.id}`} className="group flex min-w-0 flex-1 items-center gap-4 sm:gap-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2216]">
                      <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[#f0f0e9] sm:h-28 sm:w-28">
                        {item.image && (
                          <motion.img
                            src={getCloudinaryUrl(item.image)}
                            alt={item.name || item.title || ''}
                            whileHover={shouldReduceMotion ? undefined : { scale: 1.045 }}
                            transition={{ duration: 0.35, ease: 'easeOut' }}
                            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0 motion-reduce:transition-none"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="mb-2 text-[9px] font-bold tracking-[0.15em] text-orange-700 uppercase">{item.batchRef || 'Lote seleccionado'}</p>
                        <h3 className="line-clamp-2 text-[15px] font-bold leading-snug tracking-tight text-brand-dark transition-colors group-hover:text-[#25613e]">{(item.name || item.title || '').replace('\n', ' ')}</h3>
                        <p className="mt-2 text-[11px] text-slate-500">${(Number(item.price) || 0).toFixed(2)} <span className="text-slate-400">por unidad</span></p>
                      </div>
                    </Link>

                    <div className="flex items-center justify-between gap-5 border-t border-[#f0f0eb] pt-3 sm:border-0 sm:pt-0">
                      <div className="flex items-center rounded-full border border-[#dce2da] bg-[#f8f8f4]" aria-label="Cantidad">
                        <motion.button type="button" whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }} onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={`Disminuir cantidad de ${item.name || item.title}`} className="grid h-10 w-10 place-items-center rounded-full text-lg text-brand-dark transition-colors hover:bg-[#e7ede5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">&minus;</motion.button>
                        <motion.span key={item.quantity} initial={shouldReduceMotion ? false : { opacity: 0.5, y: 3 }} animate={{ opacity: 1, y: 0 }} className="w-8 text-center text-[12px] font-bold text-brand-dark">{item.quantity}</motion.span>
                        <motion.button type="button" whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }} onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={`Aumentar cantidad de ${item.name || item.title}`} className="grid h-10 w-10 place-items-center rounded-full text-lg text-brand-dark transition-colors hover:bg-[#e7ede5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">+</motion.button>
                      </div>
                      <motion.p key={`${item.quantity}-${item.price}`} initial={shouldReduceMotion ? false : { opacity: 0.55, y: 3 }} animate={{ opacity: 1, y: 0 }} className="min-w-20 text-right text-[15px] font-bold text-brand-dark">${((Number(item.price) || 0) * item.quantity).toFixed(2)}</motion.p>
                      <motion.button type="button" whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }} onClick={() => removeItem(item.id)} className="grid h-10 w-10 place-items-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-600" aria-label={`Eliminar ${item.name || item.title} del carrito`}>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>
                      </motion.button>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            </div>

            <button type="button" onClick={clearCart} className="mt-7 inline-flex min-h-10 items-center gap-2 text-[9px] font-bold tracking-[0.17em] text-slate-400 uppercase transition-colors hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6"/></svg>
              Vaciar carrito
            </button>
          </section>

          <aside aria-labelledby="cart-summary-title" className="border-t border-[#e4e3d9] bg-[#f4f3ec] px-5 py-8 sm:px-8 md:px-12 lg:sticky lg:top-24 lg:min-h-[calc(100vh-80px)] lg:border-t-0 lg:border-l lg:px-10 lg:py-10">
            <div className="mb-8 flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0b2216] text-xs font-bold text-white">{items.length}</span>
              <div>
                <h2 id="cart-summary-title" className="text-sm font-bold tracking-[0.12em] text-brand-dark uppercase">Resumen del pedido</h2>
                <p className="mt-1 text-xs text-slate-600">Revisa el total antes de continuar</p>
              </div>
            </div>

            <div className="mb-7 max-h-48 space-y-4 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div key={item.id} layout initial={shouldReduceMotion ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={shouldReduceMotion ? undefined : { opacity: 0, x: -8 }} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-xs font-semibold leading-5 text-brand-dark">{(item.name || item.title || '').replace('\n', ' ')}</p>
                      <p className="mt-1 text-xs text-slate-600">Cantidad: {item.quantity}</p>
                    </div>
                    <motion.span key={`${item.id}-${item.quantity}`} initial={shouldReduceMotion ? false : { opacity: 0.5 }} animate={{ opacity: 1 }} className="shrink-0 text-sm font-semibold text-brand-dark">${((Number(item.price) || 0) * item.quantity).toFixed(2)}</motion.span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="space-y-4 border-t border-[#dcded5] py-6">
              <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-slate-600 uppercase"><span>Subtotal</span><motion.span key={subtotal} initial={shouldReduceMotion ? false : { opacity: 0.5 }} animate={{ opacity: 1 }} className="text-sm font-medium tracking-normal text-brand-dark">${subtotal.toFixed(2)}</motion.span></div>
              <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-slate-600 uppercase"><span>Env&iacute;o</span><span className="text-sm font-medium tracking-normal text-brand-dark">${shipping.toFixed(2)}</span></div>
              {taxes > 0 && <div className="flex justify-between text-xs font-bold tracking-[0.1em] text-slate-600 uppercase"><span>Impuestos</span><span className="text-sm font-medium tracking-normal text-brand-dark">${taxes.toFixed(2)}</span></div>}
            </div>

            <div className="mb-7 flex items-end justify-between border-t border-[#dcded5] pt-6">
              <div className="min-w-0 pr-2"><p className="text-xs font-bold tracking-[0.14em] text-brand-dark uppercase">Total</p><p className="mt-1 text-xs leading-5 text-slate-600">Pago y entrega se coordinan por WhatsApp</p></div>
              <motion.span key={total} initial={shouldReduceMotion ? false : { opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 text-3xl font-bold leading-none tracking-[-0.05em] text-brand-dark sm:text-[2.1rem]">${total.toFixed(2)}</motion.span>
            </div>

            <motion.button type="button" whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }} onClick={() => navigate('/pago')} className="group flex min-h-14 w-full items-center justify-between bg-[#0a2016] px-5 text-xs font-bold tracking-[0.14em] text-white uppercase shadow-md transition-colors hover:bg-[#123827] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0a2016]">
              <span>Proceder al pago</span><svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
            </motion.button>
            <Link to="/catalogo" className="mt-5 inline-flex min-h-10 w-full items-center justify-center text-[11px] font-bold tracking-[0.14em] text-slate-600 uppercase transition-colors hover:text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">&larr; Seguir comprando</Link>
          </aside>
        </main>
      )}
    </div>
  );
}
