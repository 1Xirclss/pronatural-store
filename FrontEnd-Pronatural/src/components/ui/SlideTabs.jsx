import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function SlideTabs({ items, selected, onSelect, ariaLabel }) {
  const [hovered, setHovered] = useState(null);
  const shouldReduceMotion = useReducedMotion();
  const highlighted = hovered ?? selected;

  const clearFocusHighlight = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHovered(null);
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      onMouseLeave={() => setHovered(null)}
      onBlurCapture={clearFocusHighlight}
      className="relative flex w-max shrink-0 items-center gap-2"
    >
      {items.map((item) => {
        const isSelected = item === selected;
        const isHighlighted = item === highlighted;

        return (
          <button
            key={item}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(item)}
            onMouseEnter={() => setHovered(item)}
            onFocus={() => setHovered(item)}
            className={`relative min-h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-4 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors duration-200 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0a2016] ${
              isHighlighted
                ? 'border-transparent bg-transparent text-white'
                : 'border-gray-200/80 bg-white text-gray-600 hover:text-brand-dark'
            }`}
          >
            {isHighlighted && (
              <motion.span
                aria-hidden="true"
                layoutId="catalog-category-highlight"
                initial={false}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 38 }}
                className="pointer-events-none absolute inset-0 z-0 rounded-full bg-[#0a2016] shadow-md shadow-[#0a2016]/20"
              />
            )}
            <span className="relative z-10">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
