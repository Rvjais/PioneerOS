import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';

export const GET = withAuth(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const includeBilling = searchParams.get('includeBilling') === 'true';

  const projects = [
    {
      id: 'proj_001',
      name: 'Enterprise CRM Integration',
      client: 'Acme Corp',
      status: 'active' as const,
      progress: 68,
      startDate: '2026-01-15',
      endDate: '2026-06-30',
      billing: includeBilling
        ? { total: 125000, paid: 75000, pending: 30000 }
        : null,
    },
    {
      id: 'proj_002',
      name: 'E-Commerce Platform Redesign',
      client: 'RetailMax',
      status: 'active' as const,
      progress: 42,
      startDate: '2026-02-01',
      endDate: '2026-08-15',
      billing: includeBilling
        ? { total: 85000, paid: 34000, pending: 17000 }
        : null,
    },
    {
      id: 'proj_003',
      name: 'Data Analytics Dashboard',
      client: 'FinServe Inc.',
      status: 'completed' as const,
      progress: 100,
      startDate: '2025-09-01',
      endDate: '2026-02-28',
      billing: includeBilling
        ? { total: 60000, paid: 60000, pending: 0 }
        : null,
    },
    {
      id: 'proj_004',
      name: 'Mobile App Development',
      client: 'HealthFirst',
      status: 'on_hold' as const,
      progress: 25,
      startDate: '2026-03-01',
      endDate: '2026-09-01',
      billing: includeBilling
        ? { total: 150000, paid: 37500, pending: 0 }
        : null,
    },
    {
      id: 'proj_005',
      name: 'Cloud Migration Project',
      client: 'LogiTech Solutions',
      status: 'active' as const,
      progress: 85,
      startDate: '2025-11-01',
      endDate: '2026-05-15',
      billing: includeBilling
        ? { total: 200000, paid: 170000, pending: 30000 }
        : null,
    },
  ];

  return NextResponse.json({ projects });
});