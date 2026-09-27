import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

function AccountField({ icon, label, value, detail }) {
  return (
    <div className="flex min-w-0 items-start gap-4 rounded-xl border border-[#e9e9e2] bg-[#faf9f6] p-4 sm:p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0b2216] text-[#8be4a9]" aria-hidden="true">{icon}</span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[10px] font-bold tracking-[0.15em] text-[#77847c] uppercase">{label}</p>
        <p className="mt-1 break-words text-[14px] font-semibold leading-snug text-[#0b2216]">{value}</p>
        {detail && <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{detail}</p>}
      </div>
    </div>
  );
}

const UserIcon = () => <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/></svg>;
const MailIcon = () => <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>;
const LockIcon = () => <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>;

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const shouldReduceMotion = useReducedMotion();

  const cardMotion = shouldReduceMotion ? {} : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, ease: 'easeOut' } };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f7f6f1] px-5 py-12 sm:px-8 lg:py-16">
        <motion.section {...cardMotion} className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#e9e7df] bg-white shadow-[0_24px_64px_rgba(11,34,22,0.09)]">
          <div className="grid md:grid-cols-[0.85fr_1.15fr]">
            <div className="relative flex min-h-[230px] flex-col justify-between overflow-hidden bg-[#0b2216] p-7 sm:p-9 md:min-h-[470px]">
              <div aria-hidden="true" className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
              <div aria-hidden="true" className="absolute -right-8 -top-12 h-44 w-44 rounded-full border border-white/10" />
              <Link to="/" className="relative z-10 text-[16px] font-bold tracking-tight text-white">PRONATURAL<span className="text-[#e5a461]">.</span></Link>
              <div className="relative z-10 mt-10">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.07] text-[#8be4a9]"><UserIcon /></span>
                <p className="mt-5 text-[10px] font-bold tracking-[0.2em] text-[#e5a461] uppercase">Tu espacio personal</p>
                <h1 className="mt-2 max-w-sm text-[32px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[38px]">Bienvenido a ProNatural</h1>
                <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/65">Inicia sesión o crea una cuenta para guardar tus datos y completar tus pedidos.</p>
              </div>
              <p className="relative z-10 mt-8 text-[9px] font-semibold tracking-[0.15em] text-white/45 uppercase">Bienestar natural, a tu manera</p>
            </div>

            <div className="p-6 sm:p-9 md:p-10">
              <div className="mb-6">
                <p className="text-[10px] font-bold tracking-[0.16em] text-[#b45309] uppercase">Modo invitado</p>
                <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-[#0b2216]">Continúa explorando</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-gray-500">Puedes recorrer el catálogo y agregar productos al carrito. Para realizar pedidos y guardar tus datos, accede a tu cuenta.</p>
              </div>

              <div className="space-y-3">
                <AccountField icon={<UserIcon />} label="Estado de cuenta" value="Navegando como invitado" detail="Explora los productos disponibles en la tienda." />
                <AccountField icon={<MailIcon />} label="Correo electrónico" value="Sin iniciar sesión" detail="Accede para consultar la información de tu cuenta." />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/register" className="flex min-h-12 items-center justify-center rounded-lg bg-[#0b2216] px-4 text-[10px] font-bold tracking-[0.16em] text-white transition-colors hover:bg-[#173c2b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0b2216]">CREAR CUENTA</Link>
                <Link to="/login" className="flex min-h-12 items-center justify-center rounded-lg border border-[#d8ded8] bg-white px-4 text-[10px] font-bold tracking-[0.16em] text-[#0b2216] transition-colors hover:bg-[#f5f6f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0b2216]">INICIAR SESIÓN</Link>
              </div>
              <Link to="/catalogo" className="mt-5 inline-flex min-h-10 items-center gap-2 text-[11px] font-bold tracking-wide text-[#22643e] transition-colors hover:text-[#b45309]">← Volver al catálogo</Link>
            </div>
          </div>
        </motion.section>
      </div>
    );
  }

  const displayName = user?.name || 'Usuario ProNatural';
  const displayEmail = user?.email || 'usuario@pronatural.com';
  const initials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f7f6f1] px-5 py-12 sm:px-8 lg:py-16">
      <motion.section {...cardMotion} className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#e8e8e1] bg-white shadow-[0_24px_64px_rgba(11,34,22,0.09)]">
        <div className="grid md:grid-cols-[0.8fr_1.2fr]">
          <div className="relative flex min-h-[260px] flex-col justify-between overflow-hidden bg-[#0b2216] p-7 sm:p-9 md:min-h-[510px]">
            <div aria-hidden="true" className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div aria-hidden="true" className="absolute -right-12 -top-12 h-52 w-52 rounded-full border border-white/10" />
            <Link to="/" className="relative z-10 text-[16px] font-bold tracking-tight text-white">PRONATURAL<span className="text-[#e5a461]">.</span></Link>
            <div className="relative z-10 mt-10">
              <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] text-[22px] font-semibold tracking-wide text-[#8be4a9] shadow-inner">{initials || 'U'}</div>
              <p className="mt-6 text-[10px] font-bold tracking-[0.2em] text-[#e5a461] uppercase">Cuenta personal</p>
              <h1 className="mt-2 max-w-sm break-words text-[30px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[38px]">Hola, {displayName.split(' ')[0]}</h1>
              <p className="mt-3 max-w-sm text-[13px] leading-relaxed text-white/65">Administra tus credenciales y mantén tu cuenta al día.</p>
            </div>
            <div className="relative z-10 mt-8 flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-white/55 uppercase"><span className="h-2 w-2 rounded-full bg-[#70db92] shadow-[0_0_12px_rgba(112,219,146,0.65)]" />Cuenta activa</div>
          </div>

          <div className="p-6 sm:p-9 md:p-10 lg:p-12">
            <div className="mb-7">
              <p className="text-[10px] font-bold tracking-[0.16em] text-[#b45309] uppercase">Información de la cuenta</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-tight text-[#0b2216] sm:text-[28px]">Tu perfil</h2>
              <p className="mt-1.5 text-[13px] text-gray-500">Estos son los datos asociados a tu acceso.</p>
            </div>

            <div className="space-y-3">
              <AccountField icon={<UserIcon />} label="Nombre completo" value={displayName} detail="Nombre registrado en tu cuenta ProNatural." />
              <AccountField icon={<MailIcon />} label="Correo electrónico" value={displayEmail} detail="Utiliza este correo para acceder a tu cuenta." />
            </div>

            <div className="mt-8 border-t border-[#ecece6] pt-6">
              <p className="text-[10px] font-bold tracking-[0.15em] text-[#77847c] uppercase">Seguridad y acceso</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link to="/recover" className="group flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg border border-[#dce1da] bg-[#f8f8f4] px-4 text-center text-[10px] font-bold tracking-[0.12em] text-[#0b2216] transition-all hover:border-[#a4b3a6] hover:bg-[#eff2eb] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2216]"><LockIcon />CAMBIAR CONTRASEÑA</Link>
                <button type="button" onClick={logout} className="group flex min-h-[52px] items-center justify-center gap-2.5 rounded-lg bg-[#0b2216] px-4 text-[10px] font-bold tracking-[0.14em] text-white transition-colors hover:bg-[#762b22] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b2216]"><svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>CERRAR SESIÓN</button>
              </div>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
