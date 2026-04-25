import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/server/auth/auth'
import { redirect } from 'next/navigation'
import PaymentOnboardingWizard from './PaymentOnboardingWizard'

export default async function PaymentOnboardingPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/login')

    return (
        <div className="max-w-5xl mx-auto">
            <PaymentOnboardingWizard />
        </div>
    )
}
