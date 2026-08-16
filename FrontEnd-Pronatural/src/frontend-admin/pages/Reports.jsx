// Componente de Análisis y Reportes del Panel Administrativo Web de ProNatural Store
// Muestra métricas de rendimiento, gráficos de ingresos, metas y transacciones recientes
// Permite generar y descargar reportes ejecutivos en PDF (Ventas, Inventario y Clientes)
import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useGlobalData } from '../../context/GlobalDataContext';
import { useNavigate } from 'react-router-dom';
import { ADMIN_PREFIX } from '../../config';

// Tarjeta pequeña de métrica ejecutiva
function MetricReportCard({ icon, label, value, trend, trendUp }) {
  return (
    <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-5 flex flex-col justify-between h-[130px]">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-[10px] bg-white/5 flex items-center justify-center text-[#4ade80]">
          {icon}
        </div>
        <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
          trendUp ? 'bg-[#1b4332] text-[#4ade80]' : 'bg-red-950/50 text-red-400'
        }`}>
          {trendUp ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>
          )}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-gray-400 text-[12px] mb-1">{label}</p>
        <p className="text-[24px] text-white font-bold tracking-tight">{value}</p>
      </div>
    </div>
  );
}

export default function Reports() {
  const navigate = useNavigate();

  // Estados de vista
  const [timeRange, setTimeRange]       = useState('Mensual');
  const [reportPeriod, setReportPeriod] = useState('all');

  // Obtener datos globales del contexto
  const { sales: allSales = [], products = [], stats = {}, users = [], customers = [] } = useGlobalData();

  const now = useMemo(() => new Date(), []);

  // Filtrar ventas según el período seleccionado
  const sales = useMemo(() => {
    const list = Array.isArray(allSales) ? allSales : [];
    if (reportPeriod === 'all') return list;
    return list.filter(s => {
      if (!s) return false;
      const d = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      if (reportPeriod === 'this_month') {
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }
      if (reportPeriod === 'last_month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const year = currentMonth === 0 ? currentYear - 1 : currentYear;
        return d.getMonth() === lastMonth && d.getFullYear() === year;
      }

      const dayOfWeek = now.getDay() || 7;
      const startOfThisWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek + 1);
      startOfThisWeek.setHours(0, 0, 0, 0);

      if (reportPeriod === 'this_week') {
        return d >= startOfThisWeek;
      }
      if (reportPeriod === 'last_week') {
        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
        return d >= startOfLastWeek && d < startOfThisWeek;
      }
      return true;
    });
  }, [allSales, reportPeriod, now]);

  const filteredTotalRevenue = sales.reduce((acc, curr) => acc + (curr.total || curr.amount || 0), 0);
  const filteredTotalOrders  = sales.length;

  // 1. Exportar Reporte de Ventas (PDF)
  const exportSalesPDF = () => {
    const doc = new jsPDF();

    const periodLabels = {
      'all':        'Histórico Completo',
      'this_month': 'Este Mes',
      'last_month': 'Mes Pasado',
      'this_week':  'Esta Semana',
      'last_week':  'Semana Pasada',
    };

    doc.setFontSize(18);
    doc.setTextColor(48, 180, 102);
    doc.text("ProNatural Store", 14, 15);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Reporte Ejecutivo de Ventas - ${periodLabels[reportPeriod]}`, 14, 22);

    const dateStr = new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${dateStr}`, 14, 29);
    doc.text(`Total Ingresos: $${filteredTotalRevenue.toFixed(2)} | Total Pedidos: ${filteredTotalOrders}`, 14, 36);

    const tableColumn = ["ID Pedido", "Cliente", "Fecha", "Método Pago", "Estado", "Total"];
    const tableRows   = [];

    sales.forEach(s => {
      const saleDate = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
      const clientName = s.customerId ? `${s.customerId.nombre || s.customerId.name || ''}`.trim() : (s.client || s.cliente || 'Cliente General');
      const saleData = [
        (s._id || s.id || '').toString().slice(-6).toUpperCase(),
        clientName,
        saleDate.toLocaleDateString(),
        s.paymentMethod || s.metodoPago || 'Efectivo',
        s.estado || s.status || 'Completado',
        `$${(s.total || s.amount || 0).toFixed(2)}`,
      ];
      tableRows.push(saleData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [48, 180, 102] },
    });

    doc.save(`Reporte_Ventas_${periodLabels[reportPeriod].replace(/ /g, '_')}_ProNatural.pdf`);
  };

  // 2. Exportar Reporte de Inventario y Stock (PDF)
  const exportInventoryPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(48, 180, 102);
    doc.text("ProNatural Store", 14, 15);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Reporte de Inventario y Valoración de Stock", 14, 22);

    const dateStr = new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${dateStr}`, 14, 29);

    const totalInventoryValue = products.reduce((acc, p) => acc + ((p.precio || p.price || 0) * (p.stock || 0)), 0);
    const lowStockCount       = products.filter(p => (p.stock || 0) <= 15).length;

    doc.text(`Total Productos: ${products.length}  |  Valor Total Stock: $${totalInventoryValue.toFixed(2)}  |  Alertas Bajo Stock: ${lowStockCount}`, 14, 36);

    const tableColumns = ["Producto", "Categoría", "Precio Unit.", "Existencia", "Valor Acumulado"];
    const tableRows    = products.map(p => {
      const name = p.nombreProducto || p.name || 'Producto';
      const cat  = p.idCategoria || p.category || 'General';
      const price = parseFloat(p.precio || p.price || 0);
      const stock = p.stock || 0;
      const total = (price * stock).toFixed(2);
      return [
        name,
        cat,
        `$${price.toFixed(2)}`,
        `${stock} u. ${stock <= 15 ? '(Bajo Stock)' : ''}`,
        `$${total}`,
      ];
    });

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 42,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save('Reporte_Inventario_ProNatural.pdf');
  };

  // 3. Exportar Directorio de Vendedores y Personal (PDF)
  const exportSellersPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(48, 180, 102);
    doc.text("ProNatural Store", 14, 15);

    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text("Directorio de Vendedores y Personal", 14, 22);

    const dateStr = new Date().toLocaleDateString('es-SV', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${dateStr}`, 14, 29);
    doc.text(`Total de Personal Registrado: ${users.length}`, 14, 36);

    const tableColumns = ["Nombre Completo", "Cargo / Rol", "Correo Electrónico", "Teléfono", "Salario ($)", "F. Nacimiento / Edad"];
    const tableRows = users.map(u => {
      const fullName = `${u.name || u.nombre || ''} ${u.lastName || u.apellido || ''}`.trim() || 'Empleado';
      const role = u.role || u.cargo || 'Vendedor';
      const email = u.email || u.correo || 'N/A';
      const phone = u.phone || u.telefono || 'No registrado';
      const salNum = typeof u.salary === 'number' ? u.salary : (typeof u.salario === 'number' ? u.salario : 0);
      const salaryStr = `$${salNum.toFixed(2)}`;

      let ageStr = 'N/A';
      const bday = u.birthdate || u.fechaNacimiento;
      if (bday) {
        const birthDate = new Date(bday);
        if (!isNaN(birthDate.getTime())) {
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          const formattedBday = birthDate.toLocaleDateString('es-SV');
          ageStr = `${formattedBday} (${age} años)`;
        }
      }

      return [fullName, role, email, phone, salaryStr, ageStr];
    });

    autoTable(doc, {
      head: [tableColumns],
      body: tableRows,
      startY: 42,
      styles: { fontSize: 8.5, cellPadding: 3 },
      headStyles: { fillColor: [139, 92, 246] },
    });

    doc.save('Directorio_Vendedores_ProNatural.pdf');
  };

  const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const DAYS   = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const chartDataMap = {};

  if (timeRange === 'Mensual') {
    sales.forEach(sale => {
      const saleDate = sale.createdAt ? new Date(sale.createdAt) : (sale.date ? new Date(sale.date) : new Date());
      const m = MONTHS[saleDate.getMonth()];
      chartDataMap[m] = (chartDataMap[m] || 0) + (sale.total || sale.amount || 0);
    });
  } else {
    sales.forEach(sale => {
      const saleDate = sale.createdAt ? new Date(sale.createdAt) : (sale.date ? new Date(sale.date) : new Date());
      const diffTime = Math.abs(now - saleDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 7) {
        const dName = DAYS[saleDate.getDay()];
        chartDataMap[dName] = (chartDataMap[dName] || 0) + (sale.total || sale.amount || 0);
      }
    });
  }

  const chartData = useMemo(() => {
    if (timeRange === 'Mensual') {
      return Array.from({ length: 6 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const name = MONTHS[d.getMonth()];
        return { name, value: Math.round(chartDataMap[name] || 0) };
      });
    } else {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        const name = DAYS[d.getDay()];
        return { name, value: Math.round(chartDataMap[name] || 0) };
      });
    }
  }, [timeRange, chartDataMap, now]);

  const topProducts = [...products]
    .sort((a, b) => (b.precio || b.price || 0) - (a.precio || a.price || 0))
    .slice(0, 3)
    .map(p => ({
      id: p._id || p.id,
      name: p.nombreProducto || p.name,
      sales: `${p.stock || 0} en Stock`,
      revenue: `$${((p.precio || p.price || 0) * 10).toFixed(2)}`,
      img: p.imagenProducto?.[0] || p.img,
    }));

  const recentTx = sales.slice(0, 4).map(s => {
    const saleDate = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
    const clientName = s.customerId ? `${s.customerId.nombre || s.customerId.name || ''}`.trim() : (s.client || s.cliente || 'Cliente General');
    return {
      id: `#${s._id ? s._id.toString().substring(0, 6) : s.id}`,
      client: clientName || 'Cliente General',
      time: saleDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      status: s.estado || s.status || 'Completado',
      amount: `$${(s.total || s.amount || 0).toFixed(2)}`,
    };
  });

  const newClients = sales.filter(s => {
    const d = s.createdAt ? new Date(s.createdAt) : (s.date ? new Date(s.date) : new Date());
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      {/* Encabezado principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-white tracking-tight leading-tight">Análisis y Reportes PDF</h1>
          <p className="text-gray-400 text-[14px] mt-1">Generación y descarga de informes ejecutivos en formato oficial.</p>
        </div>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <MetricReportCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
          label="Ingresos Totales" value={`$${(stats.totalRevenue || 0).toFixed(2)}`} trend="Real" trendUp
        />
        <MetricReportCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
          label="Pedidos Totales" value={String(stats.totalOrders || allSales.length)} trend="Real" trendUp
        />
        <MetricReportCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>}
          label="Inventario Activo" value={String(stats.activeInventory || products.length)} trend="Real" trendUp={false}
        />
        <MetricReportCard
          icon={<svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          label="Clientes Registrados" value={String(customers.length)} trend="Real" trendUp
        />
      </div>

      {/* SECCIÓN DE 3 TARJETAS PARA GENERAR PDFS OFICIALES */}
      <h2 className="text-[18px] font-bold text-white mb-4">Módulos de Exportación de Reportes PDF</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

        {/* TARJETA 1: REPORTE DE VENTAS */}
        <div className="bg-[#161b1e] border border-white/10 rounded-[16px] p-6 flex flex-col justify-between hover:border-[#30b466]/40 transition-all">
          <div>
            <div className="w-12 h-12 rounded-[12px] bg-[#30b466]/20 text-[#30b466] flex items-center justify-center mb-4">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3 className="text-[17px] font-bold text-white mb-1">Reporte de Ventas</h3>
            <p className="text-[12px] text-gray-400 mb-4">Resumen financiero detallado con estado de orden e ingresos acumulados.</p>

            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Filtrar Período:</label>
            <select
              value={reportPeriod}
              onChange={(e) => setReportPeriod(e.target.value)}
              className="w-full bg-[#0d1114] border border-white/10 text-gray-200 text-[12px] rounded-[8px] p-2.5 outline-none focus:border-[#30b466] cursor-pointer mb-4"
            >
              <option value="all">Histórico Completo</option>
              <option value="this_month">Este Mes</option>
              <option value="last_month">Mes Pasado</option>
              <option value="this_week">Esta Semana</option>
              <option value="last_week">Semana Pasada</option>
            </select>

            <div className="bg-[#0d1114] p-3 rounded-[8px] text-[12px] text-gray-300 mb-5 border border-white/5">
              <span>{sales.length} ventas · </span>
              <strong className="text-[#4ade80]">${filteredTotalRevenue.toFixed(2)} USD</strong>
            </div>
          </div>

          <button
            onClick={exportSalesPDF}
            className="w-full py-3 bg-[#30b466] hover:bg-[#289e58] text-[#0a110d] font-bold text-[13px] rounded-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(48,180,102,0.25)]"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Ventas (PDF)
          </button>
        </div>

        {/* TARJETA 2: REPORTE DE INVENTARIO */}
        <div className="bg-[#161b1e] border border-white/10 rounded-[16px] p-6 flex flex-col justify-between hover:border-[#3b82f6]/40 transition-all">
          <div>
            <div className="w-12 h-12 rounded-[12px] bg-[#3b82f6]/20 text-[#3b82f6] flex items-center justify-center mb-4">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </div>
            <h3 className="text-[17px] font-bold text-white mb-1">Reporte de Inventario</h3>
            <p className="text-[12px] text-gray-400 mb-6">Valoración total del stock en bodega y detección de productos críticos.</p>

            <div className="bg-[#0d1114] p-3 rounded-[8px] text-[12px] text-gray-300 mb-5 border border-white/5">
              <span>{products.length} productos · </span>
              <strong className="text-red-400">{products.filter(p => (p.stock || 0) <= 15).length} con bajo stock</strong>
            </div>
          </div>

          <button
            onClick={exportInventoryPDF}
            className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-bold text-[13px] rounded-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.25)]"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Inventario (PDF)
          </button>
        </div>

        {/* TARJETA 3: DIRECTORIO DE VENDEDORES Y PERSONAL */}
        <div className="bg-[#161b1e] border border-white/10 rounded-[16px] p-6 flex flex-col justify-between hover:border-[#8b5cf6]/40 transition-all">
          <div>
            <div className="w-12 h-12 rounded-[12px] bg-[#8b5cf6]/20 text-[#8b5cf6] flex items-center justify-center mb-4">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-[17px] font-bold text-white mb-1">Directorio de Vendedores</h3>
            <p className="text-[12px] text-gray-400 mb-6">Listado oficial del personal registrado con cargo, salario, contacto y edad.</p>

            <div className="bg-[#0d1114] p-3 rounded-[8px] text-[12px] text-gray-300 mb-5 border border-white/5">
              <span>{users.length} vendedores/personal en la base de datos</span>
            </div>
          </div>

          <button
            onClick={exportSellersPDF}
            className="w-full py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-[13px] rounded-[10px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.25)]"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar Vendedores (PDF)
          </button>
        </div>

      </div>

      {/* Gráfico e indicadores adicionales */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-6">
        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6 h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] text-white font-semibold">Ingresos en el Tiempo</h2>
            <div className="bg-[#0d1114] border border-white/5 p-1 rounded-full flex gap-1">
              <button
                onClick={() => setTimeRange('Semanal')}
                className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${timeRange === 'Semanal' ? 'bg-[#30b466] text-[#0a110d]' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Semanal
              </button>
              <button
                onClick={() => setTimeRange('Mensual')}
                className={`px-3 py-1 text-[11px] font-medium rounded-full transition-colors cursor-pointer ${timeRange === 'Mensual' ? 'bg-[#30b466] text-[#0a110d]' : 'text-gray-400 hover:text-gray-200'}`}
              >
                Mensual
              </button>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickFormatter={(val) => `$${val / 1000}k`}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0d1114', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#4ade80' : '#1b4332'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6 flex flex-col">
          <h2 className="text-[16px] text-white font-semibold mb-6">Productos Más<br/>Vendidos</h2>
          <div className="flex-1 space-y-5">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <img src={p.img || 'https://placehold.co/400x400/161b22/30b466?text=ProNatural'} alt={p.name} className="w-12 h-12 rounded-[8px] object-cover bg-[#0d1114]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-white font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-gray-400">{p.sales}</p>
                </div>
                <span className="text-[13px] font-bold text-[#4ade80]">{p.revenue}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`${ADMIN_PREFIX}/inventario`)}
            className="w-full py-2.5 mt-6 border border-white/10 rounded-[8px] text-[12px] font-bold text-[#30b466] hover:bg-white/5 transition-colors cursor-pointer"
          >
            Ver Todos los Productos
          </button>
        </div>
      </div>

      {/* Transacciones recientes y Metas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[16px] text-white font-semibold">Cumplimiento de Metas</h2>
            <span className="text-[11px] text-gray-400 font-medium">Metas de Ventas</span>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[12px] text-gray-300 font-medium">Meta Diaria (${(stats?.metas?.diaria || 150).toLocaleString()})</p>
                <p className="text-[11px] font-bold text-[#4ade80]">
                  ${(stats?.todayRevenue || 0).toFixed(2)} ({Math.min(100, Math.round(((stats?.todayRevenue || 0) / (stats?.metas?.diaria || 150)) * 100))}%)
                </p>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#4ade80] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((stats?.todayRevenue || 0) / (stats?.metas?.diaria || 150)) * 100))}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[12px] text-gray-300 font-medium">Meta Semanal (${(stats?.metas?.semanal || 1050).toLocaleString()})</p>
                <p className="text-[11px] font-bold text-[#4ade80]">
                  ${(stats?.weekRevenue || 0).toFixed(2)} ({Math.min(100, Math.round(((stats?.weekRevenue || 0) / (stats?.metas?.semanal || 1050)) * 100))}%)
                </p>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#30b466] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((stats?.weekRevenue || 0) / (stats?.metas?.semanal || 1050)) * 100))}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-[12px] text-gray-300 font-medium">Meta Mensual (${(stats?.metas?.mensual || 4500).toLocaleString()})</p>
                <p className="text-[11px] font-bold text-[#4ade80]">
                  ${(stats?.monthRevenue || 0).toFixed(2)} ({Math.min(100, Math.round(((stats?.monthRevenue || 0) / (stats?.metas?.mensual || 4500)) * 100))}%)
                </p>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#75e29f] transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round(((stats?.monthRevenue || 0) / (stats?.metas?.mensual || 4500)) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#161b1e] border border-white/5 rounded-[12px] p-6">
          <h2 className="text-[16px] text-white font-semibold mb-6">Transacciones Recientes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">ID Pedido</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Cliente</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Fecha</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium">Estado</th>
                  <th className="pb-3 text-[10px] uppercase tracking-wider text-gray-500 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentTx.map((tx, idx) => (
                  <tr key={`${tx.id}-${idx}`}>
                    <td className="py-3 text-[12px] text-[#4ade80] font-mono">{tx.id}</td>
                    <td className="py-3 text-[13px] text-gray-200">{tx.client}</td>
                    <td className="py-3 text-[12px] text-gray-400">
                      <span dangerouslySetInnerHTML={{ __html: tx.time.replace(', ', '<br/>') }} />
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-[4px] text-[10px] font-bold border ${
                        tx.status === 'Completado'
                        ? 'bg-[#1b4332]/40 text-[#4ade80] border-[#30b466]/30'
                        : 'bg-white/5 text-gray-400 border-white/10'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 text-[13px] text-white font-medium text-right">{tx.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
