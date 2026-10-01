import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/api';
import { db } from '@/lib/db';
import { orderItems, orders } from '@/drizzle/schema';

export const runtime = 'nodejs';

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user.success || !user.data) return new Response('Unauthorized', { status: 401 });

  const { id } = await context.params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) return new Response('Invalid order id', { status: 400 });

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  });
  if (!order || order.userId !== user.data.id) return new Response('Order not found', { status: 404 });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.12, 0.18, 0.14);
  const muted = rgb(0.38, 0.42, 0.39);
  const accent = rgb(0.23, 0.34, 0.23);

  page.drawText("GUNA'S HERBALS", { x: 48, y: 780, size: 20, font: bold, color: accent });
  page.drawText('Order receipt', { x: 48, y: 752, size: 11, font: regular, color: muted });
  page.drawText(order.orderNumber, { x: 400, y: 780, size: 11, font: bold, color: ink });
  page.drawText(new Date(order.createdAt).toLocaleDateString('en-IN'), { x: 400, y: 762, size: 10, font: regular, color: muted });
  page.drawLine({ start: { x: 48, y: 735 }, end: { x: 547, y: 735 }, thickness: 1, color: rgb(0.85, 0.87, 0.84) });

  let y = 700;
  page.drawText('ITEM', { x: 48, y, size: 9, font: bold, color: muted });
  page.drawText('QTY', { x: 390, y, size: 9, font: bold, color: muted });
  page.drawText('AMOUNT', { x: 468, y, size: 9, font: bold, color: muted });
  y -= 24;

  for (const item of order.items) {
    page.drawText(String(item.productName).slice(0, 48), { x: 48, y, size: 10, font: regular, color: ink });
    page.drawText(String(item.quantity), { x: 395, y, size: 10, font: regular, color: ink });
    page.drawText(`INR ${Number(item.totalAmount).toFixed(2)}`, { x: 468, y, size: 10, font: regular, color: ink });
    y -= 20;
  }

  y -= 16;
  page.drawLine({ start: { x: 330, y: y + 10 }, end: { x: 547, y: y + 10 }, thickness: 1, color: rgb(0.85, 0.87, 0.84) });
  const totals = [
    ['Subtotal', order.subtotal],
    ['Shipping', order.shippingCharge],
    ['Tax', order.taxAmount],
    ['Discount', order.discountAmount],
    ['Total', order.totalAmount],
  ];
  for (const [label, value] of totals) {
    page.drawText(String(label), { x: 350, y, size: label === 'Total' ? 11 : 10, font: label === 'Total' ? bold : regular, color: label === 'Total' ? ink : muted });
    page.drawText(`INR ${Number(value || 0).toFixed(2)}`, { x: 468, y, size: label === 'Total' ? 11 : 10, font: label === 'Total' ? bold : regular, color: ink });
    y -= 20;
  }

  page.drawText(`Payment: ${order.paymentMethod}`, { x: 48, y: 160, size: 10, font: regular, color: muted });
  page.drawText(`Payment status: ${order.paymentStatus}`, { x: 48, y: 142, size: 10, font: regular, color: muted });
  page.drawText('Thank you for choosing thoughtful everyday care.', { x: 48, y: 82, size: 10, font: regular, color: accent });

  const bytes = await pdf.save();
  return new Response(new Uint8Array(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${order.orderNumber}-receipt.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  });
}
