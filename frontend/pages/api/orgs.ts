import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import { prisma } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !(session as any).userId) return res.status(401).json({ error: 'unauthorized' });
  const userId = (session as any).userId as string;

  if (req.method === 'GET') {
    const orgs = await prisma.organization.findMany({
      where: { memberships: { some: { userId } } },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: 'asc' },
    });
    return res.json({ orgs });
  }

  if (req.method === 'POST') {
    const { name, slug } = req.body as { name?: string; slug?: string };
    if (!name || !slug) return res.status(400).json({ error: 'bad_request' });
    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (exists) return res.status(409).json({ error: 'slug_taken' });
    const org = await prisma.organization.create({ data: { name, slug, memberships: { create: { userId, role: 'OWNER' } } } });
    return res.status(201).json({ org });
  }

  return res.status(405).end();
}


