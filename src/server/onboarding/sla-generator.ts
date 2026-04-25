// ============================================
// SLA DOCUMENT GENERATOR
// ============================================

import { ENTITY_TYPES, SERVICES, formatCurrency } from './constants'

interface SLAGeneratorParams {
  // Entity
  entityType: string

  // Client Details
  clientCompany: string
  clientAddress: string
  clientGst: string
  clientSignerName?: string
  clientSignerTitle?: string

  // Contract Details
  effectiveDate: Date
  contractDuration: string // 6_MONTHS, 12_MONTHS, etc.
  monthlyRetainer: number
  advanceAmount: number
  paymentTerms: string

  // Services
  selectedServices: string[] // ['seo', 'social', 'ads']

  // Scope Items (optional)
  scopeItems?: Array<{
    workstream: string
    deliverables: string
    sla: string
    frequency: string
    price: number
    notes?: string
  }>
}

export function generateSLADocument(params: SLAGeneratorParams): string {
  const entity = ENTITY_TYPES.find(e => e.id === params.entityType) || ENTITY_TYPES[0]
  const selectedServiceNames = params.selectedServices
    .map(id => SERVICES.find(s => s.id === id)?.name || id)
    .join(', ')

  const effectiveDateStr = params.effectiveDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const contractEndDate = getContractEndDate(params.effectiveDate, params.contractDuration)
  const contractEndDateStr = contractEndDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Generate scope table
  const scopeTable = params.scopeItems && params.scopeItems.length > 0
    ? generateScopeTable(params.scopeItems)
    : generateDefaultScopeTable(params.selectedServices, params.monthlyRetainer)

  return `
# Digital Services Agreement (Comprehensive SLA)

## 1. Parties

This Digital Services Agreement (the "Agreement") is entered into on **${effectiveDateStr}** by and between:

**${entity.name}**, part of ${entity.legalName} (the "Agency"), having its registered office at ${entity.address}; and

**${params.clientCompany}** (the "Client"), having its registered office at ${params.clientAddress} and GSTIN ${params.clientGst || '[To be provided]'}.

The Agency and the Client are collectively referred to as the "Parties" and individually as a "Party."

---

## 2. Definitions

- **Deliverables**: All work products created by the Agency for the Client under this Agreement, including (as applicable) designs, web pages, landing pages, ad creatives, videos, reports, and documentation.
- **Services**: Digital marketing and related services listed in Annexure A (Scope & Pricing).
- **SLA**: Service level commitments described in this Agreement and its annexures.
- **Business Days**: Monday to Friday, excluding Indian national holidays.

---

## 3. Scope of Services & Deliverables

### 3.1 Services
The Agency will provide Services as specified in Annexure A (Scope & Pricing), which include: **${selectedServiceNames}**.

### 3.2 Change Requests
Items not expressly included in Annexure A are out of scope. Any change to scope, timelines, or budgets must be captured in a written Change Request and signed by both Parties. The Agency will share impact on timelines and costs before commencing out-of-scope work.

### 3.3 Acceptance
Unless otherwise stated in Annexure A, Deliverables are deemed accepted if no consolidated written feedback is received within 3 Business Days of delivery.

---

## 4. Term, Renewal & Termination

### 4.1 Term
This Agreement commences on the Effective Date (**${effectiveDateStr}**) and continues until **${contractEndDateStr}**, unless terminated earlier in accordance with this Section.

### 4.2 Renewal
The Agreement may be renewed by mutual written consent.

### 4.3 Termination for Convenience
Either Party may terminate with 30 days' prior written notice.

### 4.4 Termination for Cause
Either Party may terminate with immediate effect upon written notice if the other Party materially breaches this Agreement and fails to cure within 10 days of notice. Non-payment by the Client is a material breach.

### 4.5 Effect of Termination
Upon termination:
- All fees and approved expenses accrued up to the effective date become immediately due
- The Agency will provide a reasonable handover of Client-owned assets upon full and final settlement
- Licenses to Agency IP and any Deliverables for which full payment has not been received are automatically revoked

---

## 5. Fees, Taxes & Payment Terms

### 5.1 Fees
- **Monthly Retainer**: ${formatCurrency(params.monthlyRetainer)} + GST
- **Advance Payment**: ${formatCurrency(params.advanceAmount)} (due upon signing)
- **Payment Terms**: ${formatPaymentTerms(params.paymentTerms)}

### 5.2 Taxes
The Client may deduct 2% TDS as applicable. GST (18%) will be charged on top of fees and is deposited by the Agency quarterly as per applicable law.

### 5.3 Late Payment & Suspension
If any invoice remains unpaid 7 days past the due date, the Agency may suspend Services and access to Deliverables, accounts, and platforms until payment (and any late fees) is received. Interest on overdue amounts may be charged at 1.5% per month (or the maximum legal rate, if lower).

### 5.4 Annual Escalation
The annual retainer may increase by 10% on renewal or as specified in Annexure A.

### 5.5 Out-of-Pocket Expenses
Pre-approved, reasonable third-party costs (e.g., stock assets, paid plugins, ad tech tools) will be invoiced to the Client and must be paid in advance.

---

## 6. Client Availability, Approvals & Communication

### 6.1 Client Availability (No Impact on Scope/Payments)
The Client's or its representatives' unavailability (due to travel, personal reasons, or other commitments) will not affect the agreed scope, milestones, or the payment schedule. Work will proceed per plan using last approved briefs and assumptions.

### 6.2 Approval Delays (Not Agency Non-Performance)
Delays in providing approvals, content, assets, or feedback will not be deemed Agency non-performance. The Agency will continue work as per agreed timelines, and payments remain unaffected.

### 6.3 Single Point of Contact (SPOC)
The Client shall appoint at least one accessible SPOC (and a backup) authorised to provide approvals/clarifications. Failure to provide timely approvals may result in deemed acceptance per Section 3.3.

### 6.4 No Unilateral Pause
The Client may not place the project on hold or pause Services unilaterally. Any pause requires 30 days' prior written notice and settlement of all dues up to the pause date. Pauses beyond 30 days require a reactivation plan and may attract re-planning fees.

---

## 7. Working Hours & Communication

### 7.1 Working Hours
Branding Pioneers operates 11:00 AM to 6:00 PM IST, Monday to Friday. All Indian national holidays are non-working days.

### 7.2 Communication Channel
The official WhatsApp group and email are the primary channels for day-to-day coordination. Immediate responses may not always be possible; for calls, request time slots in the WhatsApp group, and the account manager will revert with options.

### 7.3 Updates & Transparency
The team will share work updates, links, and files in the designated WhatsApp group for transparency and real-time feedback.

### 7.4 Onboarding Call (Mandatory)
A detailed onboarding call is mandatory to gather business context, target audiences, brand assets, compliance requirements, and KPIs.

---

## 8. Performance Metrics & Reporting

### 8.1 KPIs
The Agency will define KPIs for each service line and share monthly performance reports with insights and recommendations.

### 8.2 Expectation Management
Digital marketing results are cumulative and depend on multiple factors (market conditions, budgets, competition, seasonality, platform policies). The Agency does not guarantee specific sales, rankings, or ROI unless explicitly agreed in Annexure A.

### 8.3 Strategy Roadmap
A monthly roadmap for the upcoming month will be shared during the review meeting.

---

## 9. Service Level Adjustments & Escalations

### 9.1 SLA Reviews
The SLA may be reviewed annually or as mutually agreed to adapt to business or platform changes.

### 9.2 Escalation Matrix & Contacts

| Priority | Description | Acknowledge | Initial Action | Target Resolution |
|----------|-------------|-------------|----------------|-------------------|
| P1 | Service interruption / ad account down | 2 hours | 4 hours | 1 business day |
| P2 | Degraded performance / critical campaign issue | 4 hours | 1 business day | 2-3 business days |
| P3 | General requests/changes | 1 business day | - | 3-5 business days |

**Escalation Contacts:**
- Client Support Head: Himanshu — +91 84484 73282
- Accounts Manager: Mahroof — +91 95990 62712

---

## 10. Intellectual Property (IP) & Usage Rights

### 10.1 Agency Pre-Existing IP
The Agency retains all rights to methodologies, templates, frameworks, code libraries, design systems, and tools used or developed independently of this Agreement.

### 10.2 Deliverables
Upon full and final payment of all fees and expenses related to a Deliverable, the Agency grants the Client a non-exclusive, perpetual license to use that Deliverable for its internal business purposes, subject to third-party license terms (fonts, stock, plugins, platform terms).

### 10.3 Conditional License / IP Reversion on Default
If payments are overdue, suspended, or the Client fails to provide required notice for pause/termination:
- All licenses to unpaid Deliverables are automatically suspended and revert to the Agency until the default is cured
- The Client shall immediately cease use of the affected Deliverables and remove them from public channels/sites
- The Agency may revoke access to assets, accounts, environments, and files provisioned by the Agency

### 10.4 No Sharing of Agency Property
The Client shall not share, sublicense, or disclose Agency proprietary materials (strategy documents, source files, working files, templates, credentials) to third parties without prior written consent.

### 10.5 Third-Party Materials
Rights to third-party content (stock images, music, plugins) are governed by their respective licenses and may require ongoing fees borne by the Client.

---

## 11. Data Protection & Confidentiality

### 11.1 Data Security
The Agency will implement commercially reasonable security controls and comply with applicable data protection laws for processing Client data.

### 11.2 Confidentiality
Each Party will keep the other Party's Confidential Information strictly confidential and use it solely to perform this Agreement. Confidentiality obligations survive for 3 years post-termination.

### 11.3 NDAs
If a separate NDA is executed, its terms shall be read in harmony; in case of conflict, the more protective clause shall prevail for Confidential Information.

---

## 12. Client Responsibilities & Warranties

### 12.1 Content Ownership
The Client warrants that all content, trademarks, and materials provided do not infringe third-party rights and comply with applicable laws, including advertising platform policies and sector regulations.

### 12.2 Access & Budgets
The Client will provide timely access to required accounts (e.g., ad platforms, analytics, CMS) and ensure budgets are funded.

### 12.3 Platform Responsibility
Where platforms require the Client to be the contracting party (e.g., ad accounts), the Client remains responsible for all platform fees and penalties.

---

## 13. Dispute Resolution

### 13.1 Good-Faith Negotiation (up to 7 days)
Senior representatives will attempt to resolve disputes through discussion.

### 13.2 Mediation (up to 15 days)
If unresolved, Parties will attempt mediation.

### 13.3 Arbitration
Failing mediation, disputes shall be finally resolved by a sole arbitrator appointed mutually under the Arbitration and Conciliation Act, 1996. The seat and venue of arbitration shall be Gurgaon, Haryana. The arbitral proceedings shall be in English.

---

## 14. Liability, Force Majeure & Compliance

### 14.1 Limitation of Liability
Except for wilful misconduct or IP/confidentiality breaches, each Party's aggregate liability is capped at the fees paid by the Client in the preceding 3 months.

### 14.2 Force Majeure
Neither Party is liable for delays caused by events beyond reasonable control (natural disasters, war, acts of government, widespread outages). For clarity, Client personal travel or internal unavailability is not Force Majeure and does not suspend payment or approval obligations.

### 14.3 Compliance with Law
Each Party shall comply with applicable laws and platform policies.

---

## 15. Notices

Official notices shall be sent to the addresses/emails set out below:
- **Agency**: legal@brandingpioneers.com; ${entity.address}
- **Client**: [Client email]; ${params.clientAddress}

Notices are deemed received upon email delivery confirmation or 2 Business Days after courier dispatch.

---

## 16. Miscellaneous

### 16.1 Entire Agreement
This Agreement (including annexures) is the entire agreement and supersedes prior discussions.

### 16.2 Amendments
Any amendment or waiver must be in writing and signed by both Parties.

### 16.3 Assignment
Neither Party may assign this Agreement without the other's prior written consent, except assignment by the Agency to an affiliate as part of internal restructuring.

### 16.4 Governing Law
This Agreement is governed by the laws of India. Subject to Section 13, courts at Gurgaon shall have jurisdiction.

---

## 17. Signatures

### For ${entity.name}, part of ${entity.legalName}
- **Name**: Arush Thapar
- **Title**: Director
- **Signature**: ____________________
- **Date**: ____________________

### For ${params.clientCompany}
- **Name**: ${params.clientSignerName || '____________________'}
- **Title**: ${params.clientSignerTitle || '____________________'}
- **GSTIN**: ${params.clientGst || '____________________'}
- **Signature**: ____________________
- **Date**: ____________________

---

## Annexure A – Scope & Pricing

${scopeTable}

**Billing & Milestones**: Monthly retainer payable in advance, due on or before the 1st of each month.

---

## Annexure B – Contacts, Working Hours & Escalations

- **Working Hours**: 11:00 AM to 6:00 PM IST, Monday to Friday. Indian national holidays observed.
- **Primary Communication**: Official WhatsApp group + email. For calls, propose 2-3 preferred time slots; the account manager will confirm.

**Escalation Contacts**:
- Client Support Head: Himanshu — +91 84484 73282
- Accounts Enquiries: Mahroof — +91 95990 62712

**Operational Notes**:
- All work updates are shared in the WhatsApp group for transparency
- Delays may occur due to high message volume; use structured, consolidated feedback for faster turnaround

---

## Annexure C – Project Pause & Reactivation Policy

- **No Unilateral Pause**: The Client cannot pause Services without 30 days' prior written notice and settlement of all dues up to the pause date.
- **Maximum Pause Window**: Standard pause window is up to 30 days unless otherwise agreed.
- **Reactivation**: Pauses beyond 30 days may require a reactivation fee and revised timelines/roadmap.
- **During Pause**: Access to Agency-provisioned environments and Deliverables may be suspended; licenses to unpaid Deliverables are revoked.
- **Default**: If payment is not made by due dates, the Agency may suspend Services and revoke access; the Client shall not use or share Agency property or affected Deliverables until cure.

---

## Annexure D – Data Processing & Confidentiality (Summary)

- Agency implements reasonable technical/organisational measures to safeguard Client data.
- Client to avoid sharing sensitive personal data unless required and agreed in writing.
- Confidential Information to be used strictly for performance of this Agreement and protected against unauthorised disclosure.

---

**End of Agreement**
`
}

// Helper functions
function getContractEndDate(startDate: Date, duration: string): Date {
  const endDate = new Date(startDate)
  switch (duration) {
    case '6_MONTHS':
      endDate.setMonth(endDate.getMonth() + 6)
      break
    case '12_MONTHS':
      endDate.setMonth(endDate.getMonth() + 12)
      break
    case '24_MONTHS':
      endDate.setMonth(endDate.getMonth() + 24)
      break
    case 'ONGOING':
      endDate.setMonth(endDate.getMonth() + 12) // Default to 12 months for ongoing
      break
    default:
      endDate.setMonth(endDate.getMonth() + 12)
  }
  return endDate
}

function formatPaymentTerms(terms: string): string {
  switch (terms) {
    case 'ADVANCE_100':
      return '100% advance payment before commencement'
    case 'ADVANCE_50':
      return '50% advance, 50% on completion of first milestone'
    case 'NET_15':
      return 'Payment due within 15 days of invoice'
    case 'NET_30':
      return 'Payment due within 30 days of invoice'
    default:
      return 'As mutually agreed'
  }
}

function generateScopeTable(scopeItems: Array<{
  workstream: string
  deliverables: string
  sla: string
  frequency: string
  price: number
  notes?: string
}>): string {
  let table = `| Workstream | Key Deliverables | SLA/Output | Frequency | Price (INR) | Notes |
|------------|------------------|------------|-----------|-------------|-------|
`
  for (const item of scopeItems) {
    table += `| ${item.workstream} | ${item.deliverables} | ${item.sla} | ${item.frequency} | ${formatCurrency(item.price)} | ${item.notes || '-'} |
`
  }
  return table
}

function generateDefaultScopeTable(selectedServices: string[], monthlyRetainer: number): string {
  const serviceCount = selectedServices.length || 1
  const perServicePrice = Math.round(monthlyRetainer / serviceCount)

  let table = `| Workstream | Key Deliverables | SLA/Output | Frequency | Price (INR) | Notes |
|------------|------------------|------------|-----------|-------------|-------|
`

  if (selectedServices.includes('seo')) {
    table += `| SEO | Technical audit, on-page fixes, content optimization | As per strategy | Monthly | ${formatCurrency(perServicePrice)} | Client to provide access |
`
  }
  if (selectedServices.includes('social')) {
    table += `| Social Media | Posts, reels, stories as per plan | Drafts by 15th of prior month | Monthly | ${formatCurrency(perServicePrice)} | 2 rounds of revisions |
`
  }
  if (selectedServices.includes('ads')) {
    table += `| Paid Ads | Search + Social campaigns | Launch within 5 BD of brief | Ongoing | ${formatCurrency(perServicePrice)} | Media budget billed separately |
`
  }
  if (selectedServices.includes('web')) {
    table += `| Website | Development as per scope | UAT within 7 BD of brief | Per milestone | ${formatCurrency(perServicePrice)} | Hosting by Client |
`
  }
  if (selectedServices.includes('gbp')) {
    table += `| GBP/Local SEO | Profile optimization, posts, reviews | Weekly updates | Monthly | ${formatCurrency(perServicePrice)} | Client to provide access |
`
  }
  if (selectedServices.includes('video')) {
    table += `| Video Marketing | Video content as per plan | As per milestone | Monthly | ${formatCurrency(perServicePrice)} | Raw footage by Client |
`
  }
  if (selectedServices.includes('content')) {
    table += `| Content Marketing | Blogs, articles as per plan | As per content calendar | Monthly | ${formatCurrency(perServicePrice)} | SEO-optimized |
`
  }

  return table
}

// Generate SLA as HTML for display
export function generateSLAHtml(params: SLAGeneratorParams): string {
  const markdown = generateSLADocument(params)
  // Simple markdown to HTML conversion for display
  return markdown
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-semibold mb-3 mt-5">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-medium mb-2 mt-4">$1</h3>')
    .replace(/^\*\*(.+?)\*\*/gm, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>')
    .replace(/^---$/gm, '<hr class="my-4 border-slate-200">')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/\n/g, '<br>')
}
