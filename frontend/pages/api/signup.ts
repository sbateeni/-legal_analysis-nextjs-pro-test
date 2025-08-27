import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../lib/db';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'bad_request' });

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'email_in_use' });

  const hash = await bcrypt.hash(password, 10);
  const slugBase = (name || email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'org';
  const slug = slugBase.substring(0, 24);
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: { email, name: name || null, passwordHash: hash } });
    const existsOrg = await tx.organization.findUnique({ where: { slug } });
    const finalSlug = existsOrg ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;
    await tx.organization.create({ data: { name: name || 'مؤسستي', slug: finalSlug, memberships: { create: { userId: user.id, role: 'OWNER' } } } });
  });
  return res.status(201).json({ ok: true });
}


