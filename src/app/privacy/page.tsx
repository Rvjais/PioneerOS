import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | PioneerOS',
  description: 'Privacy Policy for PioneerOS by Branding Pioneers',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white px-6 py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-slate-400 mb-4">Last updated: March 2026</p>
      <div className="prose prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-slate-300">
            We collect information you provide directly to us, including name, email address,
            phone number, and other details necessary for account creation and service delivery.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-slate-300">
            We use the information to provide, maintain, and improve our services,
            communicate with you, and ensure platform security.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Security</h2>
          <p className="text-slate-300">
            We implement appropriate security measures to protect your personal information,
            including encryption of sensitive data at rest and in transit.
          </p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-3">4. Contact Us</h2>
          <p className="text-slate-300">
            For privacy-related inquiries, please contact us at{' '}
            <a href="mailto:legal@brandingpioneers.com" className="text-blue-400 hover:underline">
              legal@brandingpioneers.com
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}
