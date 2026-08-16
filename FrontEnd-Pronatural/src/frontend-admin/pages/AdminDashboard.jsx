import { useNavigate } from 'react-router-dom';
import { ADMIN_PREFIX } from '../../config';
import { useGlobalData } from '../../context/GlobalDataContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
const formatCurrency = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
const getStatusStyle = (status) => {
  switch (status) {
    case 'En Proceso': return 'bg-[#1b4332]/50 text-[#4ade80]';
    case 'Enviado': return 'bg-white/5 text-gray-300';
    case 'Entregado': return 'bg-white/5 text-gray-300';
    case 'Pendiente': return 'bg-red-950/50 text-red-400';
    case 'Completado': return 'bg-[#1b4332]/50 text-[#4ade80]';
    default: return 'bg-white/5 text-gray-300';
  }
};
function MetricCard({ icon, label, value, trend, trendUp, isAlert }) {
  return (
    <div className={`bg-[#161b1e] border ${isAlert ? 'border-red-900/50' : 'border-white/5'} rounded-[14px] p-5 flex flex-col gap-4 relative overflow-hidden`}>
      <div className="flex justify-between items-start relative z-10">
        <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center ${isAlert ? 'bg-red-950/50 text-red-400' : 'bg-[#1b4332]/30 text-[#4ade80]'}`}>
          {icon}
        </div>
        {trend && (
          <div className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
            trendUp ? 'text-[#4ade80]' : 'text-gray-400'
          }`}>
            {trendUp ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            ) : (
              <span className="opacity-50">—</span>
            )}
            {trend}
          </div>
        )}
        {isAlert && (
          <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-red-300 bg-red-950/40 border border-red-900/50">
            Requiere Acción
          </div>
        )}
      </div>
      <div className="relative z-10 mt-1">
        <p className="text-gray-400 text-[12px] mb-1">{label}</p>
        <p className={`text-[28px] font-bold tracking-tight ${isAlert ? 'text-red-300' : 'text-white'}`}>{value}</p>
      </div>
    </div>
  );
}
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { sales, products, stats } = useGlobalData();
  const recentOrders = sales.slice(0, 5);
  const lowStockThreshold = 15;
  const lowStockItems = products.filter(p => p.stock <= lowStockThreshold);

  // Calcular ventas reales de los últimos 7 días agrupadas por día de la semana
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
  const hoy = new Date();
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - (6 - i));
    const diaLabel = diasSemana[fecha.getDay()];
    const ventasDelDia = sales
      .filter(s => {
        const d = new Date(s.createdAt || s.fecha || s.date || 0);
        return d.toDateString() === fecha.toDateString();
      })
      .reduce((acc, s) => acc + (s.total || s.amount || 0), 0);
    return { name: diaLabel, ventas: parseFloat(ventasDelDia.toFixed(2)) };
  });

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Resumen General</h1>
          <p className="text-gray-400 text-[14px] mt-1">Resumen de hoy y acciones pendientes.</p>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap gap-3">
          <button onClick={() => navigate(`${ADMIN_PREFIX}/reportes`)} className="flex items-center gap-2 px-4 py-2.5 bg-transparent border border-white/10 text-gray-300 text-[13px] font-medium rounded-[10px] hover:bg-white/5 transition-colors cursor-pointer">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Reporte
          </button>
          <button onClick={() => navigate(`${ADMIN_PREFIX}/catalogo`)} className="flex items-center gap-2 px-5 py-2.5 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] text-[13px] font-bold rounded-[10px] transition-colors shadow-[0_0_15px_rgba(48,180,102,0.3)] cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo Producto
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}
          label="Ventas Totales"
          value={formatCurrency(stats.totalRevenue)}
          trend="Real-time"
          trendUp
        />
        <MetricCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>}
          label="Total de Pedidos"
          value={stats.totalOrders}
          trend="Real-time"
          trendUp
        />
        <MetricCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="Inventario Activo"
          value={stats.activeInventory}
          trend="Total"
          trendUp={false}
        />
        <MetricCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
          label="Artículos con Bajo Stock"
          value={lowStockItems.length}
          isAlert={lowStockItems.length > 0}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <div className="flex flex-col gap-6">
          <div className="bg-[#161b1e] rounded-[14px] p-6">
            <h2 className="text-[16px] text-white font-semibold mb-6">Resumen de Ventas (Últimos 7 días)</h2>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }} 
                    contentStyle={{ backgroundColor: '#121619', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                  />
                  <Bar dataKey="ventas" fill="#30b466" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-[#161b1e] rounded-[14px] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[16px] text-white font-semibold">Pedidos Recientes</h2>
            <button onClick={() => navigate('/ventas/historial')} className="text-[#30b466] text-[12px] font-medium hover:underline cursor-pointer">Ver Todo</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">ID Pedido</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Cliente</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Fecha</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium">Estado</th>
                  <th className="pb-3 text-[11px] uppercase tracking-wider text-gray-500 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-gray-500">No hay ventas recientes</td></tr>
                ) : (
                  recentOrders.map(order => (
                    <tr key={order._id || order.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 text-[13px] text-[#4ade80] font-mono">
                        #{(order._id || order.id || '').toString().substring(0, 6)}
                      </td>
                      <td className="py-4 text-[13px] text-gray-200">
                        {order.customerId?.nombre || order.customerId?.name || order.client || 'Cliente General'}
                      </td>
                      <td className="py-4 text-[13px] text-gray-400">
                        {new Date(order.createdAt || order.fecha || order.date || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-[6px] text-[11px] font-semibold ${getStatusStyle(order.status || 'completed')}`}>
                          {order.status || 'completed'}
                        </span>
                      </td>
                      <td className="py-4 text-[13px] text-white font-medium text-right">
                        {formatCurrency(order.total || order.amount || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div> {/* Cierra el flex col del bloque izquierdo */}

        {/* Sidebar Derecha: Metas de Ventas y Alertas de Stock */}
        <div className="flex flex-col gap-6">
          <div className="bg-[#161b1e] rounded-[14px] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[16px] text-white font-semibold">Cumplimiento de Metas</h2>
              <button onClick={() => navigate(`${ADMIN_PREFIX}/ajustes`)} className="text-[#30b466] hover:underline text-[11px] font-medium">Configurar</button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1 text-[12px]">
                  <span className="text-gray-300">Meta Diaria (${(stats?.metas?.diaria || 150).toLocaleString()})</span>
                  <span className="text-[#4ade80] font-bold">${(stats?.todayRevenue || 0).toFixed(2)} ({Math.min(100, Math.round(((stats?.todayRevenue || 0) / (stats?.metas?.diaria || 150)) * 100))}%)</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#4ade80] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round(((stats?.todayRevenue || 0) / (stats?.metas?.diaria || 150)) * 100))}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 text-[12px]">
                  <span className="text-gray-300">Meta Semanal (${(stats?.metas?.semanal || 1050).toLocaleString()})</span>
                  <span className="text-[#30b466] font-bold">${(stats?.weekRevenue || 0).toFixed(2)} ({Math.min(100, Math.round(((stats?.weekRevenue || 0) / (stats?.metas?.semanal || 1050)) * 100))}%)</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#30b466] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round(((stats?.weekRevenue || 0) / (stats?.metas?.semanal || 1050)) * 100))}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 text-[12px]">
                  <span className="text-gray-300">Meta Mensual (${(stats?.metas?.mensual || 4500).toLocaleString()})</span>
                  <span className="text-[#75e29f] font-bold">${(stats?.monthRevenue || 0).toFixed(2)} ({Math.min(100, Math.round(((stats?.monthRevenue || 0) / (stats?.metas?.mensual || 4500)) * 100))}%)</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[#75e29f] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Math.round(((stats?.monthRevenue || 0) / (stats?.metas?.mensual || 4500)) * 100))}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#161b1e] rounded-[14px] p-6 flex-1 max-h-[350px] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-6">
              <svg width="18" height="18" fill="none" stroke="#fca5a5" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <h2 className="text-[16px] text-white font-semibold">Alertas de Stock</h2>
            </div>
            <div className="space-y-4">
              {lowStockItems.length === 0 ? (
                <p className="text-gray-500 text-sm">El inventario está en niveles óptimos.</p>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#0d1114]">
                      <img src={item.img || 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-gray-200 font-medium truncate">{item.name}</p>
                      <p className={`text-[11px] truncate ${item.stock <= 0 ? 'text-red-400' : 'text-gray-400'}`}>
                        {item.stock <= 0 ? 'Agotado' : `Solo quedan ${item.stock} unidades`}
                      </p>
                    </div>
                    <button onClick={() => navigate(`${ADMIN_PREFIX}/inventario`)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#30b466]/20 hover:text-[#4ade80] transition-colors cursor-pointer flex-shrink-0">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
