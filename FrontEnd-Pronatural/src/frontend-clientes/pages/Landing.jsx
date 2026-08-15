import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { getCloudinaryUrl } from '../../utils/cloudinary';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=2000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=2000&auto=format&fit=crop",
];

export default function Landing() {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mostSoldProduct, setMostSoldProduct] = useState(null);

  // Cargar el producto más vendido desde el backend en tiempo real
  useEffect(() => {
    const fetchMostSold = async () => {
      try {
        const res = await fetch(`${BASE_URL}/products/most-sold`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMostSoldProduct(data);
        }
      } catch (e) {
        console.error('Error al cargar producto más vendido:', e);
      }
    };
    fetchMostSold();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
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
      {/* ── HERO CARRUSEL ── */}
      <section className="relative h-[75vh] sm:h-[80vh] md:h-[85vh] w-full bg-gray-900 overflow-hidden">
        {HERO_IMAGES.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`Hero slide ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-80' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-[#0a2016]/40 mix-blend-multiply" />

        <div className="absolute inset-0 p-5 sm:p-10 lg:p-24 flex flex-col justify-between py-10 md:py-20 z-10">
          {/* Título hero responsive */}
          <h1 className="text-white text-[48px] sm:text-[70px] md:text-[90px] lg:text-[120px] font-bold leading-[0.85] tracking-tighter self-start">
            Poder<br />crudo.<br />Tierra<br />pura.
          </h1>

          {/* Botón catálogo */}
          <div className="flex justify-end w-full mt-auto">
            <div className="text-right">
              <p className="text-white text-[11px] max-w-[220px] sm:max-w-xs ml-auto mb-6 leading-relaxed opacity-90 font-medium drop-shadow-md">
                Acceso directo al catálogo de productos orgánicos.
              </p>
              <Link
                to="/catalogo"
                className="bg-[#b45309] text-white text-[10px] font-bold tracking-[0.2em] px-8 py-4 uppercase hover:bg-orange-800 transition-colors inline-block shadow-lg"
              >
                Acceder al catálogo
              </Link>
            </div>
          </div>

          {/* Indicadores del carrusel */}
          <div className="absolute bottom-8 left-5 sm:left-10 lg:left-24 flex gap-3">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  idx === currentSlide ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Ir a diapositiva ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── LO MÁS VENDIDO ── */}
      {mostSoldProduct && (
      <section className="py-16 md:py-32 px-5 md:px-16 lg:px-24 bg-[#fdfaf6]">
        <p className="text-orange-700 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">LOTES SELECCIONADOS</p>
        <h2 className="text-4xl md:text-[44px] font-bold tracking-tighter text-brand-dark mb-10 md:mb-20 border-b border-gray-300 pb-6 inline-block pr-6 md:pr-12">
          Lo más vendido
        </h2>

        <div className="flex flex-col gap-0 bg-[#f4f3ec] shadow-sm">
          {/* Info */}
          <div className="flex-1 p-7 sm:p-12 md:p-16 flex flex-col md:flex-row gap-8 md:gap-12 justify-between items-start">
            <div className="flex-1 flex flex-col justify-center">
              <h3 className="text-[28px] sm:text-[36px] md:text-[40px] font-bold leading-tight text-brand-dark mb-5">
                {mostSoldProduct.name.toUpperCase()}
              </h3>
              <p className="text-[13px] text-gray-600 leading-relaxed mb-8 max-w-sm">
                {mostSoldProduct.desc || 'Nuestro producto más popular, seleccionado cuidadosamente por nuestros expertos para ofrecerte la mejor calidad.'}
              </p>
              <button
                onClick={handleAddToCart}
                className="bg-[#0b2216] text-white text-[10px] font-bold tracking-[0.2em] uppercase px-8 py-5 self-start flex items-center hover:bg-[#123827] transition-colors cursor-pointer shadow-md w-full sm:w-auto justify-center sm:justify-start"
              >
                AÑADIR AL CARRITO <span className="ml-6 font-semibold opacity-90">${mostSoldProduct.price.toFixed(2)}</span>
              </button>
            </div>

            {/* Imagen producto */}
            <div className="w-full md:w-[360px] lg:w-[420px] aspect-square bg-[#e8e6e1] relative overflow-hidden shadow-inner flex-shrink-0">
              <img
                src={(mostSoldProduct.img && (mostSoldProduct.img.startsWith('http') || mostSoldProduct.img.startsWith('data:'))) ? mostSoldProduct.img : getCloudinaryUrl(mostSoldProduct.img)}
                alt={mostSoldProduct.name}
                className="w-full h-full object-cover"
              />
              {mostSoldProduct.sku && mostSoldProduct.sku.length < 20 && (
                <div className="absolute bottom-4 left-4 bg-[#fdfbf7]/90 px-4 py-2 shadow-sm">
                  <p className="text-[10px] font-bold text-[#c25e1a] tracking-[0.15em] uppercase">SKU: {mostSoldProduct.sku}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── SECCIÓN FILOSOFÍA ── */}
      <section className="py-16 md:py-32 px-5 md:px-16 lg:px-24 bg-[#f9f8f4] flex flex-col md:flex-row gap-10 md:gap-0">
        <div className="w-full md:w-1/3 relative mb-6 md:mb-0">
          <span className="absolute -left-2 -top-6 md:-left-8 md:-top-12 text-[100px] md:text-[200px] font-light text-brand-sidebar leading-none pointer-events-none select-none opacity-60 md:opacity-100">01</span>
          <h2 className="text-2xl md:text-[36px] font-medium leading-tight text-brand-dark relative z-10 pl-4 md:pl-8 pt-4 md:pt-8">
            Visita Nuestro Catalogo
          </h2>
        </div>
        <div className="w-full md:w-2/3 md:pl-12 lg:pl-24 md:border-l border-gray-200 py-4 md:py-6">
          <p className="text-base md:text-[22px] font-medium text-brand-dark mb-8 leading-relaxed max-w-xl">
            No vendemos productos agrícolas; seleccionamos momentos geológicos. Cada lote es un registro histórico de la lluvia, el suelo y la precisión biológica.
          </p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10 sm:gap-16">
            <div>
              <h4 className="text-[10px] font-bold text-orange-700 tracking-[0.2em] uppercase mb-4">ÉTICA</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.15em] leading-[1.8] max-w-[220px]">
                SIN ADITIVOS. SIN MEZCLAS.<br />PUREZA DE ORIGEN ÚNICO.
              </p>
            </div>
            <div>
              <Link
                to="/catalogo"
                className="bg-[#0b2216] text-white text-[10px] font-bold tracking-[0.2em] px-8 py-4 uppercase hover:bg-[#123827] transition-colors inline-block shadow-md"
              >
                IR AL CATÁLOGO
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
