import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import toast from 'react-hot-toast';
import { ADMIN_PREFIX } from '../../../config';
import { motion, useReducedMotion } from 'framer-motion';

function getRedirectUrl(role) {
  return role === 'Employee' ? ADMIN_PREFIX + '/vendedor' : ADMIN_PREFIX;
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const { register, handleSubmit, formState: { errors }, watch } = useForm({ mode: 'onTouched' });
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginOldPassword, setLoginOldPassword] = useState('');
  const { login, forceChangePassword, loading, isAuthenticated, user } = useAuth();

  // Si ya tiene sesion activa al cargar la pagina, redirigir segun rol
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRedirectUrl(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const onSubmit = async (data) => {
    try {
      data.email = data.email.toLowerCase().trim();
      await login(data);
      // Redirigir inmediatamente usando el rol guardado en localStorage por login()
      const savedUser = JSON.parse(localStorage.getItem('authUserFallback') || '{}');
      navigate(getRedirectUrl(savedUser.role), { replace: true });
    } catch (error) {
      if (error.message === "Por seguridad, debes cambiar la contraseña temporal asignada.") {
        toast('Debes cambiar tu contraseña para continuar.', { icon: '🔒' });
        setLoginEmail(data.email);
        setLoginOldPassword(data.password);
        setStep(2);
      }
    }
  };

  const onChangePassword = async (data) => {
    try {
      await forceChangePassword({
        email: loginEmail,
        oldPassword: loginOldPassword,
        newPassword: data.newPassword
      });
      const savedUser = JSON.parse(localStorage.getItem('authUserFallback') || '{}');
      navigate(getRedirectUrl(savedUser.role), { replace: true });
    } catch (error) {
      // Error handled by AuthContext
    }
  };

  return (
    <div className="min-h-screen bg-[#090d0b] flex items-center justify-center p-4 relative overflow-hidden font-sans sm:p-8">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_0%,rgba(48,180,102,0.12),transparent_48%),radial-gradient(ellipse_at_100%_100%,rgba(27,67,50,0.2),transparent_42%)]"></div>
      <motion.div aria-hidden="true" animate={shouldReduceMotion ? undefined : { x: [0, 24, 0], y: [0, -18, 0], opacity: [0.16, 0.28, 0.16], scale: [1, 1.08, 1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} className="absolute -right-36 -top-44 h-[620px] w-[620px] rounded-full bg-[#30b466]/20 blur-[130px] pointer-events-none" />
      <motion.div aria-hidden="true" animate={shouldReduceMotion ? undefined : { x: [0, -18, 0], y: [0, 20, 0], opacity: [0.12, 0.22, 0.12], scale: [1.05, 1, 1.05] }} transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }} className="absolute -bottom-52 -left-40 h-[640px] w-[640px] rounded-full bg-[#1b4332]/35 blur-[140px] pointer-events-none" />
      <motion.div aria-hidden="true" animate={shouldReduceMotion ? undefined : { rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }} className="absolute -right-32 top-[12%] h-[430px] w-[430px] rounded-full border border-[#63d895]/[0.07] pointer-events-none" />
      <motion.div aria-hidden="true" animate={shouldReduceMotion ? undefined : { rotate: -360 }} transition={{ duration: 110, repeat: Infinity, ease: 'linear' }} className="absolute -right-16 top-[17%] h-[300px] w-[300px] rounded-full border border-[#63d895]/[0.06] pointer-events-none" />
      
      <motion.div initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.48 }} className="w-full max-w-[440px] relative z-10">
        <div className="text-center mb-8 flex flex-col items-center">
          <motion.div animate={shouldReduceMotion ? undefined : { y: [0, -5, 0], boxShadow: ['0 0 22px rgba(48,180,102,0.08)', '0 0 34px rgba(48,180,102,0.2)', '0 0 22px rgba(48,180,102,0.08)'] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="w-14 h-14 bg-[#161b1e] border border-[#63d895]/15 rounded-2xl flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" fill="#75e29f" />
              <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3L12 21Z" fill="#30b466" />
            </svg>
          </motion.div>
          <h1 className="text-[24px] font-bold text-white tracking-tight">Pro Natural</h1>
          <p className="text-[#4ade80] text-[12px] font-bold tracking-[0.2em] uppercase mt-1">Portal Admin</p>
        </div>

        <motion.div whileHover={shouldReduceMotion ? undefined : { y: -2 }} transition={{ duration: 0.2 }} className="bg-[#121715]/90 border border-white/[0.1] rounded-2xl p-6 sm:p-8 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <h2 className="text-[20px] text-white font-semibold mb-6">
            {step === 1 ? 'Iniciar Sesión' : 'Cambiar Contraseña'}
          </h2>
          
          {step === 1 ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold">Contraseña</label>
                  <Link to={`${ADMIN_PREFIX}/recover`} className="text-[#30b466] text-[11px] font-medium hover:text-[#4ade80] transition-colors">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password", { 
                      required: "La contraseña es obligatoria",
                      minLength: { value: 6, message: "Mínimo 6 caracteres" }
                    })}
                    className={`w-full bg-[#0d1114] border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] pl-4 pr-12 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.password.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-4 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a110d] text-[14px] font-bold rounded-[10px] transition-all shadow-[0_0_15px_rgba(48,180,102,0.2)] hover:shadow-[0_0_20px_rgba(48,180,102,0.4)]"
              >
                {loading ? 'Ingresando...' : 'Acceder al Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit(onChangePassword)} className="space-y-5">
              <p className="text-gray-400 text-[12px] mb-4">
                Como es tu primer inicio de sesión, debes cambiar la contraseña que te asignó el administrador por una nueva.
              </p>
              
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("newPassword", { 
                    required: "La nueva contraseña es obligatoria",
                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                    pattern: { 
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/, 
                      message: "Debe incluir mayúscula, minúscula y número" 
                    }
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.newPassword ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.newPassword && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.newPassword.message}</p>}
              </div>
              
              <div>
                <label className="text-gray-400 text-[11px] uppercase tracking-wider font-semibold mb-2 block">Confirmar Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmNewPassword", { 
                    required: "Confirma tu nueva contraseña",
                    validate: val => val === watch('newPassword') || "Las contraseñas no coinciden"
                  })}
                  className={`w-full bg-[#0d1114] border ${errors.confirmNewPassword ? 'border-red-500/50' : 'border-white/10'} rounded-[10px] px-4 py-3 text-[14px] text-white placeholder-gray-600 focus:outline-none focus:border-[#4ade80] transition-colors`}
                />
                {errors.confirmNewPassword && <p className="text-red-400 text-[11px] mt-1.5 font-medium">{errors.confirmNewPassword.message}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3 mt-4 bg-[#30b466] hover:bg-[#289e58] disabled:opacity-50 disabled:cursor-not-allowed text-[#0a110d] text-[14px] font-bold rounded-[10px] transition-all shadow-[0_0_15px_rgba(48,180,102,0.2)] hover:shadow-[0_0_20px_rgba(48,180,102,0.4)]"
              >
                {loading ? 'Guardando...' : 'Cambiar y Acceder'}
              </button>
            </form>
          )}
        </motion.div>

        {step === 1 && (
          <p className="text-center text-gray-500 text-[12px] mt-6">
            ¿Aún no tienes cuenta? <Link to={`${ADMIN_PREFIX}/register`} className="text-white hover:text-[#4ade80] font-medium transition-colors">Solicitar Acceso</Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
