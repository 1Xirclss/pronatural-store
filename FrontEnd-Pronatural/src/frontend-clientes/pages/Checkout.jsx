import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useCart } from '../../hooks/useCart';
import { useNavigate } from 'react-router-dom';
import { useGlobalData } from '../../context/GlobalDataContext';
import { useAuth } from '../../hooks/useAuth';
import { isValidPhoneNumber } from '../../utils/phoneFormatter';
import PhoneInputField from '../../components/common/PhoneInputField';
import { buildProfessionalWhatsAppMessage } from '../../utils/whatsappHelper';

const DELIVERY_KEY = (userId) => `pronatural_delivery_${userId || 'guest'}`;

export default function Checkout() {
  const { register, handleSubmit, watch, control, reset, formState: { errors } } = useForm();
  const { subtotal, items, clearCart } = useCart();
  const navigate = useNavigate();
  const { addSale, config } = useGlobalData();
  const { user } = useAuth();

  const [isSuccess, setIsSuccess] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedData, setSavedData] = useState(false);

  // Cargar datos guardados del usuario al montar el componente
  useEffect(() => {
    const key = DELIVERY_KEY(user?.id || user?.email);
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        reset(parsed);
        setSavedData(true);
      } catch (e) {
        // Si hay error al parsear, ignorar
      }
    }
  }, [user, reset]);

  const shipping = items.length > 0 ? (Number(config?.deliveryFee) || 0) : 0;
  const total = subtotal + shipping;

  // Abrir WhatsApp y redirigir al inicio después del pedido
  useEffect(() => {
    if (isSuccess && orderSnapshot) {
      clearCart();

      const msg = buildProfessionalWhatsAppMessage({
        saleId: orderSnapshot.saleId,
        items: orderSnapshot.items,
        subtotal: orderSnapshot.subtotal,
        shipping: orderSnapshot.shipping,
        total: orderSnapshot.total,
        customerData: orderSnapshot.customerData
      });

      const phone = (config?.whatsapp || '50369674467').replace(/[^0-9]/g, '');
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      setTimeout(() => window.open(waUrl, '_blank'), 500);

      const timer = setTimeout(() => navigate('/'), 12000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, orderSnapshot, navigate, clearCart, config]);

  // Enviar pedido por WhatsApp
  const onSubmit = async (data) => {
    // Guardar los datos de entrega en localStorage asociados al usuario
    const key = DELIVERY_KEY(user?.id || user?.email);
    localStorage.setItem(key, JSON.stringify(data));
    setSavedData(true);

    setIsProcessing(true);
    const loadingToast = toast.loading('Registrando pedido...');

    try {
      const formattedProducts = items.map(item => ({
        productId: item._id || item.id,
        quantity: item.quantity
      }));

      const savedSale = await addSale({
        customerId: user?.id || null,
        products: formattedProducts,
        total: total,
        paymentMethod: 'whatsapp',
        status: 'Pendiente WhatsApp',
        notes: `Envío a: ${data.address}, ${data.city} ${data.zip || ''}. Correo: ${data.email}. Tel: ${data.phone || ''}`,
      });

      const saleId = savedSale?._id || savedSale?.id || '';

      toast.dismiss(loadingToast);
      setOrderSnapshot({
        items: [...items],
        subtotal,
        shipping,
        total,
        saleId,
        customerData: { ...data }
      });
      setIsSuccess(true);
      toast.success('¡Pedido registrado! Abriendo WhatsApp...');
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('Error al registrar pedido:', error);
      toast.error(error.message || 'Error al registrar el pedido. Intenta de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Pantalla de confirmación exitosa ──────────────────────────────
  if (isSuccess && orderSnapshot) {
    const { items: snapItems, subtotal: snapSubtotal, shipping: snapShipping, total: snapTotal, saleId, customerData } = orderSnapshot;

    const buildWhatsAppUrl = () => {
      const msg = buildProfessionalWhatsAppMessage({
        saleId,
        items: snapItems,
        subtotal: snapSubtotal,
        shipping: snapShipping,
        total: snapTotal,
        customerData
      });
      const phone = (config?.whatsapp || '50369674467').replace(/[^0-9]/g, '');
      return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
    };

    return (
      <div className="min-h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-[#f4f3ec] py-12 px-6">
        <div className="flex flex-col items-center text-center w-full max-w-2xl">
          {/* Ícono de WhatsApp */}
          <div className="w-20 h-20 rounded-full bg-[#25D366] flex items-center justify-center mb-8 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-[#0b2216] mb-4">PEDIDO RECIBIDO</h1>
          <p className="text-[11px] font-bold text-gray-500 tracking-[0.2em] uppercase mb-8">
            CONFIRMA TU PEDIDO POR WHATSAPP
          </p>

          {/* Resumen del pedido */}
          <div className="w-full bg-white p-6 md:p-10 shadow-lg border border-gray-100 mb-8 text-left">
            <h3 className="text-[12px] font-bold tracking-[0.2em] text-[#0b2216] uppercase mb-6 border-b pb-4">
              Detalle del Pedido
            </h3>
            <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
              {snapItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-medium text-gray-800">{item.name}</span>
                    <span className="text-[10px] text-gray-500 tracking-wider">Cantidad: {item.quantity}</span>
                  </div>
                  <span className="text-[12px] font-bold text-[#0b2216]">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase">Subtotal</span>
                <span className="text-[12px] font-medium text-[#0b2216]">${snapSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 tracking-[0.1em] uppercase">Envío</span>
                <span className="text-[12px] font-medium text-[#0b2216]">${snapShipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-[14px] font-bold tracking-[0.2em] text-[#0b2216] uppercase">TOTAL</h3>
                <span className="text-[24px] font-bold text-[#0b2216] leading-none tracking-tighter">${snapTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Botón WhatsApp */}
          <a
            href={buildWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full max-w-sm flex items-center justify-center gap-3 bg-[#25D366] text-white font-bold text-[11px] tracking-[0.2em] uppercase py-4 px-8 hover:bg-[#1ebe57] transition-colors mb-6 shadow-md"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            ENVIAR PEDIDO POR WHATSAPP
          </a>

          <p className="text-[10px] text-gray-400 max-w-md mx-auto mb-6 tracking-widest uppercase">
            Regresando al inicio en 12 segundos...
          </p>
          <div className="flex justify-center items-center opacity-60 animate-pulse">
            <div className="w-2 h-2 bg-[#0b2216] rounded-full mx-1" />
            <div className="w-2 h-2 bg-[#0b2216] rounded-full mx-1" />
            <div className="w-2 h-2 bg-[#0b2216] rounded-full mx-1" />
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario de checkout ────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-100px)] w-full flex flex-col lg:flex-row">

      {/* ── Columna izquierda: datos de envío ── */}
      <div className="w-full lg:w-[60%] p-6 md:p-12 lg:p-24 bg-brand-bg border-b lg:border-b-0 lg:border-r border-gray-100">
        <h1 className="text-5xl md:text-[56px] lg:text-[64px] font-bold tracking-tighter text-[#0b2216] mb-4">PEDIDO</h1>
        <p className="text-[10px] md:text-[11px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-12 md:mb-16">
          COMPLETA TUS DATOS PARA COORDINAR LA ENTREGA
        </p>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <span className="bg-[#0b2216] text-white text-[10px] px-3 py-1 font-bold">01</span>
            <h2 className="text-[13px] font-bold tracking-[0.2em] text-brand-dark uppercase">DATOS DE ENTREGA</h2>
          </div>
          {savedData && (
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-green-700 tracking-widest uppercase bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              Datos guardados
            </span>
          )}
        </div>
        <form
          id="checkout-form"
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-8 md:gap-y-12 mb-16"
        >
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Correo Electrónico
            </label>
            <input
              type="email"
              placeholder="EJEMPLO@GMAIL.COM"
              {...register('email', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <span className="text-red-500 text-[9px] mt-1 block">{errors.email.message}</span>}
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="JANE DOE"
              {...register('name', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <span className="text-red-500 text-[9px] mt-1 block">{errors.name.message}</span>}
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Teléfono de Contacto
            </label>
            <Controller
              name="phone"
              control={control}
              rules={{
                required: 'Teléfono requerido',
                validate: (val) => isValidPhoneNumber(val) || 'El teléfono debe tener 8 dígitos (ej: +503 7000-0000)'
              }}
              render={({ field }) => (
                <PhoneInputField
                  value={field.value || ''}
                  onChange={field.onChange}
                  error={errors.phone?.message}
                  darkTheme={false}
                />
              )}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">Dirección</label>
            <input
              type="text"
              placeholder="DIRECCIÓN DE LA CALLE"
              {...register('address', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.address && <span className="text-red-500 text-[9px] mt-1 block">{errors.address.message}</span>}
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Ciudad/Departamento
            </label>
            <input
              type="text"
              placeholder="SAN SALVADOR"
              {...register('city', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.city && <span className="text-red-500 text-[9px] mt-1 block">{errors.city.message}</span>}
          </div>
          <div>
            <label className="block text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase mb-3">
              Código Postal
            </label>
            <input
              type="text"
              placeholder="1101"
              {...register('zip', { required: 'Requerido' })}
              className={`w-full border-b py-2 text-[12px] bg-transparent focus:outline-none focus:border-brand-dark uppercase transition-colors ${errors.zip ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.zip && <span className="text-red-500 text-[9px] mt-1 block">{errors.zip.message}</span>}
          </div>
        </form>
      </div>

      {/* ── Columna derecha: resumen y método WhatsApp ── */}
      <div className="w-full lg:w-[40%] bg-[#f4f3ec] p-6 md:p-12 lg:p-24 flex flex-col">

        <div className="flex items-center gap-4 mb-12">
          <span className="bg-[#25D366] text-white text-[10px] px-3 py-1 font-bold">02</span>
          <h2 className="text-[13px] font-bold tracking-[0.2em] text-[#0b2216] uppercase">PAGO POR WHATSAPP</h2>
        </div>

        {/* Info WhatsApp */}
        <div className="bg-white p-8 shadow-sm border border-[#25D366]/40 mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#0b2216] tracking-wide uppercase">Pago coordinado por WhatsApp</p>
              <p className="text-[9px] text-gray-400 tracking-widest uppercase mt-0.5">Transferencia / Efectivo / Depósito</p>
            </div>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Al confirmar tu pedido, te contactaremos por WhatsApp para coordinar el método de pago y la entrega. ¡Sin complicaciones!
          </p>
        </div>

        {/* Resumen y botón */}
        <div className="mt-auto pt-10 border-t border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase">SUBTOTAL</span>
            <span className="text-[13px] font-medium text-[#0b2216]">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-10">
            <span className="text-[9px] font-bold text-gray-500 tracking-[0.15em] uppercase">ENVÍO (Repartidor Propio)</span>
            <span className="text-[13px] font-medium text-[#0b2216]">${shipping.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h3 className="text-[16px] font-bold tracking-[0.2em] text-[#0b2216] uppercase mb-1">TOTAL</h3>
              <p className="text-[8px] text-gray-400 tracking-widest uppercase">Coordinado por WhatsApp</p>
            </div>
            <span className="text-[36px] font-bold text-[#0b2216] leading-none tracking-tighter">${total.toFixed(2)}</span>
          </div>

          <button
            form="checkout-form"
            type="submit"
            disabled={isProcessing}
            className="w-full bg-[#25D366] text-white flex justify-between items-center px-10 py-6 hover:bg-[#1ebe57] transition-colors group mb-8 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase">
              {isProcessing ? 'REGISTRANDO...' : 'PEDIR POR WHATSAPP'}
            </span>
            {isProcessing ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            )}
          </button>

          <div className="flex justify-center items-center opacity-60">
            <svg className="w-3.5 h-3.5 text-gray-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="text-[8px] text-gray-400 tracking-widest uppercase">Pedido seguro vía WhatsApp Business</span>
          </div>
        </div>
      </div>
    </div>
  );
}
