export const mockProducts = [
  {
    id: '1',
    title: 'Miel de Abeja Orgánica',
    price: 15.50,
    image: 'miel_organica_public_id', 
    tag: 'ORGANIC',
    tagColor: 'bg-[#154734] text-white',
    origin: 'Bosques del Norte / El Salvador',
    flavors: ['DULCE', 'FLORAL'],
    intensity: '05/10',
    specs: {
      ORIGEN: 'Sonsonate, El Salvador',
      ALTITUD: '800 metros sobre el nivel del mar',
      SABOR: 'Notas florales de azahar y cítricos',
      PROCESO: 'Filtrado en frío, 100% pura de abeja',
    },
    description: 'Miel 100% natural, cruda y orgánica, cosechada de manera sostenible.'
  },
  {
    id: '2',
    title: 'Extracto de Noni Concentrado',
    price: 24.00,
    image: 'noni_concentrado_public_id',
    tag: 'LIMITED',
    tagColor: 'bg-[#b45309] text-white',
    origin: 'Valle de San Andrés / El Salvador',
    flavors: ['AMARGO', 'HERBAL'],
    intensity: '08/10',
    specs: {
      ORIGEN: 'Valle de San Andrés, El Salvador',
      ALTITUD: '400 metros sobre el nivel del mar',
      SABOR: 'Notas herbales intensas y terrosas',
      PROCESO: 'Fermentación natural de 2 meses',
    },
    description: 'Concentrado puro de noni orgánico ideal para fortalecer el sistema inmunológico.'
  },
  {
    id: '3',
    title: 'Polvo de Moringa Deshidratada',
    price: 12.00,
    image: 'moringa_polvo_public_id',
    tag: 'SUPERFOOD',
    tagColor: 'bg-emerald-800 text-white',
    origin: 'Tierras Altas de Chalatenango / El Salvador',
    flavors: ['FRESCO', 'TERROSO'],
    intensity: '06/10',
    specs: {
      ORIGEN: 'Chalatenango, El Salvador',
      ALTITUD: '1,200 metros sobre el nivel del mar',
      SABOR: 'Hierba fresca y té verde',
      PROCESO: 'Secado bajo sombra y molido fino',
    },
    description: 'Moringa orgánica en polvo de calidad premium, rica en vitaminas y antioxidantes.'
  },
  {
    id: '4',
    title: 'Aceite de Moringa Prensado en Frío',
    price: 32.00,
    image: 'moringa_aceite_public_id',
    tag: 'PREMIUM',
    tagColor: 'bg-[#0f172a] text-white',
    origin: 'Tierras Altas de Chalatenango / El Salvador',
    flavors: ['FRUTOS SECOS', 'SUAVE'],
    intensity: '04/10',
    specs: {
      ORIGEN: 'Chalatenango, El Salvador',
      ALTITUD: '1,200 metros sobre el nivel del mar',
      SABOR: 'Notas sutiles a nuez y oliva',
      PROCESO: 'Prensado en frío de semillas seleccionadas',
    },
    description: 'Aceite facial y corporal de moringa pura, hidratante y rejuvenecedor.'
  }
];
export const mockInventory = [
  { id: '1', product: mockProducts[0], sku: 'PRON-001', stock: 45, minStock: 10, location: 'Bodega Principal' },
  { id: '2', product: mockProducts[1], sku: 'PRON-002', stock: 8, minStock: 15, location: 'Bodega Principal' }, 
  { id: '3', product: mockProducts[2], sku: 'PRON-003', stock: 120, minStock: 20, location: 'Bodega Principal' },
  { id: '4', product: mockProducts[3], sku: 'PRON-004', stock: 3, minStock: 5, location: 'Bodega Exhibición' } 
];
export const mockSales = [
  {
    id: 'V-1001',
    date: '2026-06-27T08:30:00Z',
    items: [
      { product: mockProducts[0], quantity: 2, price: 15.50 }
    ],
    total: 31.00,
    paymentMethod: 'efectivo',
    vendor: 'Alexander Vance'
  },
  {
    id: 'V-1002',
    date: '2026-06-27T09:15:00Z',
    items: [
      { product: mockProducts[1], quantity: 1, price: 24.00 },
      { product: mockProducts[2], quantity: 2, price: 12.00 }
    ],
    total: 48.00,
    paymentMethod: 'transferencia bancaria',
    vendor: 'Alexander Vance'
  },
  {
    id: 'V-1003',
    date: '2026-06-26T14:20:00Z',
    items: [
      { product: mockProducts[3], quantity: 1, price: 32.00 }
    ],
    total: 32.00,
    paymentMethod: 'efectivo',
    vendor: 'Alexander Vance'
  }
];
export const mockReports = {
  summary: {
    totalSalesToday: 79.00,
    salesCountToday: 2,
    lowStockAlerts: 2,
    monthlyEarnings: 3420.00
  },
  charts: {
    salesDaily: [
      { date: '2026-06-21', amount: 320 },
      { date: '2026-06-22', amount: 450 },
      { date: '2026-06-23', amount: 180 },
      { date: '2026-06-24', amount: 520 },
      { date: '2026-06-25', amount: 310 },
      { date: '2026-06-26', amount: 280 },
      { date: '2026-06-27', amount: 79 }
    ],
    categoriesDistribution: [
      { category: 'Miel', percentage: 40 },
      { category: 'Noni', percentage: 25 },
      { category: 'Moringa', percentage: 35 }
    ]
  }
};
