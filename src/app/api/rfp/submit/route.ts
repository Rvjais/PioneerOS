import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const rfpSubmitSchema = z.object({
  clientName: z.string().min(1),
  email: z.string().email(),
  adBudget: z.string().optional(),
  objectives: z.array(z.string()).optional(),
}).passthrough()

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json()
    const parsed = rfpSubmitSchema.safeParse(rawData)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 })
    }
    const data = parsed.data

    // Create lead from RFP submission
    const lead = await prisma.lead.create({
      data: {
        companyName: data.clientName,
        contactName: data.clientName,
        contactEmail: data.email,
        contactPhone: '',
        source: 'WEBSITE',
        stage: 'LEAD_RECEIVED',
        value: data.adBudget === '300k_plus' ? 500000 :
               data.adBudget === '100k_300k' ? 200000 :
               data.adBudget === '30k_100k' ? 75000 : 30000,
        notes: JSON.stringify({
          ...data,
          submittedAt: new Date().toISOString(),
          formType: 'RFP',
          industry: 'Healthcare',
          interestedServices: data.objectives
        }),
        nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      }
    })

    // Also create RFP submission record
    try {
      await prisma.rFPSubmission.create({
        data: {
          leadId: lead.id,
          companyName: data.clientName,
          contactName: data.clientName,
          contactEmail: data.email,
          industry: 'Healthcare',
          businessType: (data as Record<string, unknown>).specialityType as string | null ?? null,
          servicesRequested: JSON.stringify(data.objectives),
          scopeDetails: JSON.stringify({
            medicalSpecialities: data.medicalSpeciality,
            location: data.location,
            visibilityImportance: data.visibilityImportance,
            leadGenImportance: data.leadGenImportance,
            salesImportance: data.salesImportance,
            dmExperience: data.dmExperience,
            resultPace: data.resultPace,
            digitalAssets: data.digitalAssets,
            visibilityTarget: data.visibilityTarget,
            leadTarget: data.leadTarget,
            revenueTarget: data.revenueTarget,
            timeCoordination: data.timeCoordination,
            comfortActivities: data.comfortActivities,
            salesCoordinatorRating: data.salesCoordinatorRating,
          }),
          budgetRange: data.adBudget,
          notes: (data as Record<string, unknown>).elaboration as string | null ?? null,
          status: 'NEW',
        }
      })
    } catch {
      // Non-critical: continue even if RFPSubmission fails
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'RFP submitted successfully'
    })
  } catch (error) {
    console.error('RFP submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit RFP' },
      { status: 500 }
    )
  }
}
