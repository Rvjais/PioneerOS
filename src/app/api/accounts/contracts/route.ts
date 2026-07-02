import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';
import { prisma } from '@/server/db/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const expiring = searchParams.get('expiring') === 'true';

  const contracts = await prisma.contract.findMany({
    include: { client: { select: { id: true, name: true } } },
    orderBy: { endDate: 'asc' },
  });

  const mapped = contracts.map(c => {
    const daysRemaining = Math.ceil((c.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    let status: 'active' | 'expiring' | 'expired' = 'active';
    if (daysRemaining < 0) status = 'expired';
    else if (daysRemaining <= 60) status = 'expiring';

    return {
      id: c.id,
      clientName: c.client.name,
      clientId: c.client.id,
      type: c.type,
      title: c.title,
      startDate: c.startDate.toISOString().split('T')[0],
      endDate: c.endDate.toISOString().split('T')[0],
      value: c.value || 0,
      status,
      daysRemaining,
    };
  });

  const filtered = expiring
    ? mapped.filter(c => c.status === 'expiring' || c.daysRemaining <= 60)
    : mapped;

  return NextResponse.json({ contracts: filtered });
});
