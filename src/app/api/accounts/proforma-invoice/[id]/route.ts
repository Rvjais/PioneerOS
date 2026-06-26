import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { withAuth } from '@/server/auth/withAuth';

export const GET = withAuth(async (request: Request, { params }) => {
  const { id } = await params!;
  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: { client: { select: { id: true, name: true } } },
  });

  if (!inv) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  let items: { name: string }[] = [];
  try { items = inv.items ? JSON.parse(inv.items) : []; } catch { items = []; }

  return NextResponse.json({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    client: inv.client.name,
    company: inv.client.name,
    amount: inv.amount,
    gstAmount: inv.tax,
    totalAmount: inv.total,
    services: items.map((i) => i.name),
    validUntil: inv.dueDate.toISOString().split('T')[0],
    status: inv.status.toLowerCase(),
    createdAt: inv.createdAt.toISOString(),
  });
});

export const PATCH = withAuth(async (request: Request, { params }) => {
  const { id } = await params!;
  const body = await request.json();

  const validStatuses = ['draft', 'sent', 'accepted', 'rejected'] as const;
  const newStatus = body.status?.toUpperCase();
  if (body.status && !validStatuses.includes(body.status)) {
    return NextResponse.json(
      { error: 'Invalid status. Must be one of: draft, sent, accepted, rejected' },
      { status: 400 }
    );
  }

  const invoice = await prisma.invoice.update({
    where: { id },
    data: { ...(newStatus && { status: newStatus }) },
    include: { client: { select: { id: true, name: true } } },
  });

  let items: { name: string }[] = [];
  try { items = invoice.items ? JSON.parse(invoice.items) : []; } catch { items = []; }

  return NextResponse.json({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    client: invoice.client.name,
    company: invoice.client.name,
    amount: invoice.amount,
    gstAmount: invoice.tax,
    totalAmount: invoice.total,
    services: items.map((i) => i.name),
    validUntil: invoice.dueDate.toISOString().split('T')[0],
    status: invoice.status.toLowerCase(),
    createdAt: invoice.createdAt.toISOString(),
  });
});
