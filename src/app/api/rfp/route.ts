import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

const rfpSubmissionSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  contactName: z.string().min(1, 'Contact name is required').max(200),
  email: z.string().email('Invalid email').max(255),
  phone: z.string().max(20).optional(),
  industry: z.string().max(100).optional(),
  clientTier: z.string().max(50).optional(),
  currency: z.string().max(10).optional(),
  locations: z.union([z.string(), z.array(z.string())]).optional(),
  servicesNeeded: z.array(z.string()).optional(),
  targetAudience: z.string().max(1000).optional(),
  usp: z.string().max(1000).optional(),
  topCompetitors: z.string().max(1000).optional(),
  retainerBudget: z.string().max(50).optional(),
  adBudget: z.string().max(50).optional(),
  timeline: z.string().max(200).optional(),
  contractPreference: z.string().max(100).optional(),
  primaryGoals: z.array(z.string()).optional(),
  monthlyLeadTarget: z.string().max(50).optional(),
  currentMonthlyLeads: z.string().max(50).optional(),
  successMetrics: z.string().max(1000).optional(),
  biggestChallenge: z.string().max(1000).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  specializations: z.string().max(500).optional(),
  patientVolume: z.string().max(100).optional(),
  currentlyDoingMarketing: z.string().max(500).optional(),
  whatWorked: z.string().max(1000).optional(),
  whatDidntWork: z.string().max(1000).optional(),
  additionalInfo: z.string().max(5000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const rawData = await req.json()
    const parsed = rfpSubmissionSchema.safeParse(rawData)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const data = parsed.data

    // Calculate estimated value from retainer + ad budget
    const retainerValues: Record<string, number> = {
      'under_30k': 25000, '30k_50k': 40000, '50k_75k': 60000,
      '75k_1l': 85000, '1l_2l': 150000, '2l_3l': 250000,
      '2l_5l': 350000, '5l_10l': 750000, '10l_plus': 1200000,
      'flexible': 75000,
    }

    const adValues: Record<string, number> = {
      'under_25k': 20000, '25k_50k': 40000, '50k_1l': 75000,
      '1l_3l': 200000, '3l_5l': 400000, '5l_plus': 600000,
      '5l_10l': 750000, '10l_plus': 1200000, 'flexible': 50000,
    }

    const retainerValue = retainerValues[data.retainerBudget ?? ''] || 50000
    const adValue = data.adBudget ? (adValues[data.adBudget] || 0) : 0
    const estimatedValue = retainerValue + adValue

    // Determine lead priority from tier
    const priorityMap: Record<string, string> = {
      'enterprise': 'HOT', 'premium': 'HOT', 'standard': 'WARM',
    }

    // Check if a lead already exists for this email to prevent duplicates
    const existingLead = await prisma.lead.findFirst({
      where: { contactEmail: data.email, deletedAt: null },
    })

    const leadData = {
        companyName: data.companyName,
        contactName: data.contactName,
        contactEmail: data.email,
        contactPhone: data.phone || '',
        source: 'RFP',
        stage: 'LEAD_RECEIVED',
        value: estimatedValue,
        leadPriority: priorityMap[data.clientTier ?? ''] || 'WARM',
        location: data.city || null,
        state: data.state || null,
        isHealthcare: ['healthcare', 'dental', 'aesthetics', 'ivf', 'mental_health', 'veterinary'].includes(data.industry ?? ''),
        healthcareType: data.specializations || null,
        primaryObjective: data.primaryGoals?.join(', ') || null,
        currentChallenges: data.biggestChallenge || null,
        notes: JSON.stringify({
          ...data,
          submittedAt: new Date().toISOString(),
          formType: 'RFP_v4',
          estimatedMonthlyValue: retainerValue,
          estimatedAdSpend: adValue,
        }),
        rfpResponses: JSON.stringify({
          industry: data.industry,
          clientTier: data.clientTier,
          currency: data.currency,
          locations: data.locations,
          services: data.servicesNeeded,
          targetAudience: data.targetAudience,
          usp: data.usp,
          competitors: data.topCompetitors,
          retainerBudget: data.retainerBudget,
          adBudget: data.adBudget,
          timeline: data.timeline,
          contractPreference: data.contractPreference,
          goals: data.primaryGoals,
          monthlyLeadTarget: data.monthlyLeadTarget,
          currentMonthlyLeads: data.currentMonthlyLeads,
          successMetrics: data.successMetrics,
        }),
        nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }

    const lead = existingLead
      ? await prisma.lead.update({
          where: { id: existingLead.id },
          data: leadData,
        })
      : await prisma.lead.create({
          data: leadData,
        })

    // Create RFP submission record (non-critical)
    try {
      await prisma.rFPSubmission.create({
        data: {
          leadId: lead.id,
          companyName: data.companyName,
          contactName: data.contactName,
          contactEmail: data.email,
          industry: data.industry,
          businessType: data.clientTier,
          servicesRequested: JSON.stringify(data.servicesNeeded),
          scopeDetails: JSON.stringify({
            clientTier: data.clientTier,
            currency: data.currency,
            locations: data.locations,
            targetAudience: data.targetAudience,
            usp: data.usp,
            competitors: data.topCompetitors,
            retainerBudget: data.retainerBudget,
            adBudget: data.adBudget,
            goals: data.primaryGoals,
            successMetrics: data.successMetrics,
            biggestChallenge: data.biggestChallenge,
            patientVolume: data.patientVolume,
            specializations: data.specializations,
            currentMarketing: data.currentlyDoingMarketing,
            whatWorked: data.whatWorked,
            whatDidntWork: data.whatDidntWork,
          }),
          budgetRange: data.retainerBudget,
          notes: data.additionalInfo,
          status: 'NEW',
        }
      })
    } catch (rfpError) {
      console.error('RFP submission record creation failed:', rfpError)
    }

    // Notify sales team
    try {
      const salesUsers = await prisma.user.findMany({
        where: {
          OR: [
            { role: 'SUPER_ADMIN' },
            { role: 'MANAGER' },
            { role: 'SALES' },
            { department: 'SALES' },
          ],
          status: 'ACTIVE',
          deletedAt: null,
        },
        select: { id: true },
      })

      if (salesUsers.length > 0) {
        await prisma.notification.createMany({
          data: salesUsers.map(u => ({
            userId: u.id,
            type: 'GENERAL',
            title: `New RFP: ${data.companyName} (${(data.clientTier || '').toUpperCase()})`,
            message: `${data.contactName} from ${data.companyName} submitted an RFP for ${data.servicesNeeded?.length || 0} services. Industry: ${data.industry}. Estimated value: ₹${Math.round(estimatedValue / 1000)}K/mo.`,
            link: `/sales/leads/${lead.id}`,
            priority: data.clientTier === 'enterprise' ? 'URGENT' : 'HIGH',
          })),
        })
      }
    } catch {
      // Non-critical
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Proposal request submitted successfully',
    })
  } catch (error) {
    console.error('RFP submission error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.', details: message },
      { status: 500 }
    )
  }
}
