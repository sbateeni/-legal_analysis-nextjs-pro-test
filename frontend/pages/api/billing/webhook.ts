import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { prisma } from '../../../lib/db';

export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-09-30.acacia' });
  const sig = req.headers['stripe-signature'] as string;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  if (!sig || !whSecret) return res.status(400).end();

  const buf = await buffer(req);
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, whSecret);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const organizationId = (sub.metadata as any)?.organizationId || (event.data.object as any)?.metadata?.organizationId;
      if (organizationId) {
        await prisma.subscription.upsert({
          where: { subscriptionId: sub.id },
          create: {
            organizationId,
            provider: 'stripe',
            status: sub.status,
            priceId: sub.items.data[0]?.price?.id || null,
            customerId: sub.customer as string,
            subscriptionId: sub.id,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
          update: {
            status: sub.status,
            priceId: sub.items.data[0]?.price?.id || null,
            customerId: sub.customer as string,
            currentPeriodEnd: new Date(sub.current_period_end * 1000),
          },
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.updateMany({ where: { subscriptionId: sub.id }, data: { status: 'canceled' } });
      break;
    }
  }

  return res.json({ received: true });
}


