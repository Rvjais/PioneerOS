import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/server/auth/withAuth';

export const GET = withAuth(async (_req: NextRequest) => {
  return NextResponse.json({
    metrics: {
      reviews: 6,
      attendance: 45,
      decisions: 12,
    },
    reviews: [
      {
        id: 'str-1',
        title: 'Annual strategic plan review',
        date: '2026-04-28',
        outcome: 'approved',
      },
      {
        id: 'str-2',
        title: 'Budget allocation adjustment',
        date: '2026-05-02',
        outcome: 'pending',
      },
      {
        id: 'str-3',
        title: 'Market expansion strategy',
        date: '2026-05-05',
        outcome: 'approved',
      },
      {
        id: 'str-4',
        title: 'Technology roadmap update',
        date: '2026-05-07',
        outcome: 'in_review',
      },
    ],
  });
});
