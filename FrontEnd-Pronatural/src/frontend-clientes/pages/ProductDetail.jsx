import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useGlobalData } from '../../context/GlobalDataContext';
import { getCloudinaryUrl } from '../../utils/cloudinary';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { products } = useGlobalData();
  
  const product = products.find(p => String(p._id || p.id) === String(id));

  if (!product) {
    return (
      <div className="p-8 text-center text-red-600 font-bold uppercase tracking-widest text-xs bg-[#fdfbf7] min-h-[calc(100vh-80px)] flex items-center justify-center">
        Producto no encontrado.
      </div>
    );
  }

  // 1. Datos dinámicos del producto provenientes del Admin
  const productName = product.name || product.nombreProducto || 'PRODUCTO PRONATURAL';
  const nameParts = productName.split('\n');
  const price = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const category = (product.category || product.idCategoria?.nombre || product.categoria || '').trim();
  const description = product.desc || product.descripcion || '';
  const stock = typeof product.stock === 'number' ? product.stock : 0;
  const sku = product.sku || '';

  const imageUrl = (product.img && (product.img.startsWith('http') || product.img.startsWith('data:'))) 
    ? product.img 
    : getCloudinaryUrl(product.img || product.imagen);

  // 2. Extracción dinámica de especificaciones existentes
  let specs = {};
  if (product.specs) {
    if (typeof product.specs === 'object' && product.specs !== null && !Array.isArray(product.specs)) {
      specs = product.specs;
    } else if (typeof product.specs === 'string') {
      try {
        const parsed = JSON.parse(product.specs);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          specs = parsed;
        }
      } catch (e) {
        specs = {};
      }
    }
  }

  if (!specs.ORIGEN && product.origin) {
    specs.ORIGEN = product.origin;
  }

  // Filtrar solo especificaciones válidas con llaves alfanuméricas legibles (evitar índices numéricos)
  const validSpecs = Object.entries(specs).filter(([key, val]) => 
    isNaN(Number(key)) && Boolean(val && typeof val !== 'object' && String(val).trim())
  );

  const origen = specs.ORIGEN || specs['ORIGEN TÉCNICO'] || specs.origen || product.origin || null;
  const sabores = specs.SABOR ? String(specs.SABOR).split(',').map(s => s.trim()).filter(Boolean) : [];
  const intensidad = specs.INTENSIDAD || specs.intensidad || null;

  // 3. Construcción dinámica de cajas de variante (solo de lo que exista)
  const variantBoxes = [];
  
  if (sabores.length > 0) {
    sabores.forEach(sabor => {
      variantBoxes.push({ label: sabor.toUpperCase(), subtitle: null });
    });
  } else if (category) {
    variantBoxes.push({ label: category.toUpperCase(), subtitle: null });
  }

  if (intensidad) {
    variantBoxes.push({ label: intensidad.toUpperCase(), subtitle: 'INTENSIDAD' });
  } else if (variantBoxes.length < 2) {
    variantBoxes.push({ label: '100% ORGÁNICO', subtitle: null });
  }

  const handleAddToCart = () => {
    if (stock <= 0) return;
    addItem({
      ...product,
      title: productName,
      image: product.img || product.imagen
    });
    navigate('/carrito');
  };

  return (
    <div className="flex flex-col w-full bg-[#fdfbf7]">
      
      {/* Sección Superior: Imagen Original Cover + Panel de Información Dinámico */}
      <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-80px)]">
        
        {/* LADO IZQUIERDO: Imagen Original (1/2 pantalla cover) */}
        <div className="w-full lg:w-1/2 relative min-h-[50vh] lg:min-h-full">
          <img
            src={imageUrl}
            alt={productName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Badge de Origen Técnico (Solo si el admin cargó el dato de Origen) */}
          {origen && (
            <div className="absolute bottom-10 left-10 bg-[#e8e6e1]/90 backdrop-blur-sm px-6 py-4 shadow-lg border border-white/20">
              <p className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-1.5">ORIGEN TÉCNICO</p>
              <p className="text-[13px] font-bold text-[#0a2016] tracking-widest uppercase">{origen}</p>
            </div>
          )}
        </div>

        {/* LADO DERECHO: Información Dinámica */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-12 lg:py-20 bg-[#fdfbf7]">
          
          {/* Subtítulo dinámico: SKU / Categoría */}
          <p className="text-[10px] font-bold text-[#c25e1a] tracking-[0.2em] uppercase mb-4">
            {sku ? `BATCH / SKU: ${sku}` : (category ? `CATEGORÍA: ${category.toUpperCase()}` : 'LOTE SELECCIONADO')}
          </p>

          {/* Nombre del producto */}
          <h1 className="text-[36px] sm:text-[48px] lg:text-[68px] font-bold leading-[0.95] tracking-tighter text-[#0a2016] mb-6 uppercase break-words">
            {nameParts.map((line, i) => (
              <span key={i}>{line}{i < nameParts.length - 1 && <br />}</span>
            ))}
          </h1>

          {/* Precio */}
          <p className="text-[24px] sm:text-[30px] lg:text-[36px] font-bold text-[#0a2016] mb-8">
            ${price.toFixed(2)}
          </p>

          {/* Cajas de Variantes (Dinamizadas) */}
          {variantBoxes.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-10">
              {variantBoxes.map((box, index) => (
                <div 
                  key={index}
                  className={`px-6 py-4 flex flex-col items-center justify-center min-w-[120px] ${
                    index === 0 ? 'bg-[#0a2016] text-white' : 'bg-[#e8e6e1] text-[#0a2016]'
                  }`}
                >
                  {box.subtitle && (
                    <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-[#c25e1a] mb-1">
                      {box.subtitle}
                    </span>
                  )}
                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase">{box.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Botón Añadir al Carrito */}
          <button
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className={`w-full text-white flex justify-between items-center px-8 py-5 transition-colors group cursor-pointer ${
              stock <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#0a2016] hover:bg-[#123827]'
            }`}
          >
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
              {stock <= 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO'}
            </span>
            {stock > 0 && (
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform text-[#4ade80]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path>
              </svg>
            )}
          </button>

          {/* Indicador de Inventario */}
          {stock > 0 && stock <= 5 && (
            <p className="text-[10px] font-bold text-[#c25e1a] tracking-[0.15em] uppercase mt-4">
              ¡Quedan únicamente {stock} unidades disponibles!
            </p>
          )}
          {stock <= 0 && (
            <p className="text-[10px] font-bold text-red-600 tracking-[0.15em] uppercase mt-4">
              Producto agotado temporalmente.
            </p>
          )}
        </div>
      </div>

      {/* Sección Inferior: Especificaciones Técnicas o Descripción Dinámica */}
      <div className="w-full bg-[#fdfbf7] px-6 sm:px-12 lg:px-24 py-12 lg:py-24 flex flex-col lg:flex-row gap-12 lg:gap-20 border-t border-[#e8e6e1]">
        
        {/* Columna Izquierda: Título y Descripción */}
        <div className={`w-full ${validSpecs.length > 0 ? 'lg:w-1/3' : 'lg:w-full max-w-4xl'}`}>
          <h2 className="text-[26px] lg:text-[32px] font-bold tracking-tighter text-[#0a2016] mb-6 leading-[1.05]">
            {validSpecs.length > 0 ? (
              <>ESPECIFICACIONES<br />TÉCNICAS</>
            ) : (
              'DESCRIPCIÓN DEL PRODUCTO'
            )}
          </h2>
          <p className="text-[13px] text-gray-600 leading-[1.8] max-w-md">
            {description || 'Este producto cumple con los estrictos controles de calidad de ProNatural para ofrecerte la mejor experiencia orgánica.'}
          </p>
        </div>

        {/* Columna Derecha: Tabla Dinámica de Especificaciones (Solo se renderiza si existen datos en el admin) */}
        {validSpecs.length > 0 && (
          <div className="w-full lg:w-2/3 max-w-4xl">
            <div className="space-y-0">
              {validSpecs.map(([key, value]) => {
                const displayKey = key === 'PROCESO' ? 'NIVEL DE ASADO' : key;
                return (
                  <div key={key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e8e6e1] py-6 first:pt-0 gap-2">
                    <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase shrink-0 w-48">{displayKey}</span>
                    <span className="text-[14px] font-bold text-[#0a2016] tracking-wide uppercase sm:text-right flex-1">{value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
