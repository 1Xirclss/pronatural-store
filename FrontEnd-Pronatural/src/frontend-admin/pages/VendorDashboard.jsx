import { useNavigate } from 'react-router-dom';
import { ADMIN_PREFIX } from '../../config';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalData } from '../../context/GlobalDataContext';
function MetricCardVendor({ icon, label, value, trend, isMeta, metaPercent }) {
  return (
    <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="w-10 h-10 rounded-[8px] bg-white/5 flex items-center justify-center text-white">
          {icon}
        </div>
        <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold tracking-wider">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">{label}</p>
        <p className="text-[28px] font-bold text-white leading-none">{value}</p>
      </div>
      {isMeta && (
        <div className="absolute bottom-6 left-6 right-6 h-2 bg-white/5 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-[#1b4332] rounded-full" style={{ width: `${metaPercent}%` }}></div>
        </div>
      )}
    </div>
  );
}
export default function VendorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { sales, products, stats } = useGlobalData();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Vendedor';
  const recentSales = sales.slice(0, 4); 
  const topProducts = products.slice(0, 2); 
  const vendorTotalRevenue = stats.totalRevenue; 
  const vendorTotalItems = stats.totalItemsSold;
  const metaMensual = stats?.metas?.mensual || 4500;
  const meta = Math.min(100, Math.round((stats.monthRevenue / metaMensual) * 100));
  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Bienvenido de nuevo, {firstName}</h1>
          <p className="text-gray-400 text-[14px] mt-1">Panel de Ventas Personal. Resumen de tu desempeño diario.</p>
        </div>
        <button onClick={() => navigate(`${ADMIN_PREFIX}/ventas/registrar`)} className="w-full sm:w-auto flex justify-center items-center gap-2 px-5 py-2.5 bg-[#75e29f] hover:bg-[#5bc285] text-[#0a110d] text-[13px] font-bold rounded-[10px] transition-colors cursor-pointer shadow-[0_0_15px_rgba(117,226,159,0.2)]">
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          Nueva Venta
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <MetricCardVendor
          icon={<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>}
          label="Tus Ventas"
          value={`$${vendorTotalRevenue.toFixed(2)}`}
          trend="+12%"
        />
        <MetricCardVendor
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
          label="Artículos Vendidos"
          value={vendorTotalItems}
          trend="+5"
        />
        <MetricCardVendor
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
          label="Meta Mensual"
          value={`${meta}%`}
          trend="Avg"
          isMeta
          metaPercent={meta}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[18px] text-white font-semibold">Tus Productos Destacados</h2>
            <button onClick={() => navigate(`${ADMIN_PREFIX}/catalogo`)} className="text-[#30b466] hover:text-[#4ade80] text-[12px] font-medium transition-colors flex items-center gap-1 cursor-pointer">
              Ver Catálogo Completo <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {topProducts.map(p => (
              <div key={p.id} className="bg-[#161b1e] border border-white/5 rounded-[12px] overflow-hidden group">
                <div className="h-[180px] bg-[#0d1114] relative">
                  <img src={p.img || 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-[6px] tracking-wide ${p.stock > 10 ? 'bg-[#1b4332] text-[#4ade80]' : 'bg-red-500/20 text-red-400'}`}>
                      {p.stock > 10 ? 'En Stock' : 'Stock Bajo'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-[15px] font-semibold text-white mb-2 leading-tight">{p.name}</h3>
                  <p className="text-[12px] text-gray-400 mb-6 leading-relaxed line-clamp-2">{p.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[18px] font-bold text-[#75e29f]">${p.price.toFixed(2)}</span>
                    <button onClick={() => navigate(`${ADMIN_PREFIX}/ventas/registrar`)} className="w-10 h-10 rounded-[8px] bg-[#1b4332] hover:bg-[#286047] flex items-center justify-center text-[#4ade80] transition-colors cursor-pointer">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="9" y1="11" x2="15" y2="11"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] flex flex-col h-full">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-[18px] text-white font-semibold">Ventas Recientes</h2>
            <button className="text-gray-400 hover:text-white transition-colors cursor-pointer">
              <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>
            </button>
          </div>
          <div className="flex-1 p-6 space-y-6">
            {recentSales.map(sale => (
              <div key={sale.id} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1b4332] text-[#4ade80]`}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[13px] text-gray-200 font-medium truncate">{sale.id}</p>
                    <span className={`text-[12px] font-bold text-[#75e29f]`}>+${sale.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-gray-500">
                    <p className="truncate">{sale.client || 'Cliente General'}</p>
                    <p>{new Date(sale.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-white/5 text-center">
            <button onClick={() => navigate(`${ADMIN_PREFIX}/ventas/historial`)} className="text-[11px] text-gray-400 hover:text-white transition-colors cursor-pointer w-full py-2">
              Ver Todas las Transacciones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
