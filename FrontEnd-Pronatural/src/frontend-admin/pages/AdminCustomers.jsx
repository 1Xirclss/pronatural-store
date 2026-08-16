import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber, formatElSalvadorPhone } from '../../utils/phoneFormatter';
import PhoneInputField from '../../components/common/PhoneInputField';

export default function AdminCustomers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useGlobalData();
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
      toast.error('Error al procesar la solicitud');
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
  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de eliminar a este cliente?')) {
      deleteCustomer(id);
      toast.success('Cliente eliminado');
    }
  };
  return (
    <div className="max-w-[1100px] mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Gestión de Clientes</h1>
        <p className="text-gray-400 text-[14px] mt-1">Administra la base de datos de tus clientes y su información de contacto.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        <div className="bg-[#161b1e] border border-white/5 rounded-[14px] p-6 h-fit">
          <h2 className="text-white text-[16px] font-semibold mb-6">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Nombre *</label>
              <input
                type="text"
                {...register("name", { required: "El nombre es requerido" })}
                placeholder="Ej. Roberto"
                className={`w-full bg-[#0d1114] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`}
              />
              {errors.name && <p className="text-red-400 text-[11px] mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Apellido *</label>
              <input
                type="text"
                {...register("lastName", { required: "El apellido es requerido" })}
                placeholder="Ej. Sánchez"
                className={`w-full bg-[#0d1114] border ${errors.lastName ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`}
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
                className={`w-full bg-[#0d1114] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`}
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
                className="w-full bg-[#0d1114] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Estado</label>
              <select
                {...register("status")}
                className="w-full bg-[#0d1114] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
              >
                <option value="Active">Activo</option>
                <option value="Inactive">Inactivo (Baneado)</option>
              </select>
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] text-[13px] font-bold rounded-lg transition-colors cursor-pointer"
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
        <div className="bg-[#161b1e] border border-white/5 rounded-[14px] p-6 overflow-hidden flex flex-col">
          <h2 className="text-white text-[16px] font-semibold mb-6">Lista de Clientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Nombre</th>
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Apellido</th>
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Contacto</th>
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Nacimiento</th>
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Estado</th>
                  <th className="pb-3 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers && customers.length > 0 ? (
                  customers.map(c => (
                    <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-4 whitespace-nowrap text-[13px] text-white font-medium">{c.name}</td>
                      <td className="py-4 pr-4 whitespace-nowrap text-[13px] text-white font-medium">{c.lastName}</td>
                      <td className="py-4 pr-4 whitespace-nowrap text-[13px] text-gray-400">
                        <div>{c.email}</div>
                        <div className="text-[11px] text-gray-500">{c.phone}</div>
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap text-[12px] text-gray-400">
                        {c.birthdate ? c.birthdate.split('T')[0] : '-'}
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-[4px] text-[11px] font-semibold ${
                          c.status === 'Active' ? 'bg-[#1b4332]/50 text-[#4ade80]' : 'bg-red-950/50 text-red-400'
                        }`}>
                          {c.status === 'Active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(c)}
                            className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded transition-colors cursor-pointer"
                            title="Eliminar"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500 text-[13px]">
                      No hay clientes registrados aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
