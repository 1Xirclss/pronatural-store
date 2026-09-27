import { motion, useReducedMotion } from 'framer-motion';

export default function LoadingScreen({ label = 'Cargando', fullScreen = false, className = '' }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center gap-5 ${fullScreen ? 'min-h-[55vh] w-full bg-brand-bg' : 'min-h-40 w-full'} ${className}`}
    >
      <div className="relative grid h-16 w-16 place-items-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full border border-[#30b466]/20" />
        <motion.span
          animate={shouldReduceMotion ? undefined : { rotate: 360 }}
          transition={{ duration: 1.25, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#30b466] border-r-[#75e29f]"
        />
        <span className="grid h-10 w-10 place-items-center rounded-full bg-[#0b2216] shadow-[0_5px_18px_rgba(11,34,22,0.18)]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 19c4.2-2.1 6.2-6.4 5.2-11.3C12.6 7.6 9.2 9.3 8 12.1c-.9 1.9-.4 4 1.1 5.2 1.1-2.3 2.8-4.2 5.1-5.7" stroke="#75e29f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 20c1.4-2.6 3.6-4.8 6.3-6.4" stroke="#30b466" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </span>
      </div>
      <span className="text-[10px] font-bold tracking-[0.2em] text-[#0b2216]/70 uppercase">{label}<span className="sr-only">, por favor espera</span></span>
    </div>
  );
}
