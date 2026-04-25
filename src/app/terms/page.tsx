import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service | PioneerOS',
  description: 'Terms of Service for PioneerOS by Branding Pioneers',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      <p className="text-slate-400 mb-4">Last updated: March 2026</p>
      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-slate-300">
            By accessing or using PioneerOS, you agree to be bound by these Terms of Service
            and all applicable laws and regulations.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">2. Use of Service</h2>
          <p className="text-slate-300">
            You are responsible for maintaining the confidentiality of your account credentials
            and for all activities that occur under your account.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">3. Intellectual Property</h2>
          <p className="text-slate-300">
            All content, features, and functionality of PioneerOS are owned by
            Branding Pioneers and are protected by applicable intellectual property laws.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Contact</h2>
          <p className="text-slate-300">
            For questions about these terms, contact{' '}
            <a href="mailto:legal@brandingpioneers.com" className="text-blue-400 hover:underline">
              legal@brandingpioneers.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
