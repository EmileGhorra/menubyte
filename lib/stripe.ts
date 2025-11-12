import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY ?? '';

if (!STRIPE_SECRET_KEY) {
  console.warn('[stripe] STRIPE_SECRET_KEY is missing. Billing routes will be disabled.');
}

export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-10-29.clover',
      appInfo: {
        name: 'MenuByte',
      },
    })
  : null;

export const STRIPE_PRICE_IDS = {
  proMonthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? '',
  proAnnual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? '',
};

const defaultDashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/dashboard/billing`;

export const STRIPE_RETURN_URLS = {
  success: process.env.STRIPE_SUCCESS_URL ?? `${defaultDashboardUrl}?status=success`,
  cancel: process.env.STRIPE_CANCEL_URL ?? `${defaultDashboardUrl}?status=cancelled`,
};
