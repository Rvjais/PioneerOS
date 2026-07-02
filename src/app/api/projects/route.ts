import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';
import { prisma } from '@/server/db/prisma';

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const includeBilling = searchParams.get('includeBilling') === 'true';

  const webProjects = await prisma.webProject.findMany({
    include: {
      client: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const projects = await Promise.all(webProjects.map(async (p) => {
    const statusMap: Record<string, string> = {
      'PIPELINE': 'active',
      'IN_PROGRESS': 'active',
      'REVISION': 'active',
      'COMPLETED': 'completed',
      'ON_HOLD': 'on_hold',
      'CANCELLED': 'on_hold',
    };

    let billing = null;
    if (includeBilling) {
      const invoices = await prisma.invoice.findMany({
        where: { clientId: p.clientId },
        select: { amount: true, total: true, paidAmount: true, status: true },
      });
      const total = invoices.reduce((s, i) => s + i.total, 0);
      const paid = invoices.reduce((s, i) => s + i.paidAmount, 0);
      const pending = invoices
        .filter(i => !['PAID', 'CANCELLED', 'DRAFT'].includes(i.status))
        .reduce((s, i) => s + i.total - i.paidAmount, 0);

      billing = { total, paid, pending };
    }

    return {
      id: p.id,
      name: p.name,
      client: p.client.name,
      clientId: p.client.id,
      status: statusMap[p.status] || 'active',
      progress: p.currentPhase ? 50 : 0,
      startDate: p.startDate?.toISOString().split('T')[0] || '',
      endDate: p.targetEndDate?.toISOString().split('T')[0] || '',
      totalValue: billing?.total || 0,
      billedAmount: billing?.total || 0,
      paidAmount: billing?.paid || 0,
      billingType: billing ? 'MILESTONE' : 'FIXED',
      billing,
    };
  }));

  return NextResponse.json({ projects });
});
