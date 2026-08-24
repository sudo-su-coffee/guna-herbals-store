/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/api';
import { db } from '@/lib/db';
import { orders } from '@/drizzle/schema';

export const runtime = 'nodejs';

type DocumentType = 'receipt' | 'packing-slip' | 'order-slip';

const allowedTypes = new Set<DocumentType>(['receipt', 'packing-slip', 'order-slip']);

function text(value: unknown, fallback = '—') {
  const result = String(value ?? '').trim();
  return result || fallback;
}

function drawWrapped(page: any, value: unknown, options: { x: number; y: number; maxWidth: number; size: number; font: any; color: any; lineGap?: number }) {
  const words = text(value).split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (options.font.widthOfTextAtSize(candidate, options.size) > options.maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  const lineGap = options.lineGap ?? options.size + 4;
  lines.forEach((line, index) => page.drawText(line, { ...options, y: options.y - index * lineGap }));
  return options.y - lines.length * lineGap;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const currentUser = await getCurrentUser();
  if (!currentUser.success || !currentUser.data || !['admin', 'staff'].includes(currentUser.data.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) return new Response('Invalid order id', { status: 400 });

  const requestedType = new URL(request.url).searchParams.get('type') as DocumentType | null;
  const type: DocumentType = requestedType && allowedTypes.has(requestedType) ? requestedType : 'receipt';

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true, payment: true, shipments: true },
  });
  if (!order) return new Response('Order not found', { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.12, 0.18, 0.14);
  const muted = rgb(0.38, 0.42, 0.39);
  const accent = rgb(0.23, 0.34, 0.23);
  const rule = rgb(0.85, 0.87, 0.84);
  const address = (order.shippingAddress || {}) as Record<string, unknown>;
  const payment = order.payment as any;
  const shipment = order.shipments?.[0] as any;
  const title = type === 'packing-slip' ? 'Packing slip' : type === 'order-slip' ? 'Order slip' : 'Tax invoice / receipt';

  page.drawText("GUNA'S HERBALS", { x: 48, y: 780, size: 20, font: bold, color: accent });
  page.drawText(title, { x: 48, y: 752, size: 11, font: regular, color: muted });
  page.drawText(order.orderNumber, { x: 400, y: 780, size: 11, font: bold, color: ink });
  page.drawText(new Date(order.createdAt).toLocaleDateString('en-IN'), { x: 400, y: 762, size: 10, font: regular, color: muted });
  page.drawLine({ start: { x: 48, y: 735 }, end: { x: 547, y: 735 }, thickness: 1, color: rule });

  let y = 706;
  page.drawText('SHIP TO', { x: 48, y, size: 9, font: bold, color: muted });
  y -= 18;
  y = drawWrapped(page, text(address.name, 'Guest customer'), { x: 48, y, maxWidth: 220, size: 10, font: bold, color: ink });
  y = drawWrapped(page, text(address.address || address.addressLine1), { x: 48, y: y - 2, maxWidth: 220, size: 10, font: regular, color: ink });
  y = drawWrapped(page, [address.city, address.state, address.postalCode || address.zip].filter(Boolean).join(', '), { x: 48, y: y - 2, maxWidth: 220, size: 10, font: regular, color: ink });
  page.drawText(`Phone: ${text(address.phone)}`, { x: 48, y: y - 2, size: 10, font: regular, color: muted });
  page.drawText(`Payment: ${text(order.paymentMethod).toUpperCase()} · ${text(order.paymentStatus).toUpperCase()}`, { x: 330, y: 706, size: 10, font: bold, color: ink });
  page.drawText(`Order status: ${text(order.orderStatus).replaceAll('_', ' ')}`, { x: 330, y: 688, size: 10, font: regular, color: muted });
  if (payment) page.drawText(`Payment record: #${payment.id}`, { x: 330, y: 670, size: 10, font: regular, color: muted });
  if (shipment) page.drawText(`Courier: ${text(shipment.courierName)}`, { x: 330, y: 652, size: 10, font: regular, color: muted });

  y = 575;
  page.drawLine({ start: { x: 48, y: y + 18 }, end: { x: 547, y: y + 18 }, thickness: 1, color: rule });
  page.drawText('ITEM', { x: 48, y, size: 9, font: bold, color: muted });
  page.drawText('SKU', { x: 292, y, size: 9, font: bold, color: muted });
  page.drawText('QTY', { x: 405, y, size: 9, font: bold, color: muted });
  if (type !== 'packing-slip') page.drawText('AMOUNT', { x: 468, y, size: 9, font: bold, color: muted });
  y -= 24;

  for (const item of order.items) {
    page.drawText(text(item.productName).slice(0, 38), { x: 48, y, size: 10, font: regular, color: ink });
    page.drawText(text(item.sku).slice(0, 18), { x: 292, y, size: 9, font: regular, color: muted });
    page.drawText(String(item.quantity), { x: 410, y, size: 10, font: regular, color: ink });
    if (type !== 'packing-slip') page.drawText(`INR ${Number(item.totalAmount || 0).toFixed(2)}`, { x: 468, y, size: 10, font: regular, color: ink });
    y -= 20;
  }

  if (type !== 'packing-slip') {
    y -= 16;
    page.drawLine({ start: { x: 330, y: y + 10 }, end: { x: 547, y: y + 10 }, thickness: 1, color: rule });
    const totals = [['Subtotal', order.subtotal], ['Shipping', order.shippingCharge], ['Tax', order.taxAmount], ['Discount', order.discountAmount], ['Total', order.totalAmount]];
    for (const [label, value] of totals) {
      const isTotal = label === 'Total';
      page.drawText(label, { x: 350, y, size: isTotal ? 11 : 10, font: isTotal ? bold : regular, color: isTotal ? ink : muted });
      page.drawText(`INR ${Number(value || 0).toFixed(2)}`, { x: 468, y, size: isTotal ? 11 : 10, font: isTotal ? bold : regular, color: ink });
      y -= 20;
    }
  } else {
    page.drawText('Pack and verify every SKU and quantity before sealing.', { x: 48, y: 94, size: 10, font: regular, color: accent });
  }

  if (type === 'order-slip') {
    page.drawText(`Internal notes: ${text(order.internalNotes)}`, { x: 48, y: 128, size: 10, font: regular, color: muted });
  } else if (type === 'receipt') {
    page.drawText(`Payment record: ${payment ? `#${payment.id} · ${text(payment.status)}` : 'Pending ledger entry'}`, { x: 48, y: 128, size: 10, font: regular, color: muted });
    page.drawText('Thank you for choosing thoughtful everyday care.', { x: 48, y: 82, size: 10, font: regular, color: accent });
  }

  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${order.orderNumber}-${type}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
