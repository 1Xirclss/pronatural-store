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
      <div className="grid w-full lg:min-h-[calc(100vh-80px)] lg:grid-cols-2">
        
        {/* LADO IZQUIERDO: Imagen Original (1/2 pantalla cover) */}
        <div className="relative min-h-[48vh] w-full overflow-hidden bg-[#e8e6e1] sm:min-h-[58vh] lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] lg:min-h-0">
          <img
            src={imageUrl}
            alt={productName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Badge de Origen Técnico (Solo si el admin cargó el dato de Origen) */}
          {origen && (
            <div className="absolute bottom-5 left-5 max-w-[calc(100%-2.5rem)] border border-white/30 bg-[#fdfbf7]/90 px-4 py-3 shadow-lg backdrop-blur-md sm:bottom-8 sm:left-8 sm:px-5 sm:py-4">
              <p className="text-[9px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-1.5">ORIGEN TÉCNICO</p>
              <p className="text-[11px] font-bold tracking-[0.12em] text-[#0a2016] uppercase sm:text-[12px]">{origen}</p>
            </div>
          )}
        </div>

        {/* LADO DERECHO: Información Dinámica */}
        <div className="flex w-full flex-col bg-[#fdfbf7] px-5 py-8 sm:px-9 sm:py-10 lg:h-[calc(100vh-80px)] lg:min-h-0 lg:overflow-y-auto lg:px-10 xl:px-14 xl:py-12">
          
          {/* Subtítulo dinámico: SKU / Categoría */}
          <p className="mb-3 text-[9px] font-bold tracking-[0.18em] text-[#b45309] uppercase sm:text-[10px]">
            {sku ? `BATCH / SKU: ${sku}` : (category ? `CATEGORÍA: ${category.toUpperCase()}` : 'LOTE SELECCIONADO')}
          </p>

          {/* Nombre del producto */}
          <h1 className="mb-4 break-words text-[34px] font-bold leading-[0.98] tracking-[-0.045em] text-[#0a2016] uppercase sm:text-[44px] lg:text-[clamp(2.2rem,3.4vw,3.8rem)]">
            {nameParts.map((line, i) => (
              <span key={i}>{line}{i < nameParts.length - 1 && <br />}</span>
            ))}
          </h1>

          {/* Precio */}
          <p className="mb-4 text-[27px] font-bold tracking-tight text-[#0a2016] sm:text-[30px]">
            ${price.toFixed(2)}
          </p>

          <div className="mb-5 max-w-2xl">
            <h2 className="mb-1.5 text-[9px] font-bold tracking-[0.16em] text-[#849087] uppercase">Sobre este producto</h2>
            <p className="text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">
              {description || 'Calidad natural seleccionada por ProNatural para tu bienestar.'}
            </p>
          </div>

          {validSpecs.length > 0 && (
            <div className="mb-5 border-y border-[#e9e7df] py-3.5">
              <h2 className="mb-2.5 text-[9px] font-bold tracking-[0.16em] text-[#849087] uppercase">Detalles del producto</h2>
              <dl className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
                {validSpecs.map(([key, value]) => (
                  <div key={key} className="flex min-w-0 items-start justify-between gap-3 border-b border-[#eeece6] py-2 last:border-0 sm:[&:nth-last-child(-n+2)]:border-0">
                    <dt className="shrink-0 text-[9px] font-bold tracking-[0.1em] text-gray-400 uppercase">{key}</dt>
                    <dd className="text-right text-[11px] font-semibold leading-snug text-[#173c2b]">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Cajas de Variantes (Dinamizadas) */}
          {variantBoxes.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {variantBoxes.map((box, index) => (
                <div 
                  key={index}
                  className={`flex min-h-10 min-w-[108px] flex-col items-center justify-center rounded-md px-4 py-2.5 ${
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
            className={`group flex min-h-14 w-full items-center justify-between rounded-lg px-5 py-4 text-white transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#0a2016] ${
              stock <= 0 ? 'cursor-not-allowed bg-gray-400' : 'cursor-pointer bg-[#0a2016] hover:-translate-y-0.5 hover:bg-[#123827] hover:shadow-lg'
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
    </div>
  );
}
