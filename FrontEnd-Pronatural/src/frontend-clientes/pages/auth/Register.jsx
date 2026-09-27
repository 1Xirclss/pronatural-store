import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../utils/api';
import AuthLayout from '../../../components/layout/AuthLayout';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { isValidPhoneNumber } from '../../../utils/phoneFormatter';
import PhoneInputField from '../../../components/common/PhoneInputField';
import { motion, useReducedMotion } from 'framer-motion';

export default function Register() {
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm();
  const { registerCustomer } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const password = watch('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const onSubmit = async (data) => {
    try {
      const success = await registerCustomer(data);
      if (success) {
        setShowVerifyModal(true);
      } else {
        toast.error('Error al registrar la cuenta');
      }
    } catch (error) {
      toast.error(error.message || 'Error inesperado durante el registro');
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verificationCode) return toast.error('Ingresa el código');
    setIsVerifying(true);
    try {
      await api.verifyCustomerCodeEmail(verificationCode);
      toast.success('Cuenta verificada exitosamente');
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Error al verificar');
    } finally {
      setIsVerifying(false);
    }
  };

  const leftPanel = (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#082214] p-7 sm:p-10 lg:p-12 xl:p-14">
      <img src="/images/registro-botanico.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#06170e]/70 via-[#06170e]/20 to-[#06170e]/85" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#06170e]/65 via-transparent to-[#06170e]/10" />
      <motion.div aria-hidden="true" animate={shouldReduceMotion ? undefined : { opacity: [0.18, 0.3, 0.18] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#30b466]/25 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-24 h-[440px] w-[440px] rounded-full border border-white/[0.16]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-14 -right-10 h-[320px] w-[320px] rounded-full border border-white/[0.12]" />

      <div className="relative z-10 flex items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-tighter text-white drop-shadow-md">PRONATURAL</h1>
        <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#a5f3c4] backdrop-blur-md">Origen natural</span>
      </div>

      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="relative z-10 mt-auto max-w-xl pb-8 pt-20 lg:pb-12">
        <span className="mb-4 inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-[#83e6a8]">Salud y bienestar</span>
        <h2 className="max-w-lg text-4xl font-bold leading-[1.04] tracking-tight text-white drop-shadow-lg lg:text-5xl">Naturalmente cerca de ti.</h2>
        <p className="mt-4 max-w-md text-sm leading-6 text-white/85 drop-shadow-md">Crea tu cuenta para descubrir productos seleccionados y consultar tus pedidos en un solo lugar.</p>
        <div className="mt-7 flex items-center gap-3 text-xs font-semibold text-white/90">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-black/20 text-[#a5f3c4] backdrop-blur-md" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-4.4-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.6-7 11-7 11Z" strokeLinejoin="round"/><path d="M9 12h6m-3-3v6" strokeLinecap="round"/></svg></span>
          <span>Ingredientes naturales seleccionados</span>
        </div>
      </motion.div>

      <div className="relative z-10 flex items-center justify-between gap-4 border-t border-white/20 pt-4 text-[10px] text-white/65">
        <p className="tracking-wider">© ProNatural Store</p>
        <p className="text-right font-medium tracking-wider text-[#a5f3c4]">Cuidando tu salud naturalmente</p>
      </div>
    </div>
  );  return (
    <AuthLayout leftPanel={leftPanel}>
      <div className="mb-10">
        <p className="text-[10px] font-bold text-[#30b466] tracking-widest uppercase mb-2">Registro de Cliente</p>
        <h2 className="text-[36px] font-bold leading-none tracking-tighter text-brand-dark mb-3">CREAR CUENTA</h2>
        <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-sm">
          Completa tus datos para registrarte en ProNatural.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Nombre Completo</label>
          <input
            type="text"
            placeholder="ALEXANDER VANCE"
            {...register('name', { 
              required: 'El nombre es requerido',
              minLength: { value: 3, message: 'El nombre debe tener al menos 3 caracteres' },
              pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras y espacios' }
            })}
            className={`w-full bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors uppercase`}
          />
          {errors.name && <p className="text-red-500 text-[10px] mt-1.5">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Identificador de Correo Electrónico</label>
          <input
            type="email"
            placeholder="curator@archive.com"
            {...register('email', { 
              required: 'El correo es requerido', 
              pattern: { 
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message: 'El formato de correo no es válido' 
              },
              onChange: (e) => e.target.value = e.target.value.toLowerCase()
            })}
            className={`w-full bg-transparent border-b ${errors.email ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors lowercase`}
          />
          {errors.email && <p className="text-red-500 text-[10px] mt-1.5">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Número de Teléfono</label>
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
                darkTheme={false}
              />
            )}
          />
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Contraseña Encriptada</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="•••••••••••••"
              {...register('password', { 
                required: 'La contraseña es requerida', 
                minLength: { value: 8, message: 'Debe tener al menos 8 caracteres' },
                pattern: { 
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/, 
                  message: 'Debe incluir mayúscula, minúscula y número' 
                }
              })}
              className={`w-full bg-transparent border-b ${errors.password ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors pr-10`}
            />
            <button 
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark p-2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-[10px] mt-1.5">{errors.password.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Confirmar Contraseña</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="•••••••••••••"
              {...register('confirmPassword', { 
                required: 'Confirma tu contraseña',
                validate: value => value === password || 'Las contraseñas no coinciden'
              })}
              className={`w-full bg-transparent border-b ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200'} py-2 text-[13px] focus:outline-none focus:border-brand-dark transition-colors pr-10`}
            />
            <button 
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark p-2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-500 text-[10px] mt-1.5">{errors.confirmPassword.message}</p>}
        </div>
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[#123827] transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? 'Registrando...' : 'Registrar Cuenta'}
          </button>
        </div>
        <div className="text-center pt-8 border-t border-gray-100 mt-8 relative flex flex-col items-center gap-3">
          <span className="bg-brand-bg px-4 text-[9px] tracking-widest text-gray-300 absolute -top-[7px] left-1/2 -translate-x-1/2 uppercase">¿Ya registrado?</span>
          <Link to="/login" className="inline-block mt-3 text-[10px] font-bold tracking-[0.15em] text-brand-dark hover:text-gray-600 uppercase">
            Acceder a perfil existente
          </Link>
          <div className="w-12 h-[1px] bg-gray-200 my-1"></div>
          <Link to="/" className="inline-block text-[10px] font-bold tracking-[0.15em] text-[#30b466] hover:text-[#1b4332] uppercase transition-colors">
            Continuar como invitado →
          </Link>
        </div>
      </form>
      <div className="mt-10 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400 leading-normal">
          Al registrarte aceptas las políticas de privacidad y condiciones de uso de ProNatural.
        </p>
      </div>
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-brand-bg p-8 max-w-md w-full border border-gray-200">
            <h3 className="text-xl font-bold text-brand-dark mb-4">Verificar Cuenta</h3>
            <p className="text-sm text-gray-500 mb-6">Hemos enviado un código a tu correo.</p>
            <form onSubmit={handleVerify}>
              <input
                type="text"
                placeholder="Código de verificación"
                className="w-full bg-transparent border-b border-gray-200 py-2 mb-6 focus:outline-none focus:border-brand-dark text-center tracking-[0.5em]"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <button 
                type="submit" 
                disabled={isVerifying}
                className="w-full bg-[#0a2016] text-white py-3 text-xs font-bold tracking-[0.2em] uppercase disabled:opacity-50"
              >
                {isVerifying ? 'Verificando...' : 'Verificar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
