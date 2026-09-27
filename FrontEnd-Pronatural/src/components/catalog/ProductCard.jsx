// Tarjeta de producto para el catÃ¡logo pÃºblico
import { Link, useNavigate } from 'react-router-dom';
import { getCloudinaryUrl } from '../../utils/cloudinary';
import { useCart } from '../../hooks/useCart';
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function ProductCard({ id, image, title, price, tag, tagColor, stock, index = 0 }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isGlareVisible, setIsGlareVisible] = useState(false);

  const handlePointerMove = (event) => {
    if (shouldReduceMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setGlarePosition({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  const handleAddToCart = () => {
    addItem({ id, _id: id, name: title, title, price, img: image, image, stock });
    navigate('/carrito');
  };

  return (
    <motion.article
      initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.42,
        delay: shouldReduceMotion ? 0 : Math.min(index * 0.035, 0.14),
        ease: [0.22, 1, 0.36, 1],
      }}
      onPointerEnter={(event) => { if (!shouldReduceMotion && event.pointerType !== 'touch') setIsGlareVisible(true); }}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setIsGlareVisible(false)}
      className="group flex h-full flex-col transition-transform duration-300 hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <Link
        to={`/producto/${id}`}
        className="flex flex-1 flex-col cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0b2216]"
      >
        <div className="relative mb-3 w-full overflow-hidden rounded-[24px] bg-[#e5e5e5] shadow-sm sm:rounded-[28px]" style={{ paddingBottom: '125%' }}>
          <img
            src={getCloudinaryUrl(image)}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover grayscale transition-all duration-500 ease-out group-hover:scale-[1.03] group-hover:grayscale-0 motion-reduce:transform-none motion-reduce:transition-none"
          />
          <motion.div
            aria-hidden="true"
            animate={{ opacity: isGlareVisible && !shouldReduceMotion ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-none absolute inset-0 z-[1] hidden md:block"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.34), rgba(255,255,255,0.12) 12%, transparent 42%)`,
              mixBlendMode: 'screen',
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-active:opacity-100 md:hidden motion-reduce:transition-none" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] border border-white/0 transition-colors duration-300 group-hover:border-white/20" />
          {tag && (
            <div className="absolute top-2 right-2 left-2 flex justify-end">
              <span className={`text-[8px] font-bold tracking-[0.15em] px-2 py-1 uppercase leading-none shadow-sm ${tagColor || 'bg-brand-dark text-white'}`}>
                {tag}
              </span>
            </div>
          )}
        </div>

        <h3 className="text-[14px] sm:text-[15px] font-bold leading-tight mb-2 text-brand-dark line-clamp-2 group-hover:text-[#1b4332] transition-colors">
          {title}
        </h3>
        <span className="text-[14px] font-bold text-brand-dark mt-auto pt-1">${(Number(price) || 0).toFixed(2)}</span>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={stock === 0}
        className={`mt-2 min-h-11 w-full border py-3 text-[10px] font-bold tracking-[0.12em] uppercase transition-colors duration-200 active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2216] ${
          stock === 0
            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-[#0b2216] text-[#0b2216] hover:bg-[#0b2216] hover:text-white cursor-pointer shadow-sm'
        }`}
      >
        {stock === 0 ? 'AGOTADO' : 'AGREGAR AL CARRITO'}
      </button>
    </motion.article>
  );
}
