import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';

export const GET = withAuth(async (_req: NextRequest) => {
  return NextResponse.json({
    metrics: {
      issues: 15,
      resolved: 11,
      pending: 4,
    },
    issues: [
      {
        id: 'tac-1',
        title: 'Meeting room booking conflicts',
        priority: 'high',
        status: 'resolved',
        createdAt: '2026-05-01',
      },
      {
        id: 'tac-2',
        title: 'Calendar sync delays with external tools',
        priority: 'medium',
        status: 'pending',
        createdAt: '2026-05-03',
      },
      {
        id: 'tac-3',
        title: 'Notification timing issues',
        priority: 'low',
        status: 'resolved',
        createdAt: '2026-05-04',
      },
      {
        id: 'tac-4',
        title: 'Video conferencing quality degradation',
        priority: 'high',
        status: 'in_progress',
        createdAt: '2026-05-06',
      },
    ],
  });
});
