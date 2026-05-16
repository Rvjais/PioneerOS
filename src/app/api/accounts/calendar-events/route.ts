import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db/prisma';
import { withAuth } from '@/server/auth/withAuth';

type ColorMap = Record<string, string>;
const TYPE_COLORS: ColorMap = {
  MEETING: '#3B82F6',
  DEADLINE: '#EF4444',
  REMINDER: '#F59E0B',
  HOLIDAY: '#10B981',
};

export const GET = withAuth(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const events = await prisma.event.findMany({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    orderBy: { date: 'asc' },
  });

  const mapped = events.map((evt) => ({
    id: evt.id,
    title: evt.title,
    date: evt.date.toISOString().split('T')[0],
    type: evt.type.toLowerCase(),
    color: TYPE_COLORS[evt.type] || '#3B82F6',
  }));

  return NextResponse.json({ events: mapped });
});
