import { NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'

export async function GET() {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown' as string,
    version: process.env.npm_package_version || '1.0.0',
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'connected'
  } catch {
    checks.database = 'disconnected'
    checks.status = 'degraded'
  }

  return NextResponse.json(checks, { status: checks.status === 'ok' ? 200 : 503 })
}
