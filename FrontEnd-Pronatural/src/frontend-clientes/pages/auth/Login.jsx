import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import AuthLayout from '../../../components/layout/AuthLayout';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login, isAuthenticated, user } = useAuth();
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
    <>
      <img 
        src="https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=1000&auto=format&fit=crop" 
        alt="Coffee Beans" 
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40"></div>
      <div className="absolute top-12 left-12 z-10">
        <h1 className="text-white text-[22px] font-bold tracking-tighter">PRONATURAL</h1>
      </div>
      <div className="absolute bottom-12 left-12 z-10 max-w-sm">
        <p className="text-[#4ade80] text-[10px] font-bold tracking-[0.2em] uppercase mb-1">Bienvenido de nuevo</p>
        <p className="text-white text-[13px] font-medium leading-relaxed opacity-90">Ingresa a tu cuenta para gestionar tus compras y preferencias.</p>
      </div>
    </>
  );
  return (
    <AuthLayout leftPanel={leftPanel}>
      <div className="mb-10">
        <p className="text-[10px] font-bold text-[#30b466] tracking-widest uppercase mb-2">Acceso a Clientes</p>
        <h2 className="text-[36px] font-bold leading-none tracking-tighter text-brand-dark mb-3">INICIAR SESIÓN</h2>
        <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-sm">
          Introduce tus datos para acceder a tu perfil personal en ProNatural.
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
      </form>
      <div className="mt-12 pt-4 border-t border-gray-100">
        <p className="text-[10px] text-gray-400">
          © ProNatural Store. Pasión por la naturaleza.
        </p>
      </div>
    </AuthLayout>
  );
}
