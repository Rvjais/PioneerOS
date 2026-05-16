import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';

const CLIENTS_ACCOUNTS_ROLES = ['SUPER_ADMIN', 'MANAGER', 'ACCOUNTS', 'OPERATIONS_HEAD']

export const GET = withAuth(async () => {
  const clientAccounts = [
    {
      id: 'cli_001',
      name: 'Acme Corporation',
      tier: 'enterprise',
      monthlyFee: 2499,
      balance: 0,
      lastPayment: '2026-04-15',
      status: 'active' as const,
    },
    {
      id: 'cli_002',
      name: 'TechStart Inc',
      tier: 'professional',
      monthlyFee: 499,
      balance: 499,
      lastPayment: '2026-03-20',
      status: 'at_risk' as const,
    },
    {
      id: 'cli_003',
      name: 'Global Solutions Ltd',
      tier: 'enterprise',
      monthlyFee: 1999,
      balance: 0,
      lastPayment: '2026-04-01',
      status: 'active' as const,
    },
    {
      id: 'cli_004',
      name: 'Bright Ideas Agency',
      tier: 'starter',
      monthlyFee: 149,
      balance: 298,
      lastPayment: '2026-02-10',
      status: 'inactive' as const,
    },
    {
      id: 'cli_005',
      name: 'Nexus Dynamics',
      tier: 'professional',
      monthlyFee: 599,
      balance: 0,
      lastPayment: '2026-04-28',
      status: 'active' as const,
    },
    {
      id: 'cli_006',
      name: 'Pinnacle Partners',
      tier: 'enterprise',
      monthlyFee: 3499,
      balance: 0,
      lastPayment: '2026-04-05',
      status: 'active' as const,
    },
    {
      id: 'cli_007',
      name: 'Horizon Ventures',
      tier: 'professional',
      monthlyFee: 699,
      balance: 1398,
      lastPayment: '2026-01-15',
      status: 'at_risk' as const,
    },
  ];

  return NextResponse.json(clientAccounts);
}, { roles: CLIENTS_ACCOUNTS_ROLES });
