import 'server-only';

export type IntegrationName = 'media' | 'support' | 'analytics' | 'notifications' | 'payments' | 'auth';

export function getIntegrationConfig() {
  return {
    media: process.env.MEDIA_PROVIDER || 'cloudinary',
    support: process.env.SUPPORT_PROVIDER || 'chatwoot',
    analytics: process.env.NEXT_PUBLIC_POSTHOG_KEY ? 'posthog' : 'disabled',
    notifications: process.env.NOTIFICATIONS_PROVIDER || 'unconfigured',
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
