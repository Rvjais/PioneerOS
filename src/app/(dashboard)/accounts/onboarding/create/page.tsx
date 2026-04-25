import { Metadata } from 'next'
import CreateOnboardingClient from './CreateOnboardingClient'

export const metadata: Metadata = {
  title: 'Create Onboarding Link | Accounts',
  description: 'Create a new client onboarding link',
}

export default function CreateOnboardingPage() {
  return <CreateOnboardingClient />
}
