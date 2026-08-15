import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';

export default function Contact() {
   const { register, handleSubmit, reset, formState: { errors } } = useForm();
   const [isSending, setIsSending] = useState(false);

   const onSubmit = async (data) => {
      const loadingToast = toast.loading('Enviando mensaje al administrador...');
      try {
         setIsSending(true);
         await api.sendContactMessage(data);
         toast.dismiss(loadingToast);
         toast.success('¡Mensaje enviado con éxito! El administrador se pondrá en contacto pronto.');
         reset();
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
            <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20 relative">
               <h1 className="text-5xl md:text-[72px] lg:text-[88px] font-bold tracking-tighter text-brand-dark mb-8 md:mb-12 leading-none">Contacto</h1>
               <p className="text-base md:text-[18px] text-brand-dark font-medium italic leading-[1.8] max-w-sm mb-16 md:mb-32 opacity-80">
                  Un canal directo para consultas técnicas, acuerdos de venta al por mayor y solicitudes de información de catálogo.
               </p>
            </div>
            <div className="w-full lg:w-[55%] bg-[#fcfbf8] border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20">
               <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                  <div>
                     <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Tu Nombre Completo</label>
                     <input type="text" placeholder="Ej: Juan Pérez" {...register('name', { required: 'Ingresa tu nombre completo' })} className="w-full border-b border-gray-200 py-3.5 text-[14px] bg-transparent focus:outline-none focus:border-[#123827] transition-colors" />
                     {errors.name && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.name.message}</span>}
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-1">Tu Correo Electrónico</label>
                     <p className="text-[10px] text-gray-400 mb-3">Escribe el correo donde deseas recibir la respuesta del administrador.</p>
                     <input type="email" placeholder="ejemplo: tu-correo@gmail.com" {...register('email', { required: 'Ingresa tu correo para poder responderte', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Formato de correo no válido' } })} className="w-full border-b border-gray-200 py-3.5 text-[14px] bg-transparent focus:outline-none focus:border-[#123827] transition-colors lowercase" />
                     {errors.email && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.email.message}</span>}
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Motivo de la Consulta</label>
                     <div className="relative">
                        <select {...register('category', { required: 'Selecciona un motivo' })} className="w-full border-b border-gray-200 py-3.5 text-[14px] text-brand-dark bg-transparent focus:outline-none focus:border-[#123827] uppercase transition-colors cursor-pointer appearance-none">
                           <option value="">Selecciona el motivo de tu mensaje...</option>
                           <option value="mayor">Ventas al por mayor / Distribuidores</option>
                           <option value="tecnicas">Consultas de productos y catálogo</option>
                           <option value="general">Consulta general / Soporte</option>
                        </select>
                        <svg className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"></path></svg>
                     </div>
                     {errors.category && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.category.message}</span>}
                  </div>
                  <div>
                     <label className="block text-[10px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Detalle de tu Mensaje</label>
                     <textarea rows="4" placeholder="Escribe aquí tu duda, consulta o requerimiento..." {...register('message', { required: 'Escribe tu mensaje' })} className="w-full border-b border-gray-200 py-3.5 text-[14px] bg-transparent focus:outline-none focus:border-[#123827] transition-colors resize-none"></textarea>
                     {errors.message && <span className="text-red-500 text-[10px] mt-1.5 block">{errors.message.message}</span>}
                  </div>
                  <div className="flex justify-end pt-6">
                     <button type="submit" disabled={isSending} className="bg-[#0a2016] text-white flex items-center px-8 py-5 hover:bg-[#123827] disabled:opacity-50 transition-colors group whitespace-nowrap cursor-pointer rounded">
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase mr-4">{isSending ? 'ENVIANDO...' : 'ENVIAR MENSAJE'}</span>
                        <svg className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
                      </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
