import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { SALES_UPDATED_EVENT, useGlobalData } from '../../context/GlobalDataContext';
import { api } from '../../utils/api';
import { getCloudinaryUrl } from '../../utils/cloudinary';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const MOST_SOLD_REFRESH_MS = 20_000;

const HERO_IMAGES = [
  { src: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=85&w=2200&auto=format&fit=crop', alt: 'Ingredientes naturales frescos preparados para una alimentación saludable', label: 'Origen natural', title: <>Bienestar que<br />viene de la tierra.</> },
  { src: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=85&w=2200&auto=format&fit=crop', alt: 'Taza de infusión natural sobre una mesa cálida', label: 'Rituales simples', title: <>Una pausa<br />para sentirte bien.</> },
  { src: 'https://images.unsplash.com/photo-1471943311424-646960669fbc?q=85&w=2200&auto=format&fit=crop', alt: 'Plantas aromáticas frescas de cultivo natural', label: 'Esencia botánica', title: <>La naturaleza<br />en cada elección.</> },
];

export default function Landing() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { reviews = [], config } = useGlobalData();
  const shouldReduceMotion = useReducedMotion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mostSoldProduct, setMostSoldProduct] = useState(null);

  // Consultar periódicamente el ranking de ventas del backend.
  useEffect(() => {
    let isActive = true;
    let requestInProgress = false;
    let refreshQueued = false;

    const fetchMostSold = async () => {
      if (document.visibilityState === 'hidden') return;
      if (requestInProgress) {
        refreshQueued = true;
        return;
      }
      requestInProgress = true;

      try {
        const data = await api.getMostSoldProduct();
        if (isActive && data?.id) setMostSoldProduct(data);
      } catch (e) {
        if (isActive && e.status === 404) {
          setMostSoldProduct(null);
          return;
        }
        if (isActive) console.error('No se pudo actualizar el producto más vendido:', e);
      } finally {
        requestInProgress = false;
        if (refreshQueued && isActive) {
          refreshQueued = false;
          window.setTimeout(fetchMostSold, 0);
        }
      }
    };

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') fetchMostSold();
    };

    fetchMostSold();
    const interval = window.setInterval(fetchMostSold, MOST_SOLD_REFRESH_MS);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    window.addEventListener(SALES_UPDATED_EVENT, fetchMostSold);

    return () => {
      isActive = false;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      window.removeEventListener(SALES_UPDATED_EVENT, fetchMostSold);
    };
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const handleAddToCart = () => {
    if (!mostSoldProduct) return;
    addItem({
      id: mostSoldProduct.id,
      name: mostSoldProduct.name,
      price: mostSoldProduct.price,
      image: mostSoldProduct.img,
      batchRef: mostSoldProduct.sku
    });
    navigate('/carrito');
  };

  return (
    <div className="w-full">
      {/* â”€â”€ HERO CARRUSEL â”€â”€ */}
      <section
        aria-label="Presentación de ProNatural"
        aria-roledescription="carrusel"
        className="relative isolate h-[calc(100svh-80px)] min-h-[520px] w-full overflow-hidden bg-[#0b2216]"
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={currentSlide}
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.045 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
            aria-hidden="true"
          >
            <motion.img
              src={HERO_IMAGES[currentSlide].src}
              alt=""
              loading={currentSlide === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover object-center"
              animate={shouldReduceMotion ? undefined : { scale: [1, 1.035] }}
              transition={{ duration: 7, ease: 'linear' }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-[#081c13]/80 via-[#081c13]/42 to-[#081c13]/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081c13]/55 via-transparent to-[#081c13]/10" />

        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1760px] flex-col justify-between px-6 py-8 sm:px-10 sm:py-10 lg:px-16 lg:py-14 xl:px-20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-[0.24em] text-white/85 uppercase">ProNatural <span className="text-[#e6a36f]">·</span> El Salvador</span>
            <span className="hidden items-center gap-2 text-[9px] font-semibold tracking-[0.18em] text-white/70 uppercase sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#d89053]" /> Productos de origen natural</span>
          </div>

          <div className="grid items-end gap-10 pb-16 md:grid-cols-[1fr_auto] md:gap-8 md:pb-14 md:pr-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`copy-${currentSlide}`}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl"
              >
                <p className="mb-4 text-[10px] font-bold tracking-[0.2em] text-[#f3bd8c] uppercase sm:mb-6">{HERO_IMAGES[currentSlide].label}</p>
                <h1 className="text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.92] font-semibold tracking-[-0.065em] text-white drop-shadow-sm">
                  {HERO_IMAGES[currentSlide].title}
                </h1>
                <p className="mt-5 max-w-md text-sm leading-6 text-white/80 sm:mt-7 sm:text-base">
                  Ingredientes naturales seleccionados con cuidado para acompañar tu bienestar cada día.
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex flex-col items-start gap-4 md:items-end md:pb-2">
              <Link
                to="/catalogo"
                className="inline-flex min-h-12 items-center gap-8 bg-[#b45309] px-6 text-[10px] font-bold tracking-[0.18em] text-white uppercase shadow-lg transition-colors hover:bg-[#934307] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                Explorar catálogo <span aria-hidden="true" className="text-base">↗</span>
              </Link>
              <span className="text-[10px] tracking-wide text-white/70">Conoce nuestra selección natural</span>
            </div>
          </div>

          <div className="absolute right-6 bottom-7 left-6 flex items-center justify-between sm:right-10 sm:bottom-9 sm:left-10 lg:right-16 lg:left-16 xl:right-24 xl:left-24">
            <div className="flex items-center gap-2" role="group" aria-label="Seleccionar imagen de portada">
              {HERO_IMAGES.map((slide, idx) => (
                <button
                  key={slide.label}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Mostrar: ${slide.label}`}
                  aria-pressed={idx === currentSlide}
                  className="group flex h-11 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <span className={`relative h-[2px] overflow-hidden transition-[width,background-color] duration-300 ${idx === currentSlide ? 'w-14 bg-white/35' : 'w-7 bg-white/45 group-hover:bg-white/80'}`}>
                    {idx === currentSlide && !shouldReduceMotion && (
                      <motion.span key={currentSlide} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 5, ease: 'linear' }} className="absolute inset-0 origin-left bg-white" />
                    )}
                  </span>
                </button>
              ))}
              <span className="ml-2 text-[10px] font-semibold tracking-[0.14em] text-white/80">0{currentSlide + 1} <span className="text-white/40">/ 0{HERO_IMAGES.length}</span></span>
            </div>
          </div>
        </div>
      </section>
      {mostSoldProduct && (
      <section className="bg-[#fdfaf6] px-5 pt-8 pb-16 sm:px-8 sm:pt-10 md:px-16 md:pt-12 md:pb-24 lg:px-24">
        <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[#d6d8d1] pb-5 sm:mb-10 sm:flex-row sm:items-end md:mb-12">
          <div>
            <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-orange-700 uppercase">LOTES SELECCIONADOS</p>
            <h2 className="text-4xl font-bold tracking-[-0.05em] text-brand-dark sm:text-5xl">Lo más vendido</h2>
          </div>
          <p className="max-w-xs text-xs leading-relaxed text-slate-500">El favorito de nuestros clientes, elegido por sus compras.</p>
        </div>

        <motion.section
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.18 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="grid overflow-hidden rounded-[26px] border border-[#e4e1d7] bg-white shadow-[0_26px_70px_-44px_rgba(11,34,22,0.38)] md:grid-cols-2"
        >
          <AnimatePresence mode="sync" initial={false}>
            <motion.div
              key={`image-${mostSoldProduct.id}`}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.025 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.99 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: 'easeOut' }}
              className="group relative min-h-[340px] overflow-hidden bg-[#e9e7df] sm:min-h-[440px] md:min-h-[520px]"
            >
              <motion.img
                src={(mostSoldProduct.img && (mostSoldProduct.img.startsWith('http') || mostSoldProduct.img.startsWith('data:'))) ? mostSoldProduct.img : getCloudinaryUrl(mostSoldProduct.img)}
                alt={mostSoldProduct.name}
                whileHover={shouldReduceMotion ? undefined : { scale: 1.035 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071b11]/45 via-transparent to-[#071b11]/10" />
              <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/50 bg-[#fbfaf6]/95 px-4 py-2 shadow-lg backdrop-blur-sm sm:left-7 sm:top-7">
                <span className="h-2 w-2 rounded-full bg-[#c45216]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#9b3f11]">Lo m&aacute;s vendido</span>
              </div>
              {mostSoldProduct.sku && mostSoldProduct.sku.length < 20 && (
                <div className="absolute bottom-5 left-5 rounded-lg border border-white/30 bg-[#fbfaf6]/95 px-4 py-2.5 shadow-lg backdrop-blur-sm sm:bottom-7 sm:left-7">
                  <p className="text-[9px] font-bold tracking-[0.15em] text-[#9b3f11] uppercase">SKU: {mostSoldProduct.sku}</p>
                </div>
              )}
            </motion.div>

            <motion.div
              key={`details-${mostSoldProduct.id}`}
              initial={shouldReduceMotion ? false : { opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, x: 10 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}
              aria-live="polite"
              className="flex flex-col justify-center bg-[#f6f5ef] p-7 sm:p-10 md:p-10 lg:p-14"
            >
              <div className="mb-8 flex items-center justify-between gap-4">
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#a44313] uppercase">Selecci&oacute;n de clientes</p>
                {Number.isFinite(Number(mostSoldProduct.totalVendido)) && (
                  <span className="rounded-full border border-[#d9d9ce] bg-white/70 px-3 py-1.5 text-[10px] font-semibold text-slate-600">
                    {Number(mostSoldProduct.totalVendido)} unidades
                  </span>
                )}
              </div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Producto destacado</p>
              <h3 className="max-w-xl text-3xl font-bold leading-[1.04] tracking-[-0.045em] text-brand-dark sm:text-4xl lg:text-[44px]">{mostSoldProduct.name}</h3>
              <p className="mt-5 max-w-lg text-sm leading-6 text-slate-600">{mostSoldProduct.desc || 'Nuestro producto m&aacute;s elegido, seleccionado cuidadosamente para ofrecerte calidad natural.'}</p>

              <div className="mt-8 flex items-end justify-between gap-4 border-y border-[#ddded5] py-5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Precio</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-brand-dark">${Number(mostSoldProduct.price).toFixed(2)}</p>
                </div>
                {Number.isFinite(Number(mostSoldProduct.totalVendido)) && (
                  <div className="text-right">
                    <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Preferido por</p>
                    <p className="mt-1 text-sm font-semibold text-brand-dark">nuestros clientes</p>
                  </div>
                )}
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <motion.button onClick={handleAddToCart} whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }} transition={{ duration: 0.16, ease: 'easeOut' }} className="group inline-flex min-h-12 flex-1 items-center justify-between gap-5 rounded-xl bg-[#0b2216] px-5 text-[10px] font-bold tracking-[0.14em] text-white uppercase shadow-md transition-colors hover:bg-[#123827] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b2216]">
                  <span>A&ntilde;adir al carrito</span>
                  <svg className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.button>
                <Link to={`/producto/${mostSoldProduct.id}`} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-[#cdd1c7] px-5 text-[10px] font-bold tracking-[0.14em] text-brand-dark uppercase transition-colors hover:border-[#0b2216] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2216]">Ver producto</Link>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.section></section>
      )}

      <section className="bg-[#f9f8f4] px-5 py-16 sm:px-8 md:px-16 md:py-24 lg:px-24">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col gap-4 border-b border-[#d9ddd5] pb-6 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-3 text-[10px] font-bold tracking-[0.2em] text-orange-700 uppercase">ATENCIÓN CERCANA</p>
              <h2 className="text-4xl font-bold tracking-[-0.05em] text-brand-dark sm:text-5xl">Compra con confianza</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-slate-600">Lee experiencias de clientes y encuentra respuestas antes de hacer tu pedido.</p>
          </div>

          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="space-y-7">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-bold tracking-[0.16em] text-brand-dark uppercase">Opiniones de clientes</h3>
                <Link to="/resenas" className="text-[10px] font-bold tracking-[0.12em] text-brand-dark uppercase underline underline-offset-4 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">Ver reseñas</Link>
              </div>
              {reviews.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {reviews.slice(0, 2).map((review) => (
                    <article key={review._id || review.id} className="border border-[#e5e6df] bg-white p-5 shadow-sm sm:p-6">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-xs font-bold text-brand-dark">{review.name}</p>
                        <div className="flex items-center gap-1" aria-label={`${review.rating} de 5 estrellas`}>
                          <span aria-hidden="true" className="text-sm tracking-[0.12em] text-amber-600">{'★'.repeat(Math.max(0, Math.min(5, Number(review.rating) || 0)))}</span>
                          <span className="text-[10px] text-slate-500">{review.rating}/5</span>
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">“{review.comment}”</p>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="border border-[#e5e6df] bg-white p-6">
                  <p className="text-sm leading-6 text-slate-600">Todavía no hay reseñas publicadas. Si ya compraste, comparte tu experiencia para orientar a otros clientes.</p>
                  <Link to="/resenas" className="mt-4 inline-flex min-h-10 items-center text-[10px] font-bold tracking-[0.12em] text-brand-dark uppercase underline underline-offset-4 hover:text-orange-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">Escribir una reseña</Link>
                </div>
              )}

              <div className="flex flex-col gap-4 border-t border-[#d9ddd5] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold text-brand-dark">¿Necesitas ayuda?</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Contacta al equipo para consultar sobre tu pedido o un producto.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/contacto" className="inline-flex min-h-11 items-center justify-center bg-[#0b2216] px-5 text-[10px] font-bold tracking-[0.12em] text-white uppercase transition-colors hover:bg-[#123827] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2216]">Contactar</Link>
                  {config?.whatsapp && (
                    <a href={`https://wa.me/${String(config.whatsapp).replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center border border-[#cdd4cc] px-4 text-[10px] font-bold tracking-[0.1em] text-brand-dark uppercase transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">WhatsApp</a>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold tracking-[0.16em] text-brand-dark uppercase">Preguntas frecuentes</h3>
              <p className="mb-4 text-xs text-slate-500">Información útil para completar tu compra.</p>
              <div className="divide-y divide-[#d9ddd5] border-y border-[#d9ddd5]">
                <details className="group py-4">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">¿Cómo hago un pedido?<span aria-hidden="true" className="text-lg font-normal text-orange-700 transition-transform group-open:rotate-45">+</span></summary>
                  <p className="max-w-2xl pb-2 pr-8 text-sm leading-6 text-slate-600">Elige tus productos, agrégalos al carrito y completa tus datos en el checkout. Al confirmar, el equipo coordina contigo por WhatsApp los detalles del pago y la entrega.</p>
                </details>
                <details className="group py-4">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">¿Cómo se coordina el pago y la entrega?<span aria-hidden="true" className="text-lg font-normal text-orange-700 transition-transform group-open:rotate-45">+</span></summary>
                  <p className="max-w-2xl pb-2 pr-8 text-sm leading-6 text-slate-600">Después de confirmar el pedido, ProNatural te contacta por WhatsApp para acordar el método de pago y la entrega.</p>
                </details>
                <details className="group py-4">
                  <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0b2216]">¿Dónde consulto los detalles de un producto?<span aria-hidden="true" className="text-lg font-normal text-orange-700 transition-transform group-open:rotate-45">+</span></summary>
                  <p className="max-w-2xl pb-2 pr-8 text-sm leading-6 text-slate-600">Abre el producto desde el catálogo para revisar su información. Si tienes otra duda, puedes escribirnos desde la página de contacto.</p>
                </details>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
