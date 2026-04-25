import { NextResponse } from 'next/server'

// Debug endpoint removed for production security.
// Use admin panel to view pending verification users.
export async function GET() {
  return NextResponse.json(
    { error: 'This endpoint has been removed' },
    { status: 410 }
  )
}
