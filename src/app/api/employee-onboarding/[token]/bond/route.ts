import { NextRequest, NextResponse } from 'next/server'
import { formatDateDDMMYYYY } from '@/shared/utils/cn'
import { prisma } from '@/server/db/prisma'
import { z } from 'zod'

// GET - Fetch Bond content
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
    const bondMonths = proposal.bondDurationMonths || 12
    const salary = proposal.offeredSalary
    const employmentType = proposal.employmentType || 'FULL_TIME'
    const probationMonths = proposal.probationMonths || 3
    const bondDurationFactor = 2
    const maxBondAmount = salary * bondDurationFactor
    const trainingInvestment = salary * 3

    let bondContent: string
    let documentType: string

    if (employmentType === 'FREELANCER') {
      documentType = 'FREELANCER_SERVICE_AGREEMENT'
      bondContent = `FREELANCER SERVICE AGREEMENT

Date: ${today}
Agreement Number: FSA-${proposal.id.slice(-8).toUpperCase()}

This Freelancer Service Agreement ("Agreement") is entered into as of ${today} ("Effective Date") by and between:

PARTY 1 (Company):
${entity.legalName}, a company incorporated under the laws of India, operating under the trade name "${entity.name}", having its registered office at ${entity.address} (hereinafter referred to as the "Company").

PARTY 2 (Contractor):
${candidateName} (hereinafter referred to as the "Contractor")
Department: ${proposal.department}
Engagement: ${proposal.position}
Agreed Fee: ${'\u20B9'}${salary.toLocaleString('en-IN')} per month (or as mutually agreed per deliverable)

WHEREAS the Company wishes to engage the Contractor to provide professional services as described herein, and the Contractor agrees to provide such services on the terms and conditions set forth in this Agreement;

NOW THEREFORE, the parties agree as follows:

1. SCOPE OF WORK

1.1 The Contractor shall provide services as specified in the engagement letter, project briefs, or as communicated by the Company's designated representative from time to time.

1.2 The Contractor shall perform all services professionally, competently, and in accordance with the Company's quality standards and timelines.

1.3 The Company may modify the scope of work by mutual written agreement. Additional scope shall be compensated as agreed between the parties.

2. INDEPENDENT CONTRACTOR STATUS

2.1 The Contractor is engaged as an independent contractor and not as an employee of the Company. Nothing in this Agreement shall be construed to create an employer-employee relationship, partnership, joint venture, or agency.

2.2 The Contractor shall be solely responsible for:
(a) Payment of all taxes, including income tax, GST (if applicable), professional tax, and any other statutory obligations;
(b) Compliance with all applicable laws and regulations;
(c) Obtaining any licenses, registrations, or permits required for providing the services;
(d) Arranging their own workspace, equipment, and tools unless otherwise agreed.

2.3 The Contractor shall not be entitled to any employee benefits including provident fund, ESI, gratuity, medical insurance, paid leave, bonuses, or any other benefits available to the Company's employees.

3. PAYMENT TERMS

3.1 The Company shall pay the Contractor the agreed fee upon satisfactory completion and acceptance of deliverables.

3.2 Payment shall be processed within fifteen (15) working days of submission of a valid invoice and acceptance of deliverables by the Company.

3.3 The Contractor shall submit invoices in the format prescribed by the Company, including all details required for tax compliance.

3.4 The Company shall deduct TDS (Tax Deducted at Source) as per applicable Indian tax laws.

3.5 Payments are contingent upon satisfactory quality of work. The Company may withhold payment for deliverables that do not meet agreed specifications until rectified.

4. INTELLECTUAL PROPERTY ASSIGNMENT

4.1 All Work Product (as defined in the NDA executed between the parties) created by the Contractor in connection with services provided under this Agreement shall be the sole and exclusive property of the Company.

4.2 The Contractor hereby irrevocably assigns and transfers to the Company all right, title, and interest (including all intellectual property rights worldwide) in and to all Work Product, effective immediately upon creation.

4.3 The Contractor shall not retain copies of any Work Product or use any Work Product for personal portfolio, case studies, or any other purpose without the Company's prior written approval.

4.4 The Contractor warrants that all Work Product shall be original and shall not infringe upon the intellectual property rights of any third party. The Contractor shall indemnify the Company against any claims arising from such infringement.

5. CONFIDENTIALITY

5.1 The Contractor's confidentiality obligations are governed by the Non-Disclosure and Confidentiality Agreement ("NDA") executed between the parties, which is incorporated herein by reference.

5.2 All terms and conditions of the NDA shall apply to the Contractor's engagement under this Agreement with full force and effect.

6. TERM AND TERMINATION

6.1 This Agreement shall commence on the Effective Date and shall continue until terminated by either party in accordance with this clause.

6.2 Either party may terminate this Agreement by providing fifteen (15) days' prior written notice to the other party.

6.3 The Company may terminate this Agreement immediately without notice if:
(a) The Contractor breaches any material term of this Agreement or the NDA;
(b) The Contractor fails to deliver work of acceptable quality after being given a reasonable opportunity to rectify;
(c) The Contractor engages in conduct that brings the Company or its clients into disrepute.

6.4 Upon termination, the Contractor shall:
(a) Immediately cease all work and return all Company property and Confidential Information;
(b) Deliver all completed and in-progress Work Product to the Company;
(c) Submit final invoices for approved and completed work within seven (7) days.

6.5 The Company shall pay for all completed and accepted work up to the date of termination.

7. NO EXCLUSIVITY

7.1 Unless otherwise specified in writing, this Agreement does not grant exclusivity to either party. The Contractor may provide services to other clients, provided such engagement does not:
(a) Create a conflict of interest with the Company's business;
(b) Involve direct or indirect competitors of the Company in the healthcare digital marketing space;
(c) Interfere with the Contractor's obligations under this Agreement.

8. NON-DISPARAGEMENT

8.1 During and after the term of this Agreement, the Contractor shall not make any negative, disparaging, or defamatory statements about the Company, its management, employees, clients, services, or business practices, whether orally, in writing, or through any electronic medium.

9. INDEMNIFICATION

9.1 The Contractor shall indemnify, defend, and hold harmless the Company, its directors, officers, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including attorney fees) arising out of or in connection with:
(a) Any breach of this Agreement or the NDA by the Contractor;
(b) Any negligent or wrongful act or omission of the Contractor;
(c) Any infringement of intellectual property rights by the Contractor's Work Product;
(d) Any failure by the Contractor to comply with applicable laws, including tax obligations.

10. DISPUTE RESOLUTION

10.1 Any dispute arising out of or in connection with this Agreement shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996.

10.2 The seat of arbitration shall be Gurgaon, Haryana, India. The arbitration shall be conducted in English by a sole arbitrator mutually agreed upon by the parties.

10.3 The arbitral award shall be final and binding on both parties.

11. GOVERNING LAW AND JURISDICTION

11.1 This Agreement shall be governed by and construed in accordance with the laws of India.

11.2 Subject to Clause 10, the courts in Gurgaon, Haryana shall have exclusive jurisdiction over any matters arising from this Agreement.

12. GENERAL PROVISIONS

12.1 Entire Agreement: This Agreement, together with the NDA, constitutes the entire agreement between the parties and supersedes all prior agreements, negotiations, and understandings.

12.2 Amendment: No modification of this Agreement shall be valid unless in writing and signed by both parties.

12.3 Severability: If any provision of this Agreement is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.

12.4 Waiver: No waiver of any breach shall constitute a waiver of any subsequent breach.

12.5 Assignment: The Contractor may not assign this Agreement or any rights hereunder without the Company's prior written consent.

13. ACKNOWLEDGMENT

13.1 The Contractor acknowledges having read and understood this Agreement, and voluntarily agrees to be bound by its terms and conditions.`

    } else if (employmentType === 'INTERN') {
      documentType = 'INTERNSHIP_AGREEMENT'
      bondContent = `INTERNSHIP AGREEMENT

Date: ${today}
Agreement Number: IA-${proposal.id.slice(-8).toUpperCase()}

This Internship Agreement ("Agreement") is entered into as of ${today} ("Effective Date") by and between:

PARTY 1 (Company):
${entity.legalName}, a company incorporated under the laws of India, operating under the trade name "${entity.name}", having its registered office at ${entity.address} (hereinafter referred to as the "Company").

PARTY 2 (Intern):
${candidateName} (hereinafter referred to as the "Intern")
Department: ${proposal.department}
Designation: ${proposal.position}
Monthly Stipend: ${'\u20B9'}${salary.toLocaleString('en-IN')}

WHEREAS the Company is willing to provide the Intern with an internship opportunity to gain practical experience and professional development in the field of healthcare digital marketing;

NOW THEREFORE, the parties agree as follows:

1. DURATION OF INTERNSHIP

1.1 The internship shall commence on ${formatDateDDMMYYYY(proposal.joiningDate)} and shall continue for a period of ${bondMonths} months, unless terminated earlier in accordance with this Agreement.

1.2 The Company may, at its sole discretion, extend the duration of the internship by mutual written agreement.

2. STIPEND AND PAYMENT

2.1 The Company shall pay the Intern a monthly stipend of ${'\u20B9'}${salary.toLocaleString('en-IN')} ("Stipend").

2.2 The Stipend shall be paid on or before the 7th of each following month, subject to attendance and satisfactory performance.

2.3 The Stipend is inclusive of all amounts. TDS shall be deducted as per applicable Indian tax laws.

2.4 The Intern shall not be entitled to any employee benefits including provident fund, ESI, gratuity, medical insurance, bonuses, or paid leave unless specifically communicated in writing.

3. LEARNING OBJECTIVES AND MENTORSHIP

3.1 The Company shall assign a mentor or supervisor to guide the Intern during the internship period.

3.2 The Intern shall receive training and exposure in areas relevant to the assigned department, which may include but is not limited to:
(a) Healthcare digital marketing strategies and client servicing;
(b) Content creation, design, social media management, or other departmental functions;
(c) Use of industry tools, platforms, and internal systems;
(d) Professional communication and workplace conduct;
(e) Project management and collaborative workflows.

3.3 The Intern is expected to actively participate in assigned tasks, seek feedback, and demonstrate continuous learning throughout the internship.

4. EVALUATION AND PERFORMANCE

4.1 The Intern's performance shall be evaluated periodically based on the following criteria:
(a) Quality and timeliness of assigned work;
(b) Initiative, proactivity, and willingness to learn;
(c) Professional conduct and adherence to Company policies;
(d) Attendance and punctuality;
(e) Collaboration with team members and supervisors.

4.2 The Company shall provide constructive feedback to the Intern at reasonable intervals.

5. CONVERSION TO FULL-TIME EMPLOYMENT

5.1 Upon successful completion of the internship, the Company may, at its sole discretion, offer the Intern a full-time position based on performance, business requirements, and available positions.

5.2 Any offer of full-time employment shall be subject to a separate employment agreement and may include different terms and conditions, including a service bond.

5.3 The internship does not guarantee conversion to full-time employment, and the Intern shall have no claim or expectation thereof.

6. WORKING HOURS AND ATTENDANCE

6.1 The Intern shall adhere to the Company's standard working hours and attendance policies as communicated by the assigned supervisor.

6.2 The Intern shall inform the supervisor in advance of any planned absence and shall seek prior approval for leave.

6.3 Excessive absenteeism or habitual tardiness may result in termination of the internship.

7. NO BOND OBLIGATION

7.1 This internship does not carry any service bond obligation. The Intern is not required to pay any amount to the Company upon completion or early termination of the internship, except as required under Clause 9 (Confidentiality) or in case of damage to Company property.

8. CERTIFICATE OF COMPLETION

8.1 Upon successful completion of the internship period and subject to satisfactory performance, the Company shall issue a Certificate of Internship Completion to the Intern.

8.2 The certificate shall state the duration of the internship, department, and a general description of the role performed.

8.3 No certificate shall be issued if the internship is terminated due to misconduct, breach of this Agreement, or breach of the NDA.

9. CONFIDENTIALITY

9.1 The Intern's confidentiality obligations are governed by the Non-Disclosure and Confidentiality Agreement ("NDA") executed between the parties, which is incorporated herein by reference.

9.2 All terms and conditions of the NDA shall apply to the Intern's engagement with full force and effect, including the survival period specified therein.

10. INTELLECTUAL PROPERTY

10.1 All work product, materials, content, designs, code, strategies, and any other deliverables created by the Intern during the internship shall be the sole and exclusive property of the Company, as further detailed in the NDA.

11. TERMINATION

11.1 Either party may terminate this Agreement by providing seven (7) days' prior written notice.

11.2 The Company may terminate the internship immediately without notice in case of:
(a) Misconduct or violation of Company policies;
(b) Breach of the NDA or this Agreement;
(c) Unsatisfactory performance after reasonable feedback and opportunity to improve;
(d) Any act that brings the Company or its clients into disrepute.

11.3 Upon termination, the Intern shall return all Company property and Confidential Information within twenty-four (24) hours.

12. NON-DISPARAGEMENT

12.1 During and after the internship, the Intern shall not make any negative, disparaging, or defamatory statements about the Company, its management, employees, clients, or business practices.

13. DISPUTE RESOLUTION

13.1 Any dispute arising out of or in connection with this Agreement shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act, 1996.

13.2 The seat of arbitration shall be Gurgaon, Haryana, India. The arbitration shall be conducted in English by a sole arbitrator mutually agreed upon by the parties.

14. GOVERNING LAW AND JURISDICTION

14.1 This Agreement shall be governed by and construed in accordance with the laws of India.

14.2 Subject to Clause 13, the courts in Gurgaon, Haryana shall have exclusive jurisdiction.

15. GENERAL PROVISIONS

15.1 Entire Agreement: This Agreement, together with the NDA, constitutes the entire agreement between the parties regarding the internship.

15.2 Amendment: No modification shall be valid unless in writing and signed by both parties.

15.3 Severability: If any provision is held invalid, the remaining provisions shall continue in full force.

16. ACKNOWLEDGMENT

16.1 The Intern acknowledges having read and understood this Agreement, and voluntarily agrees to be bound by its terms.`

    } else {
      documentType = 'SERVICE_BOND'
      bondContent = `SERVICE BOND AND EMPLOYMENT AGREEMENT

Date: ${today}
Agreement Number: BOND-${proposal.id.slice(-8).toUpperCase()}

This Service Bond and Employment Agreement ("Agreement") is entered into as of ${today} ("Effective Date") by and between:

PARTY 1 (Company):
${entity.legalName}, a company incorporated under the laws of India, operating under the trade name "${entity.name}", having its registered office at ${entity.address} (hereinafter referred to as the "Company", which expression shall, unless repugnant to the context or meaning thereof, include its successors, affiliates, subsidiaries, and assigns).

PARTY 2 (Employee):
${candidateName} (hereinafter referred to as the "Employee")
Department: ${proposal.department}
Designation: ${proposal.position}
Monthly CTC: ${'\u20B9'}${salary.toLocaleString('en-IN')}
Date of Joining: ${formatDateDDMMYYYY(proposal.joiningDate)}

WHEREAS the Company is engaged in the business of healthcare digital marketing and provides specialized training, tools, client exposure, and professional development opportunities to its employees;

AND WHEREAS the Company will invest significant resources in the Employee's training, skill development, access to proprietary tools and systems, and establishment of client relationships;

AND WHEREAS the Employee acknowledges the value of such investment and agrees to serve the Company for a minimum period as specified herein;

NOW THEREFORE, in consideration of the mutual covenants and agreements contained herein, the parties agree as follows:

1. SERVICE COMMITMENT

1.1 The Employee agrees and undertakes to serve the Company for a minimum continuous period of ${bondMonths} months ("Bond Period") commencing from the date of joining, i.e., ${formatDateDDMMYYYY(proposal.joiningDate)}.

1.2 The Bond Period shall commence from the date of joining and shall include the probation period. The Bond Period is not suspended or extended by any leave of absence.

1.3 The Employee acknowledges that the service commitment is a material term of this Agreement and that the Company's decision to employ and invest in the Employee is made in reliance upon this commitment.

2. TRAINING INVESTMENT

2.1 The Company shall invest in the Employee's professional development through:
(a) Structured training programs in healthcare digital marketing, industry-specific knowledge, and relevant tools and technologies;
(b) Access to proprietary tools, platforms, dashboards, and internal systems;
(c) Client exposure and relationship-building opportunities;
(d) Mentorship and guidance from senior professionals;
(e) Workshops, webinars, certifications, and other learning resources.

2.2 The estimated value of the Company's investment in the Employee's training and development over the Bond Period is ${'\u20B9'}${trainingInvestment.toLocaleString('en-IN')}.

2.3 The Employee acknowledges that this investment confers a significant competitive advantage and constitutes valuable consideration for the service commitment under this Agreement.

3. EARLY TERMINATION PENALTY

3.1 If the Employee voluntarily resigns, abandons employment, or is terminated for cause before the completion of the Bond Period, the Employee shall pay the Company an early termination penalty ("Bond Amount") calculated on a pro-rata basis as follows:

Bond Amount = (Remaining Months / ${bondMonths}) x ${'\u20B9'}${maxBondAmount.toLocaleString('en-IN')}

Where:
- "Remaining Months" = ${bondMonths} minus the number of complete months served from the date of joining
- Maximum Bond Amount = ${'\u20B9'}${maxBondAmount.toLocaleString('en-IN')} (${bondDurationFactor} x Monthly CTC x bond duration factor)

3.2 The Bond Amount shall be payable by the Employee within thirty (30) days of the last working day.

3.3 The Company is entitled to deduct the Bond Amount (in whole or in part) from the Employee's final settlement, including salary, leave encashment, or any other dues payable to the Employee.

3.4 If the final settlement is insufficient to cover the Bond Amount, the Employee shall pay the remaining balance within thirty (30) days of demand.

3.5 Failure to pay the Bond Amount shall accrue simple interest at the rate of 18% per annum from the due date until the date of payment.

4. NOTICE PERIOD

4.1 The Employee shall serve the following notice period before the last working day:
(a) During Probation Period: Fifteen (15) calendar days
(b) After Confirmation: Thirty (30) calendar days
(c) Senior Roles (Manager level and above): Sixty (60) calendar days

4.2 The Company may, at its sole discretion, waive the notice period in whole or in part, or accept payment in lieu of notice (calculated on the basis of gross salary for the unserved notice period).

4.3 If the Employee fails to serve the required notice period and the Company has not waived the same, the Employee shall pay the Company an amount equal to the gross salary for the unserved notice period, in addition to any Bond Amount payable.

4.4 Notice of resignation must be submitted in writing (including email) to the Employee's reporting manager and the HR department.

5. PROBATION PERIOD

5.1 The first ${probationMonths} months from the date of joining shall constitute the probation period.

5.2 During probation:
(a) The Employee's performance shall be evaluated monthly against defined parameters;
(b) The Company may terminate the Employee's services with seven (7) days' written notice or payment of seven (7) days' salary in lieu of notice;
(c) The Employee may resign with fifteen (15) days' written notice;
(d) The Bond Period obligations apply from the date of joining, including during probation.

5.3 Upon satisfactory completion of probation, the Employee shall be confirmed in writing by the Company. If no communication is made, probation shall be deemed automatically extended.

5.4 The Company reserves the right to extend the probation period by up to ${probationMonths} additional months if the Employee's performance does not meet the required standards.

6. GARDEN LEAVE

6.1 During the notice period, the Company may, at its sole discretion, place the Employee on garden leave for the whole or any part of the notice period.

6.2 During garden leave, the Employee shall:
(a) Remain available for handover, queries, and assistance as required by the Company;
(b) Not join or provide services to any other employer or entity;
(c) Continue to be bound by all terms of this Agreement, the NDA, and Company policies;
(d) Continue to receive salary and benefits for the garden leave period.

6.3 The Company's decision to place the Employee on garden leave shall not affect the Employee's obligation to pay any Bond Amount or notice period compensation.

7. HANDOVER OBLIGATIONS

7.1 During the notice period, the Employee shall complete a comprehensive knowledge transfer and handover, including:
(a) Documentation of all ongoing projects, tasks, processes, and workflows;
(b) Transfer of all client relationships, communications, and account management responsibilities to the designated successor;
(c) Completion or proper handover of all pending deliverables;
(d) Training of the replacement employee or team member, if required by the Company;
(e) Compilation and submission of all work-related documentation, reports, and records.

7.2 The Employee shall obtain written sign-off from the reporting manager and the HR department confirming satisfactory completion of handover obligations.

7.3 Failure to complete handover obligations may result in withholding of the full and final settlement until such obligations are fulfilled, in addition to any other remedies available to the Company.

7.4 All Company property, including laptops, mobile devices, access cards, ID cards, keys, documents, and any other assets, must be returned on or before the last working day.

8. NON-DISPARAGEMENT

8.1 During and after the term of employment, the Employee shall not make any negative, disparaging, defamatory, or derogatory statements about the Company, its directors, officers, management, employees, clients, services, products, or business practices, whether orally, in writing, or through any electronic or digital medium, including social media.

8.2 This obligation survives the termination of employment for any reason.

9. REFERENCE CHECK CONSENT

9.1 The Employee hereby consents to the Company sharing employment-related information with future employers, background verification agencies, or any other party making a legitimate inquiry, including:
(a) Dates of employment and designation;
(b) Reason for separation;
(c) Whether any Bond Amount or other obligations remain outstanding;
(d) General performance assessment.

9.2 The Employee acknowledges that this consent is irrevocable for the duration of employment and for a period of two (2) years thereafter.

10. EXEMPTIONS

10.1 The Bond Amount may be waived, in whole or in part, only with the prior written approval of the Company's management. Such waiver must be documented and signed by an authorized representative of the Company.

10.2 The Company may, at its sole discretion, consider waiver requests in the following circumstances:
(a) Serious medical condition of the Employee rendering them unable to work (supported by valid medical documentation from a recognized hospital);
(b) Company-initiated termination without cause;
(c) Mutual written agreement between the Employee and the Company.

10.3 Verbal assurances or informal communications shall not constitute a valid waiver of the Bond Amount.

11. FORCE MAJEURE

11.1 Neither party shall be liable for failure to perform obligations under this Agreement if such failure results from circumstances beyond the reasonable control of the affected party, including but not limited to natural disasters, epidemics, pandemics, war, civil unrest, government orders, or any other event of force majeure.

11.2 The affected party shall notify the other party promptly of the force majeure event and its expected duration.

11.3 If a force majeure event continues for more than ninety (90) days, either party may terminate this Agreement without liability for the Bond Amount, subject to settlement of all other outstanding obligations.

12. COMPANY'S RIGHTS AND LIMITATIONS OF LIABILITY

12.1 The Employee acknowledges that the Company retains full discretion in making business decisions, including but not limited to restructuring, reorganization, role changes, transfers, changes in reporting structure, and termination of employment for business reasons.

12.2 The Company shall not be liable to the Employee for any losses, claims, or damages arising from bona fide business decisions, including but not limited to:
(a) Changes in the Employee's role, designation, department, or reporting structure;
(b) Restructuring, downsizing, or reorganization of the Company;
(c) Changes in compensation structure, benefits, or policies (with reasonable notice);
(d) Transfer to a different location, entity, or affiliate of the Company.

12.3 Nothing in this Agreement shall limit the Company's right to terminate the Employee's services in accordance with applicable law and Company policies.

13. INDEMNIFICATION

13.1 The Employee shall indemnify, defend, and hold harmless the Company, its directors, officers, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorney fees and legal costs) arising out of or in connection with:
(a) Any breach of this Agreement or the NDA by the Employee;
(b) Any negligent, wrongful, or fraudulent act or omission of the Employee during the course of employment;
(c) Any damage to Company property, client relationships, or business reputation caused by the Employee;
(d) Any claims by third parties arising from the Employee's actions or omissions during employment.

14. DISPUTE RESOLUTION

14.1 Any dispute, controversy, or claim arising out of or relating to this Agreement, or the breach, termination, or invalidity thereof, shall be settled by arbitration in accordance with the Arbitration and Conciliation Act, 1996 (as amended).

14.2 The seat of arbitration shall be Gurgaon, Haryana, India. The arbitration proceedings shall be conducted in English.

14.3 The arbitral tribunal shall consist of a sole arbitrator mutually appointed by the parties. If the parties fail to agree within thirty (30) days, the arbitrator shall be appointed in accordance with the Act.

14.4 The arbitral award shall be final and binding on both parties.

14.5 Notwithstanding the above, the Company shall be entitled to seek urgent interim relief, including injunctive relief, from any court of competent jurisdiction pending the constitution of the arbitral tribunal.

15. GOVERNING LAW AND JURISDICTION

15.1 This Agreement shall be governed by and construed in accordance with the laws of India.

15.2 Subject to Clause 14, the courts in Gurgaon, Haryana shall have exclusive jurisdiction over any proceedings arising out of or in connection with this Agreement.

16. GENERAL PROVISIONS

16.1 Entire Agreement: This Agreement, together with the NDA and any applicable Company policies, constitutes the entire agreement between the parties with respect to the subject matter hereof.

16.2 Amendment: No modification of this Agreement shall be valid unless in writing and signed by both parties.

16.3 Severability: If any provision is held invalid or unenforceable, the remaining provisions shall continue in full force and effect.

16.4 Waiver: No waiver of any provision on one occasion shall constitute a waiver of such provision on any other occasion. Any waiver must be in writing.

16.5 Assignment: This Agreement is personal to the Employee and may not be assigned. The Company may assign this Agreement to any successor entity.

16.6 Notices: All notices under this Agreement shall be in writing and delivered to the addresses specified herein or to such other address as may be designated by written notice.

17. ACKNOWLEDGMENT

17.1 The Employee acknowledges and confirms that:
(a) They have read this Agreement in its entirety and understand its terms and conditions;
(b) They have had the opportunity to seek independent legal advice before signing;
(c) They voluntarily agree to be bound by this Agreement;
(d) The consideration provided by the Company, including employment, training, tools access, and client exposure, constitutes adequate consideration for the obligations undertaken herein;
(e) The restrictions and obligations in this Agreement are reasonable and necessary to protect the Company's legitimate business interests.`
    }

    return NextResponse.json({
      bondContent,
      bondMonths,
      salary,
      documentType,
      employmentType,
      proposal: { candidateName, department: proposal.department, position: proposal.position, joiningDate: proposal.joiningDate.toISOString() },
      entity,
      alreadySigned: proposal.bondAccepted,
      signedAt: proposal.bondAcceptedAt?.toISOString(),
      signerName: proposal.bondSignerName,
    })
  } catch (error) {
    console.error('Failed to fetch bond:', error)
    return NextResponse.json({ error: 'Failed to fetch bond content' }, { status: 500 })
  }
}

// POST - Sign Bond
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
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })

    const proposal = await prisma.employeeProposal.findUnique({ where: { token } })
    if (!proposal) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (proposal.expiresAt && proposal.expiresAt < new Date()) return NextResponse.json({ error: 'This onboarding link has expired' }, { status: 410 })
    if (!proposal.ndaAccepted) return NextResponse.json({ error: 'Please sign the NDA first' }, { status: 400 })
    if (proposal.bondAccepted) return NextResponse.json({ success: true, message: 'Bond already signed' })

    await prisma.employeeProposal.update({
      where: { token },
      data: {
        bondAccepted: true,
        bondAcceptedAt: new Date(),
        bondSignerName: body.signerName,
        bondSignatureData: body.signatureData || null,
        bondSignatureType: body.signatureType || 'type',
        status: 'BOND_SIGNED',
        currentStep: 5,
      },
    })

    return NextResponse.json({ success: true, currentStep: 5 })
  } catch (error) {
    console.error('Failed to sign bond:', error)
    return NextResponse.json({ error: 'Failed to sign bond' }, { status: 500 })
  }
}
