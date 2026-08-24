import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { and, eq, or } from 'drizzle-orm';
import { db } from '@/lib/db';
import { orders, paymentWebhooks, payments } from '@/drizzle/schema';

export const runtime = 'nodejs';

function verifyWebhookSignature(body: string, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: 'Razorpay webhook is not configured' }, { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get('x-razorpay-signature');
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const eventType = String(event.event || 'unknown');
  const gatewayOrderId = event.payload?.order?.entity?.id || event.payload?.payment?.entity?.order_id;
  const gatewayPaymentId = event.payload?.payment?.entity?.id;

  try {
    const payment = gatewayOrderId || gatewayPaymentId
      ? await db.query.payments.findFirst({
          where: or(
            gatewayOrderId ? eq(payments.gatewayOrderId, gatewayOrderId) : undefined,
            gatewayPaymentId ? eq(payments.gatewayPaymentId, gatewayPaymentId) : undefined
          )
        })
      : null;

    const [webhookRecord] = await db.insert(paymentWebhooks).values({
      provider: 'razorpay',
      eventType,
      payload: event,
      signature,
      referenceId: payment?.id,
      verified: true,
      processed: false,
      receivedAt: new Date()
    }).returning({ id: paymentWebhooks.id });

    if (payment) {
      const paymentEntity = event.payload?.payment?.entity;
      const isPaid = eventType === 'payment.captured' || eventType === 'order.paid' || paymentEntity?.status === 'captured';
      const isFailed = eventType === 'payment.failed' || paymentEntity?.status === 'failed';
      const nextStatus = isPaid ? 'paid' : isFailed ? 'failed' : payment.status;

      await db.transaction(async (tx) => {
        await tx.update(payments).set({
          status: nextStatus,
          gatewayPaymentId: gatewayPaymentId || payment.gatewayPaymentId,
          failureReason: isFailed ? paymentEntity?.error_description || paymentEntity?.error_reason || 'Razorpay payment failed' : payment.failureReason,
          paidAt: isPaid ? new Date() : payment.paidAt,
          callbackPayload: event,
          updatedAt: new Date()
        }).where(eq(payments.id, payment.id));

        if (isPaid) {
          await tx.update(orders).set({ paymentStatus: 'paid', orderStatus: 'confirmed', updatedAt: new Date() }).where(eq(orders.id, payment.orderId));
        } else if (isFailed) {
          await tx.update(orders).set({ paymentStatus: 'failed', updatedAt: new Date() }).where(eq(orders.id, payment.orderId));
        }

        await tx.update(paymentWebhooks).set({ processed: true, processedAt: new Date() }).where(eq(paymentWebhooks.id, webhookRecord.id));
      });
    } else {
      await db.update(paymentWebhooks).set({ processed: true, processedAt: new Date() }).where(eq(paymentWebhooks.id, webhookRecord.id));
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook processing failed', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
