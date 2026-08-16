import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ADMIN_PREFIX } from '../../../config';
import { api } from '../../../utils/api';
import { isValidPhoneNumber } from '../../../utils/phoneFormatter';
import PhoneInputField from '../../../components/common/PhoneInputField';

export default function AdminRegister() {
  const { register, handleSubmit, watch, control, formState: { errors } } = useForm({ mode: 'onTouched' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = form, 2 = otp
  const [otpCode, setOtpCode] = useState('');
  
  const navigate = useNavigate();
  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Usar api directamente para no entrar al contexto hasta verificar
      await api.register({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password
      });
      toast.success('Código de verificación enviado al correo');
      setStep(2);
    } catch (error) {
      toast.error(error.message || 'Error al solicitar registro');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    if (!otpCode) return toast.error('Ingresa el código');
    setLoading(true);
    try {
      await api.verifyCodeEmail(otpCode);
      toast.success('Cuenta creada y verificada. Ya puedes iniciar sesión.');
      navigate(`${ADMIN_PREFIX}/login`);
    } catch (error) {
      toast.error(error.message || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0d0f] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#30b466]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#1b4332]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="w-full max-w-[480px] relative z-10 my-8">
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-12 h-12 bg-[#161b1e] border border-white/5 rounded-[12px] flex items-center justify-center mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="#75e29f" />
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3L12 21Z" fill="#30b466" />
            </svg>
          </div>
          <h1 className="text-[20px] font-bold text-white tracking-tight">Solicitar Acceso</h1>
          <p className="text-gray-400 text-[13px] mt-1">Crea una cuenta para el portal administrativo</p>
        </div>
        <div className="bg-[#121619] border border-white/10 rounded-[16px] p-8 shadow-2xl backdrop-blur-xl">
          
          {step === 1 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Nombre</label>
                  <input
                    type="text"
                    placeholder="Carlos"
                    {...register("firstName", { required: "Requerido" })}
                    className={`w-full bg-[#0d1114] border ${errors.firstName ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                  />
                  {errors.firstName && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Apellido</label>
                  <input
                    type="text"
                    placeholder="Gómez"
                    {...register("lastName", { required: "Requerido" })}
                    className={`w-full bg-[#0d1114] border ${errors.lastName ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                  />
                  {errors.lastName && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@pronatural.com"
                  {...register("email", { 
                    required: "El correo es obligatorio",
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Correo inválido" }
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.email ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.email && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.email.message}</p>}
              </div>
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Número de Teléfono</label>
                <Controller
                  name="phone"
                  control={control}
                  rules={{
                    required: 'El teléfono es requerido',
                    validate: (val) => isValidPhoneNumber(val) || 'El teléfono debe tener 8 dígitos (ej: +503 7000-0000)'
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
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", { 
                      required: "Requerido",
                      minLength: { value: 8, message: "Mínimo 8 caracteres" },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                        message: "Debe incluir mayúscula, minúscula, número y símbolo especial"
                      }
                    })}
                    className={`w-full bg-[#0d1114] border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] pl-4 pr-12 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-[11px] mt-1.5 font-medium leading-tight">{errors.password.message}</p>}
              </div>
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Confirmar Contraseña</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("confirmPassword", { 
                    required: "Requerido",
                    validate: value => value === passwordValue || "Las contraseñas no coinciden"
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.confirmPassword && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.confirmPassword.message}</p>}
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-6 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a110d] text-[14px] font-bold rounded-[10px] transition-all shadow-[0_0_15px_rgba(48,180,102,0.2)]"
              >
                {loading ? 'Enviando código...' : 'Crear Cuenta'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={verifyOTP} className="space-y-5">
              <div className="text-center mb-6">
                <p className="text-white text-[14px]">Revisa tu correo electrónico</p>
                <p className="text-gray-400 text-[12px] mt-1">Ingresa el código de 6 caracteres que te enviamos.</p>
              </div>
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Código de Verificación</label>
                <input
                  type="text"
                  placeholder="Ej: a1b2c3"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-[#0d1114] border border-white/10 rounded-[10px] px-4 py-3 text-[14px] text-center tracking-[0.5em] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors"
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-6 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a110d] text-[14px] font-bold rounded-[10px] transition-all shadow-[0_0_15px_rgba(48,180,102,0.2)]"
              >
                {loading ? 'Verificando...' : 'Verificar y Completar'}
              </button>
              <button 
                type="button"
                onClick={() => setStep(1)}
                className="w-full py-3 bg-transparent text-gray-400 hover:text-white text-[13px] font-medium transition-colors"
              >
                Volver
              </button>
            </form>
          )}
        </div>
        <p className="text-center text-gray-500 text-[12px] mt-6">
          ¿Ya tienes cuenta? <Link to={`${ADMIN_PREFIX}/login`} className="text-white hover:text-[#4ade80] font-medium transition-colors">Iniciar Sesión</Link>
        </p>
      </div>
    </div>
  );
}
