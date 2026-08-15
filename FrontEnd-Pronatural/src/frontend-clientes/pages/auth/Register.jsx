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

export default function Register() {
  const { register, handleSubmit, watch, control, formState: { errors, isSubmitting } } = useForm();
  const { registerCustomer } = useAuth();
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
    <div className="absolute inset-0 bg-[#082214] flex flex-col justify-between p-10 lg:p-14 overflow-hidden select-none">
      {/* Esferas de luz animadas sutiles en el fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#30b466]/15 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#1b4332]/30 rounded-full blur-[120px] animate-pulse duration-1000"></div>

      {/* Header Logo */}
      <div className="relative z-10">
        <h1 className="text-white text-[22px] font-bold tracking-tighter">PRONATURAL</h1>
      </div>

      {/* Hero content elegante y limpio */}
      <div className="relative z-10 max-w-lg my-auto">
        <span className="inline-block text-[#4ade80] text-[10px] font-bold tracking-[0.25em] uppercase mb-4">
          Salud y Bienestar Orgánico
        </span>

        <h2 className="text-white text-[38px] lg:text-[44px] font-bold leading-[1.08] tracking-tighter mb-4">
          Descubre el poder de lo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] to-[#30b466]">100% Natural</span>
        </h2>

        <p className="text-gray-300 text-[14px] leading-relaxed opacity-90 max-w-md">
          Únete a nuestra comunidad para acceder a productos orgánicos seleccionados, seguimiento de pedidos y beneficios exclusivos.
        </p>
      </div>

      {/* Footer copyright */}
      <div className="relative z-10 flex items-center justify-between text-gray-400 text-[11px]">
        <p className="tracking-wider">© ProNatural Store</p>
        <p className="text-[#4ade80] font-medium tracking-wider">Cuidando tu salud naturalmente</p>
      </div>
    </div>
  );
  return (
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
