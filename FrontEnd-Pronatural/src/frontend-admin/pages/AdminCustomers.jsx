import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber, formatElSalvadorPhone } from '../../utils/phoneFormatter';
import PhoneInputField from '../../components/common/PhoneInputField';
import { motion, useReducedMotion } from 'framer-motion';

export default function AdminCustomers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useGlobalData();
  const shouldReduceMotion = useReducedMotion();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '',
      birthdate: '',
      status: 'Active'
    }
  });
  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateCustomer(editingId, { id: editingId, ...data });
        toast.success('Cliente actualizado');
      } else {
        await addCustomer(data);
        toast.success('Cliente registrado');
      }
      resetForm();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el cliente. Inténtalo de nuevo.');
    }
  };
  const resetForm = () => {
    reset({ name: '', lastName: '', email: '', phone: '+503 ', birthdate: '', status: 'Active' });
    setIsEditing(false);
    setEditingId(null);
  };
  const handleEdit = (customer) => {
    setValue('name', customer.name);
    setValue('lastName', customer.lastName || '');
    setValue('email', customer.email);
    setValue('phone', formatElSalvadorPhone(customer.phone));
    setValue('birthdate', customer.birthdate ? customer.birthdate.split('T')[0] : '');
    setValue('status', customer.status || 'Active');
    setEditingId(customer.id);
    setIsEditing(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar a este cliente?')) {
      try {
        await deleteCustomer(id);
        toast.success('Cliente eliminado');
      } catch (error) {
        toast.error(error.message || 'No se pudo eliminar el cliente. Inténtalo de nuevo.');
      }
    }
  };
  return (
    <div className="mx-auto max-w-[1440px] pb-12">
      <div className="mb-7 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#161d1c] via-[#14191b] to-[#111719] px-6 py-6 shadow-[0_18px_50px_-38px_rgba(48,180,102,0.35)] sm:px-8">
        <p className="mb-2 text-[10px] font-bold tracking-[0.2em] text-[#4ade80] uppercase">Relaci&oacute;n con clientes</p>
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-white sm:text-[32px]">Gesti&oacute;n de clientes</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-gray-400">Administra la base de datos de tus clientes y su informaci&oacute;n de contacto.</p>
      </div>
      <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(310px,0.78fr)_minmax(0,1.55fr)]">
        <div className="h-fit rounded-2xl border border-white/[0.07] bg-[#161b1e] p-5 shadow-[0_20px_55px_-45px_rgba(0,0,0,0.8)] sm:p-6">
          <div className="mb-6"><p className="mb-1 text-[9px] font-bold tracking-[0.17em] text-[#4ade80] uppercase">{isEditing ? 'Actualizar ficha' : 'Nuevo registro'}</p><h2 className="text-white text-[16px] font-semibold">{isEditing ? 'Editar cliente' : 'Nuevo cliente'}</h2></div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Nombre *</label>
              <input
                type="text"
                {...register("name", { required: "El nombre es requerido", validate: value => value.trim().length >= 2 || "Ingresa un nombre válido" })}
                placeholder="Ej. Roberto"
                className={`w-full bg-[#0d1114] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15`}
              />
              {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Apellido *</label>
              <input
                type="text"
                {...register("lastName", { required: "El apellido es requerido", validate: value => value.trim().length >= 2 || "Ingresa un apellido válido" })}
                placeholder="Ej. Sánchez"
                className={`w-full bg-[#0d1114] border ${errors.lastName ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15`}
              />
              {errors.lastName && <p className="text-red-400 text-[11px] mt-1">{errors.lastName.message}</p>}
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Correo Electrónico *</label>
              <input
                type="email"
                {...register("email", { 
                  required: "El correo es requerido",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Correo inválido" }
                })}
                placeholder="roberto@ejemplo.com"
                className={`w-full bg-[#0d1114] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15`}
              />
              {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Teléfono</label>
              <Controller
                name="phone"
                control={control}
                rules={{
                  validate: (val) => !val || val === '+503 ' || isValidPhoneNumber(val) || "El teléfono debe tener 8 dígitos (ej: +503 7000-0000)"
                }}
                render={({ field }) => (
                  <PhoneInputField
                    value={field.value || ''}
                    onChange={field.onChange}
                    error={errors.phone?.message}
                    darkTheme={true}
                  />
                )}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Fecha de Nacimiento</label>
              <input
                type="date"
                {...register("birthdate")}
                className="w-full bg-[#0d1114] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Estado</label>
              <select
                {...register("status")}
                className="w-full bg-[#0d1114] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition-all focus:border-[#4ade80] focus:ring-2 focus:ring-[#4ade80]/15"
              >
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo (Baneado)</option>
              </select>
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="min-h-11 flex-1 rounded-xl bg-[#30b466] py-2.5 text-[13px] font-bold text-[#0a110d] shadow-[0_6px_18px_-10px_rgba(48,180,102,0.7)] transition-colors hover:bg-[#42c477] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#75e29f] cursor-pointer"
              >
                {isEditing ? 'Guardar Cambios' : 'Registrar'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="py-2.5 px-4 bg-transparent border border-white/10 text-gray-300 text-[13px] font-medium rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/[0.07] bg-[#161b1e] p-5 shadow-[0_20px_55px_-45px_rgba(0,0,0,0.8)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-3"><div><p className="mb-1 text-[9px] font-bold tracking-[0.17em] text-gray-500 uppercase">Directorio</p><h2 className="text-white text-[16px] font-semibold">Lista de clientes</h2></div><span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-semibold text-gray-300">{customers?.length || 0} registros</span></div>
          <div className="space-y-3">
            {customers && customers.length > 0 ? customers.map((c, index) => (
              <motion.article key={c.id} initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: shouldReduceMotion ? 0 : 0.24, delay: shouldReduceMotion ? 0 : Math.min(index * 0.035, 0.14) }} className="rounded-xl border border-white/[0.07] bg-[#111719] p-4 transition-colors hover:border-[#4ade80]/20 sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="break-words text-[14px] font-semibold text-white">{c.name} {c.lastName}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${c.status === 'Active' ? 'border border-[#4ade80]/15 bg-[#1b4332]/40 text-[#75e29f]' : 'border border-red-400/15 bg-red-500/[0.08] text-red-300'}`}>{c.status === 'Active' ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <a href={`mailto:${c.email}`} className="block break-all text-[12px] text-gray-300 transition-colors hover:text-[#75e29f]">{c.email}</a>
                    {c.phone && <a href={`tel:${String(c.phone).replace(/[^\d+]/g, '')}`} className="mt-1 block text-[11px] text-gray-500 transition-colors hover:text-gray-300">{c.phone}</a>}
                  </div>
                  <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] pt-3 sm:min-w-[180px] sm:justify-end sm:border-0 sm:pt-0">
                    <div className="sm:text-right"><p className="text-[9px] font-bold tracking-[0.14em] text-gray-500 uppercase">Fecha de nacimiento</p><p className="mt-1 text-[11px] text-gray-300">{c.birthdate ? c.birthdate.split('T')[0] : 'No registrada'}</p></div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(c)} className="grid h-10 w-10 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-gray-300 transition-colors hover:border-[#4ade80]/30 hover:bg-[#1b4332]/40 hover:text-[#75e29f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#4ade80]" aria-label={`Editar a ${c.name} ${c.lastName}`} title="Editar"><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
                      <button type="button" onClick={() => handleDelete(c.id)} className="grid h-10 w-10 place-items-center rounded-lg border border-red-400/10 bg-red-500/[0.06] text-red-300 transition-colors hover:bg-red-500/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400" aria-label={`Eliminar a ${c.name} ${c.lastName}`} title="Eliminar"><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M19 6l-1 14H6L5 6m3 0V4h8v2m-7 4v7m4-7v7"/></svg></button>
                    </div>
                  </div>
                </div>
              </motion.article>
            )) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#111719]/70 px-6 text-center">
                <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white/[0.04] text-gray-500" aria-hidden="true"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 10v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span>
                <p className="text-[13px] font-medium text-gray-300">A&uacute;n no hay clientes registrados</p>
                <p className="mt-1 text-[11px] text-gray-500">Los nuevos clientes aparecer&aacute;n en esta lista.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
