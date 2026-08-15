import { useSearchParams } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';
import ProductCard from '../../components/catalog/ProductCard';
import { useState } from 'react';

export default function Catalog() {
  const { products: adminProducts, categories: adminCategories } = useGlobalData();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || 'TODOS';
  const searchQuery = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState('popular');

  const normalize = (str) => {
    if (!str) return '';
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().trim();
  };

  // Extraer lista única de categorías desde adminCategories y adminProducts
  const categoryList = ['TODOS'];
  
  if (Array.isArray(adminCategories)) {
    adminCategories.forEach(c => {
      const catName = (c.nombre || c.name || '').trim();
      if (catName && !categoryList.some(item => normalize(item) === normalize(catName))) {
        categoryList.push(catName);
      }
    });
  }

  if (Array.isArray(adminProducts)) {
    adminProducts.forEach(p => {
      const pCat = (p.category || p.idCategoria?.nombre || p.categoria || '').trim();
      if (pCat && !categoryList.some(item => normalize(item) === normalize(pCat))) {
        categoryList.push(pCat);
      }
    });
  }

  const handleCategorySelect = (cat) => {
    const params = new URLSearchParams(searchParams);
    if (cat === 'TODOS') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (query) {
      params.set('q', query);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  // Filtrado de productos
  let filteredProducts = (adminProducts || []).filter(p => {
    let matchesCategory = true;
    if (selectedCategory !== 'TODOS') {
      const pCat = p.category || p.idCategoria?.nombre || p.categoria || '';
      matchesCategory = normalize(pCat) === normalize(selectedCategory);
    }
    let matchesSearch = true;
    if (searchQuery) {
      const pName = p.name || p.nombreProducto || '';
      const pDesc = p.desc || p.descripcion || '';
      matchesSearch = normalize(pName).includes(normalize(searchQuery)) ||
                      normalize(pDesc).includes(normalize(searchQuery));
    }
    return matchesCategory && matchesSearch;
  });

  // Ordenamiento
  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'name') {
    filteredProducts.sort((a, b) => (a.name || a.nombreProducto || '').localeCompare(b.name || b.nombreProducto || ''));
  }

  const products = filteredProducts.map(p => ({
    id: p.id || p._id,
    title: p.name || p.nombreProducto,
    price: p.price,
    image: p.img || p.imagen || 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=600&auto=format&fit=crop',
    tag: p.stock <= 0 ? 'NO HAY STOCK' : (p.stock <= 5 ? 'POCO STOCK' : null),
    tagColor: p.stock <= 5 ? 'bg-[#b45309] text-white' : 'bg-brand-dark text-white',
    stock: p.stock
  }));

  return (
    <div className="pt-6 pb-20 w-full max-w-[1400px] px-5 sm:px-8 md:px-12 lg:px-16 mx-auto">
      {/* Header Titular */}
      <div className="mb-6">
        <p className="text-[9px] font-bold tracking-[0.2em] text-[#b45309] uppercase mb-2">
          {searchQuery ? 'RESULTADOS DE BÚSQUEDA' : `CATEGORÍA: ${selectedCategory}`}
        </p>
        <h1 className="text-[36px] sm:text-5xl md:text-[64px] lg:text-[72px] font-bold leading-[0.95] tracking-tighter text-[#0e3020] uppercase">
          {searchQuery ? `"${searchQuery}"` : (selectedCategory === 'TODOS' ? 'CATÁLOGO.' : `${selectedCategory}.`)}
        </h1>
      </div>

      {/* BARRA UNIFICADA DE FILTROS, CATEGORÍAS Y BÚSQUEDA */}
      <div className="mb-10 p-3.5 sm:p-4 bg-[#f4f3ec] border border-gray-200 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        
        {/* Categorías (Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase mr-1 shrink-0 hidden sm:inline-block">
            Categorías:
          </span>
          {categoryList.map((cat) => {
            const isSelected = normalize(selectedCategory) === normalize(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all duration-200 shrink-0 whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-[#0a2016] text-white shadow-md shadow-[#0a2016]/20'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-brand-dark border border-gray-200/80'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Búsqueda y Ordenar perfectamente alineados */}
        <div className="flex items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-200/80">
          {/* Buscador */}
          <div className="relative min-w-[160px] sm:min-w-[210px] flex-1">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white border border-gray-200/80 rounded-full py-2 px-4 text-[11px] font-medium text-brand-dark focus:outline-none focus:border-[#123827] shadow-sm pr-8"
            />
            <svg className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center gap-2 bg-white border border-gray-200/80 rounded-full py-2 px-3.5 shadow-sm shrink-0">
            <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase hidden sm:inline-block">ORDENAR:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-[10px] font-bold tracking-wider text-brand-dark uppercase focus:outline-none cursor-pointer"
            >
              <option value="popular">POPULARES</option>
              <option value="price-low">MENOR PRECIO</option>
              <option value="price-high">MAYOR PRECIO</option>
              <option value="name">NOMBRE (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* LISTADO DE PRODUCTOS */}
      {products.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-16 h-16 bg-[#f4f3ec] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <p className="text-[13px] font-bold text-gray-500 tracking-widest uppercase">No se encontraron productos</p>
          <p className="text-[11px] text-gray-400 mt-1">Prueba seleccionando otra categoría o borra los filtros de búsqueda.</p>
          <button
            onClick={() => { handleCategorySelect('TODOS'); handleSearchChange({ target: { value: '' } }); }}
            className="mt-6 px-5 py-2.5 bg-[#0a2016] text-white text-[10px] font-bold tracking-widest uppercase rounded-full hover:bg-[#123827] transition-colors cursor-pointer"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex justify-between items-center text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            <span>Mostrando {products.length} {products.length === 1 ? 'producto' : 'productos'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 sm:gap-x-10 gap-y-12 md:gap-y-16">
            {products.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
