import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { prisma } from '@/server/db/prisma'
import { maskBankAccount, maskSensitive } from '@/server/security/encryption'
import { z } from 'zod'

// Check if user is super admin
async function checkSuperAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  })
  return user?.role === 'SUPER_ADMIN'
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admin can add bank accounts
    const isSuperAdmin = await checkSuperAdmin(session.user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
    }

    const { entityId } = await params
    const body = await req.json()
    const schema = z.object({
      bankName: z.string().min(1).max(200),
      accountName: z.string().min(1).max(200),
      accountNumber: z.string().min(1).max(50),
      ifscCode: z.string().max(20).optional(),
      swiftCode: z.string().max(20).optional(),
      branchName: z.string().max(200).optional(),
      accountType: z.string().max(50).optional(),
      currency: z.string().max(10).optional(),
      displayName: z.string().max(200).optional(),
      isPrimary: z.boolean().optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
    const { bankName, accountName, accountNumber, ifscCode, swiftCode, branchName, accountType, currency, displayName, isPrimary } = result.data

    // Use transaction to prevent race condition when setting primary
    const bankAccount = await prisma.$transaction(async (tx) => {
      if (isPrimary) {
        await tx.entityBankAccount.updateMany({
          where: { entityId, isPrimary: true },
          data: { isPrimary: false },
        })
      }

      return tx.entityBankAccount.create({
        data: {
          entityId,
          bankName,
          accountName,
          accountNumber,
          ifscCode: ifscCode || null,
          swiftCode: swiftCode || null,
          branchName: branchName || null,
          accountType: accountType || 'CURRENT',
          currency: currency || 'INR',
          displayName: displayName || `${bankName} - ${accountType}`,
          isPrimary: isPrimary || false,
        },
      })
    })

    // Return masked data in response
    return NextResponse.json({
      ...bankAccount,
      accountNumber: maskBankAccount(bankAccount.accountNumber),
      ifscCode: bankAccount.ifscCode ? maskSensitive(bankAccount.ifscCode, 4) : null,
      swiftCode: bankAccount.swiftCode ? maskSensitive(bankAccount.swiftCode, 4) : null,
    })
  } catch (error) {
    console.error('Failed to create bank account:', error)
    return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ entityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only super admin can delete bank accounts
    const isSuperAdmin = await checkSuperAdmin(session.user.id)
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Access denied. Super admin only.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 })
    }

    await prisma.entityBankAccount.delete({
      where: { id: accountId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete bank account:', error)
    return NextResponse.json({ error: 'Failed to delete bank account' }, { status: 500 })
  }
}
