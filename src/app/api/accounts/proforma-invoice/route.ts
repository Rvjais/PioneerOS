import { NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { withAuth } from '@/server/auth/withAuth';
import { generateProformaNumber } from '@/server/db/sequence';

export const GET = withAuth(async () => {
  const invoices = await prisma.invoice.findMany({
    where: { invoiceType: 'PROFORMA' },
    include: { client: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const mapped = invoices.map((inv) => {
    let items: { name: string }[] = [];
    try { items = inv.items ? JSON.parse(inv.items) : []; } catch { items = []; }
    return {
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
    };
  });

  return NextResponse.json({ invoices: mapped });
});

export const POST = withAuth(async (request: Request) => {
  const body = await request.json();

  const invoiceNumber = await generateProformaNumber()

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber,
      clientId: body.clientId || (await getOrCreateClient(body.client)),
      amount: body.amount || 0,
      tax: body.gstAmount || 0,
      total: body.totalAmount || (body.amount || 0) + (body.gstAmount || 0),
      status: 'DRAFT',
      dueDate: new Date(body.validUntil || Date.now() + 30 * 86400000),
      items: body.services ? JSON.stringify(body.services.map((s: string) => ({ name: s }))) : null,
      invoiceType: 'PROFORMA',
    },
  });

  return NextResponse.json({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    client: body.client,
    company: body.company,
    amount: invoice.amount,
    gstAmount: invoice.tax,
    totalAmount: invoice.total,
    services: body.services || [],
    validUntil: invoice.dueDate.toISOString().split('T')[0],
    status: invoice.status.toLowerCase(),
    createdAt: invoice.createdAt.toISOString(),
  }, { status: 201 });
});

async function getOrCreateClient(name: string): Promise<string> {
  return await prisma.$transaction(async (tx) => {
    let client = await tx.client.findFirst({ where: { name } });
    if (!client) {
      client = await tx.client.create({
        data: {
          name,
          status: 'ACTIVE',
          clientType: 'RECURRING',
          entityType: 'BRANDING_PIONEERS',
        },
      });
    }
    return client.id;
  });
}
