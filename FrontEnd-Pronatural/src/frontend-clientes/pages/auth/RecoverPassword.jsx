import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';

export default function RecoverPassword() {
  const [step, setStep] = useState(1);
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm({ mode: 'onTouched' });
  const { recoverCustomerPassword } = useAuth();
  const navigate = useNavigate();

  const handleRequestCode = async (data) => {
    try {
      await recoverCustomerPassword(data);
      setStep(2);
    } catch (error) {
      // Error handled by AuthContext
    }
  };

  const handleVerifyCode = async (data) => {
    try {
      await api.verifyCustomerRecoveryCode(data.code);
      toast.success('Código verificado con éxito');
      setStep(3);
    } catch (error) {
      toast.error(error.message || 'Código inválido o expirado');
    }
  };

  const handleResetPassword = async (data) => {
    try {
      await api.updateCustomerPassword(data.newPassword, data.confirmNewPassword);
      toast.success('Contraseña actualizada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error al actualizar contraseña');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      <header className="py-6 px-10 border-b border-gray-100 flex items-center justify-between">
        <Link to="/" className="text-[22px] font-bold tracking-tighter text-brand-dark">
          PRONATURAL
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-8 bg-[#f9f8f4]">
        <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#f4f3ec]"></div>
          <div className="flex justify-center mb-6">
            <svg className="w-10 h-10 text-brand-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
              <rect x="10" y="10" width="4" height="6" rx="1"></rect>
              <path d="M12 10v-2a2 2 0 1 1 4 0"></path>
            </svg>
          </div>
          <h2 className="text-[28px] font-bold tracking-tighter text-center text-brand-dark mb-4">
            {step === 1 && "RECUPERAR CUENTA"}
            {step === 2 && "VERIFICAR CÓDIGO"}
            {step === 3 && "NUEVA CONTRASEÑA"}
          </h2>
          <p className="text-[13px] text-gray-600 text-center leading-relaxed mb-8 px-2">
            {step === 1 && "Ingrese su correo electrónico para recibir las instrucciones de recuperación de contraseña."}
            {step === 2 && "Hemos enviado un código a su correo. Por favor, ingréselo a continuación."}
            {step === 3 && "Ingrese su nueva contraseña para recuperar el acceso a su cuenta."}
          </p>

          {step === 1 && (
            <form onSubmit={handleSubmit(handleRequestCode)} className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold text-brand-dark tracking-[0.15em] uppercase mb-2">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  </div>
                  <input
                    type="email"
                    placeholder="usuario@pronatural.com"
                    {...register('email', { 
                      required: 'El correo es requerido', 
                      pattern: { value: /\S+@\S+\.\S+/, message: 'Formato inválido' },
                      onChange: (e) => e.target.value = e.target.value.toLowerCase()
                    })}
                    className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} pl-10 pr-4 py-3 text-[13px] focus:outline-none focus:border-brand-dark transition-colors lowercase`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-[10px] mt-1.5">{errors.email.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[#123827] transition-colors disabled:opacity-70 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
                <svg className="w-3 h-3 ml-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit(handleVerifyCode)} className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold text-brand-dark tracking-[0.15em] uppercase mb-2">Código de Verificación</label>
                <input
                  type="text"
                  placeholder="Código de 6 caracteres"
                  {...register('code', { required: 'El código es requerido' })}
                  className={`w-full bg-white border ${errors.code ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-[13px] text-center tracking-[0.2em] focus:outline-none focus:border-brand-dark transition-colors`}
                />
                {errors.code && <p className="text-red-500 text-[10px] mt-1.5">{errors.code.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[#123827] transition-colors disabled:opacity-70 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'Verificando...' : 'Verificar Código'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit(handleResetPassword)} className="space-y-6">
              <div>
                <label className="block text-[9px] font-bold text-brand-dark tracking-[0.15em] uppercase mb-2">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('newPassword', { 
                    required: 'La contraseña es requerida',
                    minLength: { value: 8, message: 'Mínimo 8 caracteres' }
                  })}
                  className={`w-full bg-white border ${errors.newPassword ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-[13px] focus:outline-none focus:border-brand-dark transition-colors`}
                />
                {errors.newPassword && <p className="text-red-500 text-[10px] mt-1.5">{errors.newPassword.message}</p>}
              </div>
              <div>
                <label className="block text-[9px] font-bold text-brand-dark tracking-[0.15em] uppercase mb-2">Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register('confirmNewPassword', { 
                    required: 'Debes confirmar la contraseña',
                    validate: val => val === watch('newPassword') || 'Las contraseñas no coinciden'
                  })}
                  className={`w-full bg-white border ${errors.confirmNewPassword ? 'border-red-500' : 'border-gray-200'} px-4 py-3 text-[13px] focus:outline-none focus:border-brand-dark transition-colors`}
                />
                {errors.confirmNewPassword && <p className="text-red-500 text-[10px] mt-1.5">{errors.confirmNewPassword.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[#123827] transition-colors disabled:opacity-70 flex items-center justify-center cursor-pointer"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Nueva Contraseña'}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-gray-100 text-center">
            <Link to="/" className="inline-flex items-center text-[10px] font-bold tracking-[0.1em] text-brand-dark hover:text-gray-600 uppercase">
              <svg className="w-3 h-3 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
              Volver al portal de acceso
            </Link>
          </div>
        </div>
      </main>
      <footer className="bg-[#0b2216] py-12 px-10 flex justify-between items-end">
        <div>
          <h2 className="text-white text-[22px] font-bold tracking-tighter mb-2">PRONATURAL</h2>
          <p className="text-[#a5b4ac] text-[8px] tracking-[0.15em] uppercase">
            © 2024 ARCHIVO TÉCNICO. TODOS LOS DERECHOS<br/>RESERVADOS.
          </p>
        </div>
        <div className="flex gap-8">
          <Link to="/" className="text-[#a5b4ac] text-[9px] tracking-widest font-semibold hover:text-white uppercase">Privacy</Link>
          <Link to="/" className="text-[#a5b4ac] text-[9px] tracking-widest font-semibold hover:text-white uppercase">Terms</Link>
          <Link to="/" className="text-[#a5b4ac] text-[9px] tracking-widest font-semibold hover:text-white uppercase">Shipping</Link>
        </div>
      </footer>
    </div>
  );
}
