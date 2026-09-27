import { Link } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';

export default function Footer() {
  const { config } = useGlobalData();
  const c = config || {};
  const storeName = c.storeName || 'ProNatural';
  const instagram = c.instagram?.replace(/^@/, '');
  const facebook = c.facebook?.replace(/^https?:\/\//, '');
  const tiktok = c.tiktok?.replace(/^@/, '');
  const socialLinks = [
    instagram && { label: 'Instagram', href: `https://instagram.com/${instagram}` },
    facebook && { label: 'Facebook', href: `https://${facebook}` },
    tiktok && { label: 'TikTok', href: `https://tiktok.com/@${tiktok}` },
  ].filter(Boolean);

  return (
    <footer className="w-full bg-[#0b2216] text-[#a5b4ac]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-12 sm:grid-cols-2 md:px-12 lg:grid-cols-3 lg:gap-8 lg:px-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <Link to="/" className="inline-block text-white text-[20px] font-bold tracking-tight transition-colors hover:text-[#d8a15d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
            {storeName.toUpperCase()}
          </Link>
          <p className="mt-3 max-w-xs text-[12px] leading-relaxed text-[#a5b4ac]">
            Productos naturales seleccionados con cuidado para tu bienestar.
          </p>
        </div>

        <section aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title" className="text-[10px] font-bold tracking-[0.18em] text-white uppercase">Contacto</h2>
          <div className="mt-4 space-y-3 text-[12px]">
            {c.email && <a href={`mailto:${c.email}`} className="block break-all transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{c.email}</a>}
            {c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, '')}`} className="block transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{c.phone}</a>}
            {c.address && <p className="max-w-xs leading-relaxed">{c.address}</p>}
            {!c.email && !c.phone && !c.address && <Link to="/contacto" className="inline-block transition-colors hover:text-white">Escríbenos desde contacto</Link>}
          </div>
        </section>

        <nav aria-labelledby="footer-social-title">
          <h2 id="footer-social-title" className="text-[10px] font-bold tracking-[0.18em] text-white uppercase">Redes sociales</h2>
          {socialLinks.length ? (
            <ul className="mt-4 space-y-3 text-[12px]">
              {socialLinks.map(({ label, href }) => (
                <li key={label}><a href={href} target="_blank" rel="noreferrer" className="transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">{label}<span aria-hidden="true" className="ml-1 text-[10px]">↗</span></a></li>
              ))}
            </ul>
          ) : <p className="mt-4 text-[12px]">Síguenos para conocer novedades.</p>}
        </nav>
      </div>

      <div className="border-t border-white/10 px-6 py-5 md:px-12 lg:px-16">
        <p className="mx-auto max-w-[1440px] text-[9px] leading-relaxed tracking-[0.1em] text-[#819187] uppercase">
          © {new Date().getFullYear()} {storeName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
