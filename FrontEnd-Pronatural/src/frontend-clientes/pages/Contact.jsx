import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

export default function Contact() {
   const { user, isAuthenticated } = useAuth();
   const shouldReduceMotion = useReducedMotion();
   const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
   const [isSending, setIsSending] = useState(false);

   // Auto-completar nombre y correo si el usuario está autenticado
   useEffect(() => {
      if (user) {
         if (user.name) setValue('name', user.name);
         if (user.email) setValue('email', user.email);
      }
   }, [user, setValue]);

   const onSubmit = async (data) => {
      const loadingToast = toast.loading('Enviando mensaje a la administración...');
      try {
         setIsSending(true);
         const payload = {
            name: data.name?.trim() || user?.name || '',
            email: (isAuthenticated && user?.email) ? user.email.trim() : data.email?.trim(),
            category: data.category,
            message: data.message?.trim(),
         };

         await api.sendContactMessage(payload);
         toast.dismiss(loadingToast);
         toast.success('¡Mensaje enviado con éxito! Los administradores han recibido tu consulta.');
         reset({
            name: user?.name || '',
            email: user?.email || '',
            category: '',
            message: ''
         });
      } catch (err) {
         toast.dismiss(loadingToast);
         toast.error(err.message || 'Error al enviar el mensaje. Por favor intenta nuevamente.');
      } finally {
         setIsSending(false);
      }
   };

   return (
      <>
         <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex flex-col lg:flex-row">
            <motion.div initial={shouldReduceMotion ? false : { opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45 }} className="relative flex w-full flex-col justify-center overflow-hidden px-6 py-12 md:px-12 md:py-20 lg:w-[45%] lg:px-16 xl:px-24">
               <div className="pointer-events-none absolute -left-36 top-1/4 h-80 w-80 rounded-full border border-[#123827]/[0.06]" />
               <div className="pointer-events-none absolute -left-20 top-[30%] h-48 w-48 rounded-full border border-[#123827]/[0.06]" />
               <p className="relative mb-5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#b74b13]">Estamos para ayudarte</p>
               <h1 className="relative text-5xl font-bold tracking-tighter text-brand-dark sm:text-6xl md:text-[72px] lg:text-[78px] xl:text-[88px] leading-[0.94]">Contacto<span className="text-[#c05219]">.</span></h1>
               <p className="mt-8 text-base md:text-[18px] text-brand-dark font-medium italic leading-[1.8] max-w-sm mb-10 md:mb-14 opacity-80">
                  Un canal directo para consultas técnicas, acuerdos de venta al por mayor y solicitudes de información de catálogo.
               </p>

               <motion.div whileHover={shouldReduceMotion ? undefined : { y: -3 }} className="group max-w-sm rounded-2xl border border-[#123827]/15 bg-white/70 p-6 shadow-[0_16px_44px_rgba(10,32,22,0.06)] backdrop-blur-sm transition-shadow hover:shadow-[0_20px_50px_rgba(10,32,22,0.1)]">
                  <div className="flex items-center gap-3 mb-2">
                     <span className="relative flex h-3 w-3 items-center justify-center"><span className="absolute h-full w-full animate-ping rounded-full bg-emerald-500/40 motion-reduce:animate-none" /><span className="relative h-2.5 w-2.5 rounded-full bg-emerald-600" /></span>
                     <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark">Atención directa</h3>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">Tu mensaje será derivado a las bandejas de entrada de todos los administradores autorizados de ProNatural.</p>
                  <div className="mt-5 flex items-center gap-2 border-t border-[#123827]/10 pt-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#52675b]">
                     <svg className="h-4 w-4 text-[#b74b13]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="m4 7 8 6 8-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                     Respuesta por correo electrónico
                  </div>
               </motion.div>
            </motion.div>

            <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.08 }} className="flex w-full flex-col justify-center border-t border-gray-100 bg-[#fcfbf8] px-6 py-12 md:px-12 md:py-20 lg:w-[55%] lg:border-l lg:border-t-0 lg:px-16 xl:px-24">
               {!isAuthenticated && (
                  <div className="mb-8 flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 text-xs text-amber-900">
                     <span>¿Ya tienes cuenta? Inicia sesión para vincular tu correo automáticamente.</span>
                     <Link to="/login" className="ml-3 whitespace-nowrap font-bold underline hover:text-amber-950">Iniciar sesión</Link>
                  </div>
               )}
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 md:space-y-9">
                  <div>
                     <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">Tu nombre completo</label>
                     <input type="text" placeholder="Ej.: Juan Pérez" {...register('name', { required: 'Ingresa tu nombre completo', validate: value => value.trim().length >= 2 || 'Ingresa un nombre válido', maxLength: { value: 120, message: 'El nombre no puede superar 120 caracteres' } })} className="w-full border-b border-gray-300 bg-transparent py-3.5 text-[15px] transition-colors placeholder:text-gray-400 focus:border-[#123827] focus:outline-none" />
                     {errors.name && <span className="mt-1.5 block text-xs text-red-600">{errors.name.message}</span>}
                  </div>
                  <div>
                     <div className="mb-1 flex items-center justify-between">
                        <label className="block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">Tu correo electrónico</label>
                        {isAuthenticated && <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700"><svg className="h-3 w-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>Vinculado a tu sesión</span>}
                     </div>
                     <p className="mb-3 text-xs text-gray-500">{isAuthenticated ? 'Los administradores responderán directamente a este correo.' : 'Escribe el correo donde deseas recibir la respuesta del administrador.'}</p>
                     <input type="email" placeholder="ejemplo: tu-correo@gmail.com" readOnly={isAuthenticated && !!user?.email} {...register('email', { required: 'Ingresa tu correo para poder responderte', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Formato de correo no válido' } })} className={`w-full border-b border-gray-300 bg-transparent py-3.5 text-[15px] lowercase transition-colors placeholder:text-gray-400 focus:border-[#123827] focus:outline-none ${isAuthenticated && user?.email ? 'cursor-not-allowed bg-gray-50/60 font-medium text-gray-700' : ''}`} />
                     {errors.email && <span className="mt-1.5 block text-xs text-red-600">{errors.email.message}</span>}
                  </div>
                  <div>
                     <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">Motivo de la consulta</label>
                     <div className="relative">
                        <select {...register('category', { required: 'Selecciona un motivo' })} className="w-full appearance-none border-b border-gray-300 bg-transparent py-3.5 pr-8 text-[15px] text-brand-dark transition-colors focus:border-[#123827] focus:outline-none">
                           <option value="">Selecciona el motivo de tu mensaje...</option>
                           <option value="mayor">Ventas al por mayor / Distribuidores</option>
                           <option value="tecnicas">Consultas de productos y catálogo</option>
                           <option value="general">Consulta general / Soporte</option>
                        </select>
                        <svg className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
                     </div>
                     {errors.category && <span className="mt-1.5 block text-xs text-red-600">{errors.category.message}</span>}
                  </div>
                  <div>
                     <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.15em] text-gray-600">Detalle de tu mensaje</label>
                     <textarea rows="4" placeholder="Escribe aquí tu duda, consulta o requerimiento..." {...register('message', { required: 'Escribe tu mensaje', validate: value => value.trim().length >= 5 || 'El mensaje debe tener al menos 5 caracteres', maxLength: { value: 5000, message: 'El mensaje no puede superar 5000 caracteres' } })} className="w-full resize-none border-b border-gray-300 bg-transparent py-3.5 text-[15px] transition-colors placeholder:text-gray-400 focus:border-[#123827] focus:outline-none"></textarea>
                     {errors.message && <span className="mt-1.5 block text-xs text-red-600">{errors.message.message}</span>}
                  </div>
                  <div className="flex justify-end pt-2">
                     <motion.button whileHover={shouldReduceMotion ? undefined : { y: -2 }} whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }} type="submit" disabled={isSending} className="group flex min-h-14 items-center rounded-lg bg-[#0a2016] px-7 text-white shadow-[0_12px_28px_rgba(10,32,22,0.16)] transition-colors hover:bg-[#123827] disabled:cursor-wait disabled:opacity-60 whitespace-nowrap">
                        <span className="mr-4 text-xs font-bold uppercase tracking-[0.16em]">{isSending ? 'Enviando...' : 'Enviar mensaje'}</span>
                        <svg className="h-4 w-4 transform transition-transform group-hover:translate-x-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                     </motion.button>
                  </div>
               </form>
            </motion.div>
         </div>
      </>
   );
}
