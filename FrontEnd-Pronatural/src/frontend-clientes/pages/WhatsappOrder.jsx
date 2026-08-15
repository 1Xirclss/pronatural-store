import { Link } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { toast } from 'react-hot-toast';
import { useGlobalData } from '../../context/GlobalDataContext';
import { buildProfessionalWhatsAppMessage } from '../../utils/whatsappHelper';

export default function WhatsappOrder() {
  const { items, subtotal, clearCart } = useCart();
  const { addSale, config } = useGlobalData();
  const c = config || {};
  const shipping = items.length > 0 ? 12.00 : 0;
  const total = subtotal + shipping;

  const handleWhatsappRedirect = async () => {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }

    try {
      const formattedProducts = items.map(item => ({
        productId: item._id || item.id,
        quantity: item.quantity
      }));

      const savedSale = await addSale({
        customerId: null,
        products: formattedProducts,
        total: total,
        paymentMethod: 'whatsapp',
        status: 'Pendiente WhatsApp',
        notes: 'Pedido iniciado directamente vía botón de WhatsApp'
      });

      const saleId = savedSale?._id || savedSale?.id || '';

      const message = buildProfessionalWhatsAppMessage({
        saleId,
        items,
        subtotal,
        shipping,
        total,
        customerData: {
          name: 'Cliente Tienda Web',
          address: 'Por coordinar vía WhatsApp',
          email: 'Por coordinar',
          phone: 'Por coordinar'
        }
      });

      const encodedMessage = encodeURIComponent(message);
      const whatsappNumber = (c.whatsapp || "50369674467").replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

      clearCart();
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      console.error('Error al registrar venta por whatsapp:', error);
      toast.error('Error al procesar el pedido.');
    }
  };
  return (
    <div className="min-h-[calc(100vh-80px)] bg-brand-bg flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-green-900/5 blur-3xl pointer-events-none"></div>
      <div className="w-full max-w-lg bg-white border border-gray-100 shadow-xl p-10 md:p-14 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-[#25D366]/10 rounded-full flex items-center justify-center text-[#25D366] shadow-inner">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.031 0C5.385 0 0 5.386 0 12.03c0 2.128.552 4.195 1.6 6.014L.045 23.955l6.064-1.589A12.006 12.006 0 0012.031 24c6.645 0 12.031-5.385 12.031-12.03S18.677 0 12.031 0zm0 22.015c-1.8 0-3.565-.483-5.112-1.4l-.367-.217-3.8.995 1.015-3.705-.238-.378C2.476 15.545 1.969 13.82 1.969 12.03 1.969 6.486 6.487 1.984 12.031 1.984c5.543 0 10.046 4.502 10.046 10.046 0 5.543-4.503 10.046-10.046 9.985zM17.54 14.5c-.302-.152-1.794-.886-2.073-.988-.278-.101-.481-.152-.684.152-.202.304-.783.988-.961 1.19-.177.203-.354.228-.657.076-1.547-.768-2.684-1.391-3.712-2.73-.243-.316-.011-.476.128-.642.278-.335.532-.614.733-.842.152-.178.203-.304.304-.507.101-.203.05-.38-.026-.532-.076-.152-.683-1.646-.936-2.253-.247-.594-.499-.513-.684-.523h-.583c-.202 0-.532.076-.811.38-.278.304-1.064 1.04-1.064 2.533 0 1.494 1.089 2.937 1.24 3.14.152.203 2.14 3.266 5.187 4.582 2.215.955 2.879.882 3.424.743.619-.158 1.794-.734 2.047-1.443.253-.71.253-1.317.177-1.443-.075-.126-.277-.202-.581-.354z"></path>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tighter text-center text-brand-dark mb-4">
          PEDIDO POR WHATSAPP
        </h1>
        <p className="text-[12px] text-gray-500 text-center leading-relaxed mb-10 font-medium">
          Habla directamente con uno de nuestros asesores para coordinar el pago, el método de envío y finalizar tu orden.
        </p>
        <div className="bg-[#f4f3ec] p-6 mb-10 border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total a coordinar</p>
            <p className="text-[20px] font-bold text-brand-dark">${total.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Artículos</p>
            <p className="text-[14px] font-medium text-brand-dark">{items.length}</p>
          </div>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleWhatsappRedirect}
            className="w-full bg-[#25D366] text-white flex justify-center items-center py-5 hover:bg-[#20b858] transition-colors shadow-lg shadow-[#25D366]/30 cursor-pointer"
          >
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">Ir al Chat</span>
            <svg className="w-4 h-4 ml-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg>
          </button>
          <Link
            to="/carrito"
            className="w-full flex justify-center text-[10px] font-bold tracking-[0.2em] text-gray-400 hover:text-brand-dark uppercase transition-colors pt-4"
          >
            VOLVER AL CARRITO
          </Link>
        </div>
      </div>
    </div>
  );
}
