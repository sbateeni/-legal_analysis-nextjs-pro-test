import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !(session as any).userId) return res.status(401).json({ error: 'unauthorized' });
  const userId = (session as any).userId as string;
  const org = await prisma.organization.findFirst({ where: { memberships: { some: { userId } } } });
  if (!org) return res.status(400).json({ error: 'no_org' });
  const sub = await prisma.subscription.findFirst({ where: { organizationId: org.id }, orderBy: { createdAt: 'desc' } });
  return res.json({ status: sub?.status || 'none' });
}


