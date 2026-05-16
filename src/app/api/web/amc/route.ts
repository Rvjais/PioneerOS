import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'
import { z } from 'zod'

const createContractSchema = z.object({
  client: z.string().min(1), // Actually expects the client name or ID, we will try to resolve it
  type: z.enum(['AMC', 'MONTHLY_MAINTENANCE', 'ANNUAL_HOSTING']),
  startDate: z.string(),
  endDate: z.string(),
  amount: z.string().or(z.number()),
  allocatedHours: z.string().optional()
})

export const POST = withAuth(async (req, { user }) => {
  try {
    const raw = await req.json()
    const result = createContractSchema.safeParse(raw)
    
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 400 })
    }

    const data = result.data

    // Try to find the client by ID first, then by name
    let client = await prisma.client.findUnique({ where: { id: data.client } })
    if (!client) {
      // Find by name
      client = await prisma.client.findFirst({ where: { name: { contains: data.client, mode: 'insensitive' } } })
      
      // If still not found, create a placeholder client (or return error)
      if (!client) {
        client = await prisma.client.create({
          data: {
            name: data.client,
          }
        })
      }
    }

    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)
    const amount = typeof data.amount === 'string' ? parseFloat(data.amount) : data.amount
    const allocatedHours = data.allocatedHours ? parseFloat(data.allocatedHours) : null

    const contract = await prisma.maintenanceContract.create({
      data: {
        clientId: client.id,
        type: data.type,
        startDate,
        endDate,
        amount,
        allocatedHours,
        status: 'ACTIVE',
        billingCycle: data.type === 'MONTHLY_MAINTENANCE' ? 'MONTHLY' : 'ANNUAL',
      }
    })

    return NextResponse.json({ success: true, contract })
  } catch (error) {
    console.error('Failed to create AMC contract:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})
