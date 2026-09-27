import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useGlobalData } from '../../context/GlobalDataContext';
export default function Reviews() {
   const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
   const { reviews, addReview } = useGlobalData();
   const onSubmit = async (data) => {
      try {
         await addReview({
            name: data.name.trim(),
            rating: Number(data.rating),
            comment: data.comment.trim(),
            date: new Date().toISOString().split('T')[0]
         });
         toast.success('¡Gracias por tu reseña!');
         reset();
      } catch (error) {
         toast.error(error.message || 'No se pudo publicar la reseña. Inténtalo de nuevo.');
      }
   };
   return (
      <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex flex-col lg:flex-row">
         <div className="w-full lg:w-[45%] flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20 relative">
            <h1 className="text-5xl md:text-[72px] lg:text-[88px] font-bold tracking-tighter text-brand-dark mb-8 md:mb-12 leading-none">Reseñas</h1>
            <p className="text-base md:text-[18px] text-brand-dark font-medium italic leading-[1.8] max-w-sm mb-12 opacity-80">
               Tu opinión es valiosa para nosotros. Comparte tu experiencia con los productos de ProNatural Store.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 mt-4">
               <div>
                  <label className="block text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">NOMBRE COMPLETO</label>
                  <input type="text" placeholder="Tu nombre" {...register('name', { required: 'Ingresa tu nombre', validate: value => !!value.trim() || 'El nombre no puede quedar vacío' })} className="w-full border-b border-gray-200 py-3 text-[13px] bg-transparent focus:outline-none focus:border-brand-dark transition-colors" />
                  {errors.name && <span className="text-red-500 text-[10px] mt-1 block">{errors.name.message}</span>}
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">CALIFICACIÓN (1-5)</label>
                  <select {...register('rating', { required: 'Requerido' })} className="w-full border-b border-gray-200 py-3 text-[13px] bg-transparent focus:outline-none focus:border-brand-dark transition-colors cursor-pointer">
                     <option value="5">5 Estrellas - Excelente</option>
                     <option value="4">4 Estrellas - Muy Bueno</option>
                     <option value="3">3 Estrellas - Bueno</option>
                     <option value="2">2 Estrellas - Regular</option>
                     <option value="1">1 Estrella - Malo</option>
                  </select>
               </div>
               <div>
                  <label className="block text-[9px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4">COMENTARIO</label>
                  <textarea rows="3" placeholder="Escribe tu reseña aquí..." {...register('comment', { required: 'Escribe tu comentario', validate: value => value.trim().length >= 3 || 'El comentario debe tener al menos 3 caracteres' })} className="w-full border-b border-gray-200 py-3 text-[13px] bg-transparent focus:outline-none focus:border-brand-dark transition-colors resize-none"></textarea>
                  {errors.comment && <span className="text-red-500 text-[10px] mt-1 block">{errors.comment.message}</span>}
               </div>
               <button type="submit" disabled={isSubmitting} className="bg-[#0a2016] text-white flex items-center px-8 py-5 hover:bg-[#123827] transition-colors group cursor-pointer disabled:cursor-wait disabled:opacity-60">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase mr-4">PUBLICAR RESEÑA</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
               </button>
            </form>
         </div>
         <div className="w-full lg:w-[55%] bg-[#fcfbf8] border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col px-6 md:px-12 lg:px-24 xl:px-32 py-12 md:py-20 h-[calc(100vh-80px)] overflow-y-auto">
            <h2 className="text-[12px] font-bold tracking-[0.2em] text-[#0b2216] uppercase mb-12 border-b pb-4">Comentarios Recientes</h2>
            {reviews.length === 0 ? (
               <p className="text-gray-400 text-sm italic">Aún no hay reseñas. ¡Sé el primero en comentar!</p>
            ) : (
               <div className="space-y-8">
                  {reviews.map(review => (
                     <div key={review._id || review.id} className="bg-white p-8 shadow-sm border border-gray-100 relative">
                        <div className="flex justify-between items-start mb-4">
                           <div>
                              <h3 className="text-[14px] font-bold text-brand-dark">{review.name}</h3>
                              <p className="text-[9px] text-gray-400 font-mono tracking-widest">{review.date}</p>
                           </div>
                           <div className="flex gap-1">
                              {[...Array(5)].map((_, index) => (
                                 <svg key={index} className={`w-4 h-4 ${index < review.rating ? 'text-yellow-500' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                 </svg>
                              ))}
                           </div>
                        </div>
                        <p className="text-[13px] text-gray-600 leading-relaxed italic">"{review.comment}"</p>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
