import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-09-30.acacia' });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const session = await getServerSession(req, res, authOptions);
  if (!session || !(session as any).userId) return res.status(401).json({ error: 'unauthorized' });
  const userId = (session as any).userId as string;

  const org = await prisma.organization.findFirst({
    where: { memberships: { some: { userId } } },
  });
  if (!org) return res.status(400).json({ error: 'no_org' });

  const priceId = process.env.STRIPE_PRICE_ID_BASIC as string;
  if (!priceId || !process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'stripe_not_configured' });

  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?status=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard?status=cancel`,
    metadata: { organizationId: org.id },
  });

  return res.json({ url: checkout.url });
}


