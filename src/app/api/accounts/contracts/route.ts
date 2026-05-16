import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';

export const GET = withAuth(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const expiring = searchParams.get('expiring') === 'true';

  const allContracts = [
    { id: '1', clientName: 'Acme Corp', type: 'Service Agreement', startDate: '2025-01-01', endDate: '2026-06-30', value: 50000, status: 'expiring' as const, daysRemaining: 53 },
    { id: '2', clientName: 'TechStart Inc', type: 'License Agreement', startDate: '2026-01-01', endDate: '2027-01-01', value: 25000, status: 'active' as const, daysRemaining: 238 },
    { id: '3', clientName: 'Global Solutions', type: 'Consulting Contract', startDate: '2025-06-01', endDate: '2026-05-31', value: 75000, status: 'expiring' as const, daysRemaining: 23 },
    { id: '4', clientName: 'Innovation Labs', type: 'Partnership Agreement', startDate: '2024-01-01', endDate: '2026-01-01', value: 100000, status: 'expired' as const, daysRemaining: -128 },
    { id: '5', clientName: 'DataFlow Systems', type: 'Maintenance Contract', startDate: '2026-03-01', endDate: '2027-03-01', value: 15000, status: 'active' as const, daysRemaining: 297 },
  ];

  const contracts = expiring
    ? allContracts.filter(c => c.status === 'expiring' || c.daysRemaining <= 60)
    : allContracts;

  return NextResponse.json({ contracts });
});
