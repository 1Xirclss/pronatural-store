/**
 * Generador de mensajes profesionales estructurados para WhatsApp (Sin Emojis).
 * Incluye código corto de orden, ID de transacción de la base de datos,
 * desglose de productos y datos del cliente.
 */
export function buildProfessionalWhatsAppMessage({ saleId, items, subtotal, shipping, total, customerData }) {
  const rawId = String(saleId || '');
  const shortRef = rawId ? (rawId.length > 6 ? rawId.slice(-6).toUpperCase() : rawId.toUpperCase()) : 'REF-N/A';

  const productLines = (items || []).map(
    item => `  • *${item.quantity}x* ${item.name || item.title} — $${(item.price * item.quantity).toFixed(2)}`
  ).join('\n');

  const customerName = customerData?.name || 'Cliente ProNatural';
  const zip = customerData?.zip ? `, CP ${customerData.zip}` : '';
  const address = customerData?.address
    ? `${customerData.address}${customerData.city ? ', ' + customerData.city : ''}${zip}`
    : 'Por coordinar';
  const email = customerData?.email || 'No especificado';
  const phone = customerData?.phone || 'No especificado';

  return [
    '*PRONATURAL STORE - NUEVA ORDEN*',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `*CÓDIGO DE ORDEN:* \`#${shortRef}\``,
    `*ID DE TRANSACCIÓN:* \`${rawId}\``,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '*DETALLE DE PRODUCTOS:*',
    productLines,
    '',
    '────────────────────────────',
    '*DESGLOSE DE PAGO:*',
    `   • Subtotal: $${(subtotal || 0).toFixed(2)}`,
    `   • Envío: $${(shipping || 0).toFixed(2)}`,
    `   • *TOTAL A PAGAR: $${(total || 0).toFixed(2)} USD*`,
    '────────────────────────────',
    '',
    '*DATOS DE ENVÍO Y CLIENTE:*',
    `   • *Cliente:* ${customerName}`,
    `   • *Dirección:* ${address}`,
    `   • *Correo:* ${email}`,
    `   • *Teléfono:* ${phone}`,
    '',
    '*Método de Pago:* Transferencia / Efectivo vía WhatsApp',
    '*Estado:* _Pendiente de Confirmación_',
    '',
    '¡Hola! He iniciado mi pedido desde la tienda en línea. Adjunto mi comprobante de orden para coordinar el pago y el envío.'
  ].join('\n');
}
