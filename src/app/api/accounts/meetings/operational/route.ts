import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';

export const GET = withAuth(async (_req: NextRequest) => {
  return NextResponse.json({
    metrics: {
      scheduled: 12,
      completed: 8,
      pending: 4,
    },
    actionItems: [
      {
        id: 'op-1',
        title: 'Review Q2 operational targets',
        assignee: 'John Smith',
        dueDate: '2026-05-15',
        status: 'pending',
      },
      {
        id: 'op-2',
        title: 'Update workflow automation rules',
        assignee: 'Sarah Johnson',
        dueDate: '2026-05-10',
        status: 'in_progress',
      },
      {
        id: 'op-3',
        title: 'Schedule team sync for next week',
        assignee: 'Mike Davis',
        dueDate: '2026-05-12',
        status: 'completed',
      },
      {
        id: 'op-4',
        title: 'Finalize meeting notes distribution',
        assignee: 'Emily Chen',
        dueDate: '2026-05-08',
        status: 'pending',
      },
    ],
  });
});
