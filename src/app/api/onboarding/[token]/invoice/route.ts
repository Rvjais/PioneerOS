import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'
import { ENTITY_TYPES, SERVICES, formatCurrency, calculateGST } from '@/server/onboarding/constants'

// GET: Get Proforma Invoice details (Step 3)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    const proposal = await prisma.clientProposal.findUnique({
      where: { token },
    })

    if (!proposal) {
      return NextResponse.json(
        { error: 'Onboarding link not found' },
        { status: 404 }
      )
    }

    // Check if SLA is signed
    if (!proposal.slaAccepted) {
      return NextResponse.json(
        { error: 'Please sign the SLA first' },
        { status: 400 }
      )
    }

    // Get entity details
    const entity = ENTITY_TYPES.find(e => e.id === proposal.entityType) || ENTITY_TYPES[0]

    // Parse services
    let services: Array<{ serviceId: string; name?: string; price?: number }> = []
    try {
      services = JSON.parse(proposal.services || '[]')
    } catch {
      services = []
    }

    // Calculate amounts
    const baseAmount = proposal.basePrice
    const gstAmount = calculateGST(baseAmount, proposal.gstPercentage)
    const totalAmount = proposal.totalPrice
    const advanceAmount = proposal.advanceAmount || totalAmount

    // Build invoice data
    const invoiceData = {
      // Invoice Details
      invoiceNumber: proposal.invoiceNumber || 'PI-PENDING',
      invoiceDate: proposal.invoiceGeneratedAt || new Date(),
      invoiceType: 'PROFORMA',

      // From (Agency)
      from: {
        name: entity.name,
        legalName: entity.legalName,
        address: entity.address,
        gstin: entity.gstin,
      },

      // To (Client)
      to: {
        name: proposal.clientName,
        company: proposal.clientCompany,
        address: `${proposal.clientAddress}, ${proposal.clientCity}, ${proposal.clientState} ${proposal.clientPincode || ''}`.trim(),
        gstin: proposal.clientGst,
        email: proposal.clientEmail,
        phone: proposal.clientPhone,
      },

      // Line Items
      items: services.map((s, index) => ({
        sno: index + 1,
        description: SERVICES.find(svc => svc.id === s.serviceId)?.name || s.serviceId,
        hsn: '998314', // SAC code for marketing services
        quantity: 1,
        rate: s.price || Math.round(baseAmount / services.length),
        amount: s.price || Math.round(baseAmount / services.length),
      })),

      // Summary
      summary: {
        subtotal: baseAmount,
        gstPercentage: proposal.gstPercentage,
        cgst: gstAmount / 2,
        sgst: gstAmount / 2,
        igst: 0, // Use for inter-state
        totalGst: gstAmount,
        totalAmount,
        advanceDue: advanceAmount,
        advancePercentage: proposal.advancePercentage || 100,
      },

      // Bank Details
      bankDetails: entity.bank,

      // Terms
      terms: [
        'This is a Proforma Invoice and not a tax invoice.',
        'GST @18% is applicable on all services.',
        `Payment Terms: ${formatPaymentTerms(proposal.paymentTerms)}`,
        'TDS @2% may be deducted as applicable.',
        'Please quote the invoice number while making payment.',
      ],

      // Payment Status
      paymentStatus: proposal.paymentConfirmed ? 'PAID' : 'PENDING',
      paymentMethod: proposal.paymentMethod,
      paymentReference: proposal.paymentReference,
      paymentConfirmedAt: proposal.paymentConfirmedAt,
    }

    return NextResponse.json({
      invoice: invoiceData,
      formatted: {
        subtotal: formatCurrency(baseAmount),
        gst: formatCurrency(gstAmount),
        total: formatCurrency(totalAmount),
        advanceDue: formatCurrency(advanceAmount),
      },
      paymentMethods: [
        {
          id: 'BANK_TRANSFER',
          label: 'Bank Transfer (NEFT/RTGS/IMPS)',
          description: 'Transfer to our bank account',
          bankDetails: entity.bank,
        },
        {
          id: 'UPI',
          label: 'UPI Payment',
          description: 'Pay using any UPI app',
          upiId: entity.bank.upi,
        },
        // Razorpay can be added later
      ],
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    )
  }
}

function formatPaymentTerms(terms: string | null): string {
  switch (terms) {
    case 'ADVANCE_100':
      return '100% advance payment'
    case 'ADVANCE_50':
      return '50% advance, balance on delivery'
    case 'NET_15':
      return 'Net 15 days from invoice date'
    case 'NET_30':
      return 'Net 30 days from invoice date'
    default:
      return '100% advance payment'
  }
}
