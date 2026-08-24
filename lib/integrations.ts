import 'server-only';

export type IntegrationName = 'media' | 'support' | 'analytics' | 'notifications' | 'payments' | 'auth';

export function getIntegrationConfig() {
  return {
    media: process.env.MEDIA_PROVIDER || 'cloudinary',
    support: process.env.SUPPORT_PROVIDER || 'chatwoot',
    analytics: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'posthog' : 'disabled',
    notifications: process.env.SENDGRID_API_KEY ? 'sendgrid' : 'unconfigured',
    payments: process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? 'razorpay' : 'unconfigured',
    auth: process.env.AUTH_PROVIDER || 'local',
  } as const;
}

export function cloudinaryDeliveryUrl(publicId: string, options?: { width?: number; height?: number; crop?: 'fill' | 'fit' | 'thumb' }) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName || !publicId) return publicId;
  const transformations = [
    options?.width ? `w_${options.width}` : '',
    options?.height ? `h_${options.height}` : '',
    options?.crop ? `c_${options.crop}` : '',
    'f_auto',
    'q_auto',
  ].filter(Boolean).join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

export function supportConversationUrl(conversationId: string | number) {
  const baseUrl = process.env.SUPPORT_BASE_URL?.replace(/\/$/, '');
  if (!baseUrl || !conversationId) return null;
  return `${baseUrl}/app/accounts/${process.env.SUPPORT_ACCOUNT_ID || '1'}/conversations/${conversationId}`;
}

export function supportWidgetConfig() {
  const websiteToken = process.env.SUPPORT_WEBSITE_TOKEN;
  const baseUrl = process.env.SUPPORT_BASE_URL?.replace(/\/$/, '');
  if (!websiteToken || !baseUrl) return null;
  return { websiteToken, baseUrl };
}

export type TransactionalEmail = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendTransactionalEmail(email: TransactionalEmail) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM_EMAIL || process.env.NOTIFICATIONS_FROM_EMAIL;
  if (!apiKey || !from) return { sent: false, skipped: true, reason: 'SENDGRID_NOT_CONFIGURED' as const };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: email.to }] }],
      from: { email: from, name: process.env.SENDGRID_FROM_NAME || "Guna's Herbals" },
      subject: email.subject,
      content: [
        { type: 'text/plain', value: email.text },
        ...(email.html ? [{ type: 'text/html', value: email.html }] : [])
      ]
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('SendGrid email failed', { status: response.status, detail });
    throw new Error('Transactional email delivery failed');
  }
  return { sent: true, skipped: false };
}
