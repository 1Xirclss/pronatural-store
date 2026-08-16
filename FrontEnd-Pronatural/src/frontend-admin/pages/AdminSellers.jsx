import { useState } from 'react';
import { useGlobalData } from '../../context/GlobalDataContext';
import { toast } from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber, formatElSalvadorPhone } from '../../utils/phoneFormatter';
import PhoneInputField from '../../components/common/PhoneInputField';

export default function AdminSellers() {
  const { users, addUser, updateUser, deleteUser } = useGlobalData();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      phone: '+503 ',
      role: 'Vendedor',
      password: '',
      salary: '',
      birthdate: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateUser(editingId, { id: editingId, ...data });
        toast.success('Empleado actualizado');
      } else {
        await addUser(data);
        toast.success('Empleado registrado');
      }
      resetForm();
    } catch (e) {
      toast.error('Error al guardar empleado');
    }
  };

  const resetForm = () => {
    reset({ name: '', lastName: '', email: '', phone: '+503 ', role: 'Vendedor', password: '', salary: '', birthdate: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (user) => {
    setValue('name', user.name);
    setValue('lastName', user.lastName);
    setValue('email', user.email);
    setValue('phone', formatElSalvadorPhone(user.phone));
    setValue('role', user.role);
    setValue('password', user.password);
    setValue('salary', user.salary);
    setValue('birthdate', user.birthdate ? user.birthdate.split('T')[0] : '');
    setEditingId(user.id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar a este empleado?')) {
      try {
        await deleteUser(id);
        toast.success('Empleado eliminado');
      } catch (e) {
        toast.error('Error al eliminar');
      }
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Gestión de Vendedores y Empleados</h1>
        <p className="text-gray-400 text-[14px] mt-1">Administra los accesos y datos del personal de tu tienda.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-8">
        <div className="bg-[#161b1e] border border-white/5 rounded-[14px] p-6 h-fit">
          <h2 className="text-white text-[16px] font-semibold mb-6">{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Nombre *</label>
                <input
                  type="text"
                  {...register("name", { required: "Requerido" })}
                  placeholder="Ej. Ana"
                  className={`w-full bg-[#0d1114] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Apellido *</label>
                <input
                  type="text"
                  {...register("lastName", { required: "Requerido" })}
                  placeholder="Ej. García"
                  className={`w-full bg-[#0d1114] border ${errors.lastName ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
              </div>
            </div>
            
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Correo Electrónico *</label>
              <input
                type="email"
                {...register("email", { 
                  required: "El correo es requerido",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Correo inválido" }
                })}
                placeholder="ana@pronatural.com"
                className={`w-full bg-[#0d1114] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`}
              />
              {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Contraseña *</label>
              <input
                type="text"
                {...register("password", { required: "Contraseña requerida" })}
                placeholder="********"
                className={`w-full bg-[#0d1114] border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors`}
              />
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Rol / Cargo</label>
                <select
                  {...register("role")}
                  className="w-full bg-[#0d1114] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                >
                  <option value="Vendedor">Vendedor</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Salario ($) *</label>
                <input
                  type="number"
                  {...register("salary", { required: "Requerido", min: 0 })}
                  placeholder="400"
                  className="w-full bg-[#0d1114] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-400 text-xs uppercase tracking-wider mb-1.5 block">Fecha de Nacimiento</label>
              <input
                type="date"
                {...register("birthdate")}
                className="w-full bg-[#0d1114] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#4ade80] transition-colors"
              />
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
          <h2 className="text-white text-[16px] font-semibold mb-6">Lista de Personal</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Nombre</th>
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Contacto</th>
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Rol</th>
                  <th className="pb-3 pr-4 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium">Salario</th>
                  <th className="pb-3 whitespace-nowrap text-[11px] uppercase tracking-wider text-gray-500 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users && users.length > 0 ? (
                  users.map(u => (
                    <tr key={u.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 pr-4 whitespace-nowrap text-[13px] text-white font-medium">{u.name} {u.lastName}</td>
                      <td className="py-4 pr-4 whitespace-nowrap text-[13px] text-gray-400">
                        <div>{u.email}</div>
                        <div className="text-[11px] text-gray-500">{u.phone}</div>
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 rounded-[4px] bg-white/5 text-gray-300 text-[11px] font-semibold">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-4 pr-4 whitespace-nowrap text-[13px] text-[#4ade80] font-bold">
                        ${u.salary}
                      </td>
                      <td className="py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(u)}
                            className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
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
                      No hay empleados registrados aún.
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
