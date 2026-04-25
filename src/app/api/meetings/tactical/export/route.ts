import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { withAuth } from '@/server/auth/withAuth'

// GET - Export tactical meeting data as PDF-ready JSON
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const meetingId = searchParams.get('meetingId')
    const clientId = searchParams.get('clientId')
    const month = searchParams.get('month')
    const format = searchParams.get('format') || 'json' // json or html

    // Build query
    const whereClause: Record<string, unknown> = {}

    if (meetingId) {
      whereClause.id = meetingId
    } else if (month) {
      whereClause.userId = user.id
      whereClause.month = new Date(month)
    } else {
      // Default to current month
      const now = new Date()
      whereClause.userId = user.id
      whereClause.month = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const meeting = await prisma.tacticalMeeting.findFirst({
      where: whereClause,
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            department: true,
            empId: true
          }
        },
        kpiEntries: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
                industry: true
              }
            },
            property: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          },
          where: clientId ? { clientId } : undefined
        }
      }
    })

    if (!meeting) {
      return NextResponse.json({ error: 'Meeting not found' }, { status: 404 })
    }

    // Format the data for export
    const reportingMonth = meeting.reportingMonth || meeting.month
    const monthName = reportingMonth.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    })

    const exportData = {
      meta: {
        title: `Monthly Report - ${monthName}`,
        generatedAt: new Date().toISOString(),
        generatedBy: `${meeting.user.firstName} ${meeting.user.lastName || ''}`.trim(),
        department: meeting.user.department,
        employeeId: meeting.user.empId,
        status: meeting.status,
        submittedAt: meeting.submittedAt?.toISOString(),
        submittedOnTime: meeting.submittedOnTime
      },
      summary: {
        performanceScore: meeting.performanceScore,
        accountabilityScore: meeting.accountabilityScore,
        clientSatisfactionScore: meeting.clientSatisfactionScore,
        overallScore: meeting.overallScore,
        clientsReported: meeting.kpiEntries.length
      },
      clients: meeting.kpiEntries.map(entry => {
        // Calculate growth percentages
        const trafficGrowth = entry.prevOrganicTraffic && entry.organicTraffic
          ? ((entry.organicTraffic - entry.prevOrganicTraffic) / entry.prevOrganicTraffic * 100).toFixed(1)
          : null

        const leadsGrowth = entry.prevLeads && entry.leads
          ? ((entry.leads - entry.prevLeads) / entry.prevLeads * 100).toFixed(1)
          : null

        return {
          client: {
            id: entry.client.id,
            name: entry.client.name,
            logo: entry.client.logoUrl,
            industry: entry.client.industry
          },
          property: entry.property ? {
            name: entry.property.name,
            type: entry.property.type
          } : null,
          department: entry.department,
          metrics: {
            // SEO Metrics
            seo: entry.department === 'SEO' ? {
              organicTraffic: {
                current: entry.organicTraffic,
                previous: entry.prevOrganicTraffic,
                growth: trafficGrowth ? `${trafficGrowth}%` : 'N/A'
              },
              leads: {
                current: entry.leads,
                previous: entry.prevLeads,
                growth: leadsGrowth ? `${leadsGrowth}%` : 'N/A'
              },
              gbpCalls: {
                current: entry.gbpCalls,
                previous: entry.prevGbpCalls
              },
              gbpDirections: {
                current: entry.gbpDirections,
                previous: entry.prevGbpDirections
              },
              keywordsTop10: entry.keywordsTop10,
              backlinksBuilt: entry.backlinksBuilt
            } : null,
            // Ads Metrics
            ads: entry.department === 'ADS' ? {
              adSpend: entry.adSpend,
              impressions: entry.impressions,
              clicks: entry.clicks,
              ctr: entry.impressions && entry.clicks ? ((entry.clicks / entry.impressions) * 100).toFixed(2) : null,
              leads: entry.leads,
              conversions: entry.conversions,
              costPerConversion: entry.costPerConversion,
              roas: entry.roas
            } : null,
            // Social Metrics
            social: entry.department === 'SOCIAL' ? {
              postsPublished: entry.postsPublished,
              followers: entry.followers,
              prevFollowers: entry.prevFollowers,
              followerGrowth: entry.followers && entry.prevFollowers
                ? ((entry.followers - entry.prevFollowers) / entry.prevFollowers * 100).toFixed(1)
                : null,
              engagement: entry.engagement,
              reachTotal: entry.reachTotal,
              videoViews: entry.videoViews
            } : null,
            // Web Metrics
            web: entry.department === 'WEB' ? {
              pagesBuilt: entry.pagesBuilt,
              bugsFixed: entry.bugsFixed,
              pageSpeed: entry.pageSpeed,
              bounceRate: entry.bounceRate
            } : null
          },
          qualitative: {
            notes: entry.notes,
            achievements: entry.achievements,
            challenges: entry.challenges,
            nextMonthPlan: entry.nextMonthPlan
          }
        }
      })
    }

    // Return HTML format for PDF generation
    if (format === 'html') {
      const html = generatePDFHTML(exportData)
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="report-${monthName.replace(' ', '-')}.html"`
        }
      })
    }

    return NextResponse.json(exportData)
  } catch (error) {
    console.error('Failed to export tactical meeting:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
})

// Generate HTML for PDF
function generatePDFHTML(data: Record<string, unknown>): string {
  const meta = data.meta as Record<string, unknown>
  const summary = data.summary as Record<string, unknown>
  const clients = data.clients as Array<Record<string, unknown>>

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${meta.title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    .header h1 {
      color: #1e40af;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header .meta {
      color: #64748b;
      font-size: 14px;
    }
    .summary {
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .summary h2 {
      color: #1e40af;
      font-size: 18px;
      margin-bottom: 15px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    .summary-item {
      text-align: center;
      padding: 15px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-item .value {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .summary-item .label {
      font-size: 12px;
      color: #64748b;
      margin-top: 5px;
    }
    .client-section {
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .client-header {
      background: #1e40af;
      color: white;
      padding: 15px 20px;
      border-radius: 8px 8px 0 0;
    }
    .client-header h3 {
      font-size: 18px;
    }
    .client-body {
      border: 1px solid #e2e8f0;
      border-top: none;
      padding: 20px;
      border-radius: 0 0 8px 8px;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    .metric {
      padding: 12px;
      background: #f8fafc;
      border-radius: 6px;
    }
    .metric .label {
      font-size: 11px;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .metric .value {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
    }
    .metric .change {
      font-size: 12px;
      margin-top: 3px;
    }
    .metric .change.positive { color: #16a34a; }
    .metric .change.negative { color: #dc2626; }
    .notes-section {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #e2e8f0;
    }
    .notes-section h4 {
      font-size: 14px;
      color: #475569;
      margin-bottom: 10px;
    }
    .notes-section p {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 8px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      text-align: center;
      font-size: 12px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 20px; }
      .client-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${meta.title}</h1>
    <div class="meta">
      Prepared by: ${meta.generatedBy} (${meta.department})<br>
      Generated: ${new Date(meta.generatedAt as string).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}
    </div>
  </div>

  <div class="summary">
    <h2>Performance Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="value">${summary.overallScore ? (summary.overallScore as number).toFixed(1) : 'N/A'}</div>
        <div class="label">Overall Score</div>
      </div>
      <div class="summary-item">
        <div class="value">${summary.performanceScore ? (summary.performanceScore as number).toFixed(1) : 'N/A'}</div>
        <div class="label">Performance</div>
      </div>
      <div class="summary-item">
        <div class="value">${summary.clientSatisfactionScore ? (summary.clientSatisfactionScore as number).toFixed(1) : 'N/A'}</div>
        <div class="label">Satisfaction</div>
      </div>
      <div class="summary-item">
        <div class="value">${summary.clientsReported}</div>
        <div class="label">Clients Reported</div>
      </div>
    </div>
  </div>

  ${clients.map(client => {
    const clientInfo = client.client as Record<string, unknown>
    const metrics = client.metrics as Record<string, unknown>
    const qualitative = client.qualitative as Record<string, unknown>
    const dept = client.department as string

    let metricsHTML = ''
    if (dept === 'SEO' && metrics.seo) {
      const seo = metrics.seo as Record<string, unknown>
      metricsHTML = `
        <div class="metric">
          <div class="label">Organic Traffic</div>
          <div class="value">${(seo.organicTraffic as Record<string, unknown>)?.current || 'N/A'}</div>
          <div class="change ${parseFloat(((seo.organicTraffic as Record<string, unknown>)?.growth as string) || '0') >= 0 ? 'positive' : 'negative'}">${(seo.organicTraffic as Record<string, unknown>)?.growth || ''}</div>
        </div>
        <div class="metric">
          <div class="label">Leads</div>
          <div class="value">${(seo.leads as Record<string, unknown>)?.current || 'N/A'}</div>
          <div class="change ${parseFloat(((seo.leads as Record<string, unknown>)?.growth as string) || '0') >= 0 ? 'positive' : 'negative'}">${(seo.leads as Record<string, unknown>)?.growth || ''}</div>
        </div>
        <div class="metric">
          <div class="label">GBP Calls</div>
          <div class="value">${(seo.gbpCalls as Record<string, unknown>)?.current || 'N/A'}</div>
        </div>
      `
    } else if (dept === 'ADS' && metrics.ads) {
      const ads = metrics.ads as Record<string, unknown>
      metricsHTML = `
        <div class="metric">
          <div class="label">Ad Spend</div>
          <div class="value">₹${ads.adSpend || 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="label">Leads</div>
          <div class="value">${ads.leads || 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="label">Cost/Lead</div>
          <div class="value">₹${ads.costPerLead || 'N/A'}</div>
        </div>
      `
    } else if (dept === 'SOCIAL' && metrics.social) {
      const social = metrics.social as Record<string, unknown>
      metricsHTML = `
        <div class="metric">
          <div class="label">Posts</div>
          <div class="value">${social.postsPublished || 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="label">Reels</div>
          <div class="value">${social.reelsPublished || 'N/A'}</div>
        </div>
        <div class="metric">
          <div class="label">Engagement</div>
          <div class="value">${social.engagementRate || 'N/A'}%</div>
        </div>
      `
    }

    return `
      <div class="client-section">
        <div class="client-header">
          <h3>${clientInfo.name}</h3>
        </div>
        <div class="client-body">
          <div class="metrics-grid">
            ${metricsHTML}
          </div>
          ${qualitative.achievements || qualitative.challenges || qualitative.nextMonthPlan ? `
            <div class="notes-section">
              ${qualitative.achievements ? `<h4>Achievements</h4><p>${qualitative.achievements}</p>` : ''}
              ${qualitative.challenges ? `<h4>Challenges</h4><p>${qualitative.challenges}</p>` : ''}
              ${qualitative.nextMonthPlan ? `<h4>Next Month Plan</h4><p>${qualitative.nextMonthPlan}</p>` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `
  }).join('')}

  <div class="footer">
    Generated by Pioneer OS | ${meta.title}
  </div>
</body>
</html>
  `
}
