import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// GET - Fetch NDA content
export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const entity = proposal.entityType === 'BRANDING_PIONEERS'
      ? { name: 'Branding Pioneers', legalName: 'ATZ Medappz Pvt. Ltd.', address: '750, Udyog Vihar, Third Floor, Gurgaon, Haryana' }
      : { name: 'ATZ Medappz', legalName: 'ATZ Medappz Pvt. Ltd.', address: '750, Udyog Vihar, Third Floor, Gurgaon, Haryana' }

    const candidateName = proposal.confirmedName || proposal.candidateName
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    const employmentType = proposal.employmentType || 'FULL_TIME'
    const partyLabel = employmentType === 'FREELANCER' ? 'Contractor' : employmentType === 'INTERN' ? 'Intern' : 'Employee'

    const ndaContent = `NON-DISCLOSURE AND CONFIDENTIALITY AGREEMENT

Date: ${today}
Agreement Number: NDA-${proposal.id.slice(-8).toUpperCase()}

This Non-Disclosure and Confidentiality Agreement ("Agreement") is entered into as of ${today} ("Effective Date") by and between:

PARTY 1 (Disclosing Party / Company):
${entity.legalName}, a company incorporated under the laws of India, operating under the trade name "${entity.name}", having its registered office at ${entity.address} (hereinafter referred to as the "Company", which expression shall, unless repugnant to the context or meaning thereof, include its successors, affiliates, subsidiaries, and assigns).

PARTY 2 (Receiving Party / ${partyLabel}):
${candidateName} (hereinafter referred to as the "${partyLabel}")
Department: ${proposal.department}
Designation: ${proposal.position}
Employment Type: ${employmentType.replace('_', ' ')}

WHEREAS the Company is engaged in the business of healthcare digital marketing, including but not limited to providing digital marketing, branding, creative design, web development, content creation, SEO, paid media management, social media management, and related services to healthcare clients including hospitals, clinics, pharmaceutical companies, individual medical practitioners, and healthcare institutions;

AND WHEREAS in the course of the ${partyLabel}'s engagement with the Company, the ${partyLabel} will have access to and become acquainted with Confidential Information (as defined herein) belonging to the Company and its clients;

NOW THEREFORE, in consideration of the ${partyLabel}'s engagement with the Company and the mutual covenants contained herein, the parties agree as follows:

1. DEFINITIONS AND INTERPRETATION

1.1 "Confidential Information" shall mean all information, whether written, oral, electronic, visual, or in any other form, that is disclosed to, accessed by, or developed by the ${partyLabel} during the course of engagement, including but not limited to:

(a) Business Information: business plans, strategies, financial data, revenue models, pricing structures, cost sheets, profit margins, billing records, vendor agreements, partnership details, investor information, and organizational strategies;

(b) Client Information: client names, contact details, client lists, project scopes, campaign strategies, performance metrics, analytics data, advertising budgets, media plans, client communications, proposals, contracts, service agreements, and billing information;

(c) Healthcare-Specific Information: patient data (including any Protected Health Information), hospital operational strategies, doctor credentials and profiles, treatment protocols, hospital revenue data, patient acquisition strategies, medical content, pharmaceutical product information, clinical data, and any information subject to applicable healthcare data protection regulations;

(d) Technical Information: source code, software architecture, algorithms, databases, API keys, login credentials, server configurations, proprietary tools, internal platforms, automation workflows, CRM data, project management systems, and technology stack details;

(e) Creative and Marketing Information: campaign concepts, design assets, brand guidelines, content strategies, SEO strategies, keyword research, advertising copy, media buying strategies, social media playbooks, content calendars, and creative briefs;

(f) Human Resources Information: employee compensation data, organizational charts, hiring plans, performance reviews, training materials, internal policies, and workforce strategies;

(g) Any information that a reasonable person would understand to be confidential given the nature of the information and the circumstances of disclosure.

1.2 "Work Product" shall mean all works, inventions, discoveries, designs, code, content, strategies, campaigns, creative materials, documentation, processes, methodologies, reports, analyses, and any other deliverables created, developed, conceived, or reduced to practice by the ${partyLabel}, solely or jointly, during the course of engagement with the Company.

2. OBLIGATIONS OF CONFIDENTIALITY

2.1 The ${partyLabel} shall hold all Confidential Information in strict confidence and shall not, without the prior written consent of the Company, disclose, publish, or otherwise disseminate any Confidential Information to any third party.

2.2 The ${partyLabel} shall use Confidential Information solely for the purpose of performing duties assigned by the Company and for no other purpose whatsoever.

2.3 The ${partyLabel} shall exercise at least the same degree of care to protect the Confidential Information as the ${partyLabel} would exercise to protect their own confidential information, but in no event less than reasonable care.

2.4 The ${partyLabel} shall not make copies, reproductions, or summaries of Confidential Information except as reasonably necessary for the performance of assigned duties.

2.5 The obligations of confidentiality shall not apply to information that: (a) is or becomes publicly available through no fault of the ${partyLabel}; (b) was known to the ${partyLabel} prior to disclosure by the Company, as evidenced by written records; (c) is independently developed by the ${partyLabel} without use of Confidential Information; or (d) is required to be disclosed by law or court order, provided that the ${partyLabel} gives the Company prompt written notice and cooperates with the Company in seeking a protective order.

3. INTELLECTUAL PROPERTY ASSIGNMENT

3.1 The ${partyLabel} hereby irrevocably assigns and transfers to the Company all right, title, and interest (including all intellectual property rights worldwide) in and to all Work Product. This assignment includes all copyrights, trademark rights, patent rights, trade secret rights, moral rights, and all other intellectual property rights of any kind.

3.2 The ${partyLabel} acknowledges that all Work Product shall be considered "work made for hire" to the fullest extent permitted by applicable law. To the extent any Work Product does not qualify as work made for hire, the ${partyLabel} hereby assigns all rights therein to the Company.

3.3 The ${partyLabel} waives all moral rights in the Work Product to the fullest extent permitted by law, including the right to be identified as the author and the right to object to derogatory treatment of the work.

3.4 The ${partyLabel} shall execute all documents, applications, and instruments, and shall provide all assistance reasonably requested by the Company to perfect, register, or enforce the Company's rights in any Work Product.

3.5 The ${partyLabel} shall not use any Work Product for personal portfolio, case studies, social media, or any other purpose without the prior written approval of the Company.

4. NON-COMPETE

4.1 During the term of engagement and for a period of twelve (12) months following the termination of engagement for any reason ("Non-Compete Period"), the ${partyLabel} shall not, directly or indirectly, whether as an employee, consultant, contractor, partner, agent, or in any other capacity:

(a) Engage with, provide services to, or work for any client or prospective client of the Company to whom the ${partyLabel} provided services or about whom the ${partyLabel} received Confidential Information during the last twelve (12) months of engagement;

(b) Assist any competitor of the Company in soliciting, servicing, or acquiring any client of the Company;

(c) Use any Confidential Information, client relationships, or goodwill developed during the engagement to benefit any competing business.

4.2 The ${partyLabel} acknowledges that the healthcare digital marketing industry involves specialized client relationships and that the restrictions in this clause are reasonable and necessary to protect the Company's legitimate business interests.

5. NON-SOLICITATION

5.1 During the term of engagement and for a period of twelve (12) months following termination, the ${partyLabel} shall not, directly or indirectly:

(a) Solicit, recruit, hire, or attempt to solicit, recruit, or hire any employee, contractor, or consultant of the Company;

(b) Encourage, induce, or attempt to encourage or induce any employee, contractor, or consultant of the Company to leave the Company's employment or engagement;

(c) Solicit, divert, or attempt to solicit or divert any client, customer, vendor, or business partner of the Company.

6. SOCIAL MEDIA AND PUBLIC COMMUNICATIONS

6.1 The ${partyLabel} shall not post, share, publish, or otherwise disseminate on any social media platform, website, blog, forum, or public medium:

(a) Any client work, campaign results, creative assets, or project details without prior written approval from the Company's management;

(b) Any screenshots, recordings, or descriptions of the Company's internal tools, dashboards, platforms, or proprietary systems;

(c) Any information that could identify the Company's clients, their strategies, performance metrics, or business arrangements;

(d) Any statements that could be reasonably interpreted as representing the Company's views or positions without authorization.

6.2 Portfolio use: The ${partyLabel} may include general role descriptions in professional profiles (e.g., LinkedIn) but shall not include specific client names, campaign details, performance data, or proprietary methodologies without written approval.

7. DATA HANDLING AND SECURITY

7.1 The ${partyLabel} shall use only Company-approved tools, devices, platforms, and communication channels for all work-related activities.

7.2 The ${partyLabel} shall not store, transfer, or process any Confidential Information on personal devices, personal cloud storage, personal email accounts, or any unauthorized platform.

7.3 The ${partyLabel} shall not share login credentials, access tokens, API keys, or any other authentication information with any unauthorized person.

7.4 The ${partyLabel} shall immediately report any suspected data breach, unauthorized access, or security incident to the Company's management.

8. RETURN OF MATERIALS

8.1 Upon termination of engagement for any reason, or at any time upon the Company's request, the ${partyLabel} shall within twenty-four (24) hours:

(a) Return to the Company all documents, files (digital and physical), devices, equipment, access cards, keys, and any other Company property in the ${partyLabel}'s possession or control;

(b) Permanently delete all Confidential Information from all personal devices, cloud storage accounts, email accounts, and any other storage medium;

(c) Provide written confirmation of such deletion and return, including a declaration that no copies or summaries of Confidential Information have been retained.

8.2 The Company reserves the right to inspect the ${partyLabel}'s personal devices to verify compliance with this clause, with reasonable notice.

9. BREACH AND REMEDIES

9.1 Liquidated Damages: The ${partyLabel} acknowledges that any breach of this Agreement will cause the Company irreparable harm and that actual damages may be difficult to ascertain. Accordingly, in the event of a breach, the ${partyLabel} agrees to pay the Company liquidated damages equal to six (6) months' gross compensation (salary/fee) as agreed at the time of engagement, in addition to any actual damages suffered by the Company.

9.2 Legal Costs: The ${partyLabel} shall bear all legal costs, attorney fees, and expenses incurred by the Company in enforcing this Agreement or seeking remedies for breach.

9.3 Injunctive Relief: The ${partyLabel} acknowledges that monetary damages may be insufficient to compensate the Company for any breach. The Company shall be entitled to seek injunctive relief, specific performance, or other equitable remedies from any court of competent jurisdiction without the necessity of proving actual damages or posting any bond or security.

9.4 The remedies provided herein are cumulative and not exclusive of any other remedies available to the Company at law or in equity.

10. SEVERABILITY

10.1 If any provision of this Agreement is held to be invalid, illegal, or unenforceable by a court of competent jurisdiction, such provision shall be modified to the minimum extent necessary to make it valid and enforceable, and the remaining provisions shall continue in full force and effect.

10.2 If any restriction in Clauses 4 or 5 is found to be unreasonable in scope, duration, or geographic extent, the court may reduce such scope, duration, or extent to the minimum necessary to make the restriction enforceable.

11. DISPUTE RESOLUTION

11.1 Any dispute, controversy, or claim arising out of or relating to this Agreement, or the breach, termination, or invalidity thereof, shall be settled by arbitration administered in accordance with the Arbitration and Conciliation Act, 1996 (as amended from time to time).

11.2 The seat of arbitration shall be Gurgaon, Haryana, India. The arbitration proceedings shall be conducted in English.

11.3 The arbitral tribunal shall consist of a sole arbitrator mutually appointed by the parties. If the parties fail to agree on an arbitrator within thirty (30) days of the notice of arbitration, the arbitrator shall be appointed in accordance with the provisions of the Arbitration and Conciliation Act, 1996.

11.4 The arbitral award shall be final and binding on both parties and may be entered as a judgment in any court of competent jurisdiction.

12. GOVERNING LAW AND JURISDICTION

12.1 This Agreement shall be governed by and construed in accordance with the laws of India.

12.2 Subject to Clause 11, the courts in Gurgaon, Haryana shall have exclusive jurisdiction over any proceedings arising out of or in connection with this Agreement.

13. SURVIVAL

13.1 The obligations of confidentiality, non-compete, non-solicitation, intellectual property assignment, and all other restrictive covenants under this Agreement shall survive the termination of the ${partyLabel}'s engagement with the Company for a period of two (2) years from the date of termination, regardless of the reason for termination.

14. ENTIRE AGREEMENT

14.1 This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior and contemporaneous agreements, understandings, negotiations, and discussions, whether oral or written, relating to confidentiality.

14.2 No amendment or modification of this Agreement shall be valid or binding unless made in writing and signed by both parties.

14.3 No waiver of any provision of this Agreement shall be effective unless made in writing and signed by the waiving party. A waiver of any provision on one occasion shall not constitute a waiver of such provision on any other occasion.

15. ACKNOWLEDGMENT

15.1 The ${partyLabel} acknowledges that they have read this Agreement in its entirety, understand its terms and conditions, have had the opportunity to seek independent legal advice, and voluntarily agree to be bound by its terms.

15.2 The ${partyLabel} acknowledges that the Company's willingness to engage the ${partyLabel} and provide access to Confidential Information constitutes adequate consideration for this Agreement.`

    return NextResponse.json({
      ndaContent,
      proposal: { candidateName, department: proposal.department, position: proposal.position },
      entity,
      alreadySigned: proposal.ndaAccepted,
      signedAt: proposal.ndaAcceptedAt?.toISOString(),
      signerName: proposal.ndaSignerName,
    })
  } catch (error) {
    console.error('Failed to fetch NDA:', error)
    return NextResponse.json({ error: 'Failed to fetch NDA content' }, { status: 500 })
  }
}

// POST - Sign NDA
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params
    const body = await req.json()
    const schema = z.object({
      signerName: z.string().min(1).max(200),
      agreedToTerms: z.literal(true),
      signatureData: z.string().max(10000).optional(),
      signatureType: z.string().max(50).optional(),
    })
    const result = schema.safeParse(body)
    if (!result.success) return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (proposal.expiresAt && proposal.expiresAt < new Date()) return NextResponse.json({ error: 'This onboarding link has expired' }, { status: 410 })
    if (!proposal.detailsConfirmedAt) return NextResponse.json({ error: 'Please confirm your details first' }, { status: 400 })
    if (proposal.ndaAccepted) return NextResponse.json({ success: true, message: 'NDA already signed' })

    await prisma.employeeProposal.update({
      where: { token },
      data: {
        ndaAccepted: true,
        ndaAcceptedAt: new Date(),
        ndaSignerName: body.signerName,
        ndaSignatureData: body.signatureData || null,
        ndaSignatureType: body.signatureType || 'type',
        status: 'NDA_SIGNED',
        currentStep: 4,
      },
    })

    return NextResponse.json({ success: true, currentStep: 4 })
  } catch (error) {
    console.error('Failed to sign NDA:', error)
    return NextResponse.json({ error: 'Failed to sign NDA' }, { status: 500 })
  }
}
