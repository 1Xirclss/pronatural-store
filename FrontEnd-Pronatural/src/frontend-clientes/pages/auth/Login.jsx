import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import AuthLayout from '../../../components/layout/AuthLayout';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, useReducedMotion } from 'framer-motion';
export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, isAuthenticated, user } = useAuth();
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'Admin' || user?.role === 'Employee') {
        navigate('/portal-seguro', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    try {
      const success = await login(data);
      if (!success) {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    }
  };
  const leftPanel = (
    <div className="absolute inset-0 flex flex-col overflow-hidden bg-[#082214] p-7 sm:p-10 lg:p-12 xl:p-14">
      <motion.img
        src="/images/registro-botanico.png"
        alt=""
        aria-hidden="true"
        animate={shouldReduceMotion ? undefined : { scale: [1, 1.045, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-[#06170e]/65 via-[#06170e]/15 to-[#06170e]/85" />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#06170e]/55 via-transparent to-[#06170e]/10" />
      <motion.div aria-hidden="true" animate={shouldReduceMotion ? undefined : { opacity: [0.15, 0.28, 0.15] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} className="pointer-events-none absolute -left-36 -top-36 h-[480px] w-[480px] rounded-full bg-[#30b466]/25 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 h-[420px] w-[420px] rounded-full border border-white/15" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-12 -right-12 h-[300px] w-[300px] rounded-full border border-white/10" />

      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="relative z-10 flex items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-tighter text-white drop-shadow-md">PRONATURAL</h1>
        <span className="rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-[#a5f3c4] backdrop-blur-md">Bienestar natural</span>
      </motion.div>

      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: shouldReduceMotion ? 0 : 0.08 }} className="relative z-10 mt-auto max-w-lg pb-8 pt-20 lg:pb-12">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.22em] text-[#83e6a8]">Tu espacio ProNatural</p>
        <h2 className="max-w-md text-4xl font-bold leading-[1.04] tracking-tight text-white drop-shadow-lg lg:text-5xl">Qué bueno tenerte de vuelta.</h2>
        <p className="mt-4 max-w-sm text-sm leading-6 text-white/85 drop-shadow-md">Ingresa a tu cuenta para revisar tus compras, pedidos y preferencias.</p>
        <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/20 px-4 py-2.5 text-xs font-medium text-white/90 backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-[#83e6a8] shadow-[0_0_14px_rgba(131,230,168,0.75)]" />
          Cuidando tu salud naturalmente
        </div>
      </motion.div>
    </div>
  );
  return (
    <AuthLayout leftPanel={leftPanel}>
      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.38 }} className="mb-10">
        <p className="text-[10px] font-bold text-[#30b466] tracking-widest uppercase mb-2">Acceso a Clientes</p>
        <h2 className="text-[36px] font-bold leading-none tracking-tighter text-brand-dark mb-3">INICIAR SESIÓN</h2>
        <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-sm">
          Introduce tus datos para acceder a tu perfil personal en ProNatural.
        </p>
      </motion.div>
      <motion.form initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.42, delay: shouldReduceMotion ? 0 : 0.06 }} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Correo Electrónico</label>
          <input
            type="email"
            placeholder="usuario@ejemplo.com"
            {...register('email', { 
              required: 'El correo es requerido', 
              pattern: { 
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
                message: 'El formato de correo no es válido' 
              },
              onChange: (e) => e.target.value = e.target.value.toLowerCase()
            })}
            className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} px-4 py-3.5 text-[13px] focus:outline-none focus:border-brand-dark transition-colors lowercase`}
          />
          {errors.email && <p className="text-red-500 text-[10px] mt-1.5">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-2">Contraseña</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              {...register('password', { required: 'La contraseña es requerida' })}
              className={`w-full bg-white border ${errors.password ? 'border-red-500' : 'border-gray-200'} px-4 py-3.5 text-[13px] focus:outline-none focus:border-brand-dark transition-colors pr-10`}
            />
            <button 
              type="button"
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark p-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-[10px] mt-1.5">{errors.password.message}</p>}
        </div>
        <div className="pt-2">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#0a2016] text-white text-[10px] font-bold tracking-[0.2em] uppercase py-4 hover:bg-[#123827] transition-colors disabled:opacity-70 cursor-pointer"
          >
            {isSubmitting ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
          </button>
        </div>
        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-100">
          <Link to="/recover" className="text-[10px] font-semibold tracking-widest text-gray-500 hover:text-brand-dark uppercase leading-[1.6]">
            ¿Olvidaste tu contraseña?
          </Link>
          <Link to="/register" className="text-[10px] font-bold tracking-widest text-[#30b466] hover:text-[#1b4332] uppercase">
            Crear cuenta
          </Link>
        </div>
      </motion.form>
      <div className="mt-12 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          © ProNatural Store. Pasión por la naturaleza.
        </p>
      </div>
    </AuthLayout>
  );
}
