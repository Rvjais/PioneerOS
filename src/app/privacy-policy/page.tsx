export default function PoliciesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-8 md:p-24">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy & Terms of Service</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
          <p>Welcome to Branding Pioneers. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">2. Information Collection</h2>
          <p>We collect information that you provide directly to us when you fill out a form, request a service, or communicate with us.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">3. Use of Information</h2>
          <p>We use the information we collect to provide, maintain, and improve our services, as well as to communicate with you about updates and offers.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
          <p>We implement reasonable security measures to maintain the safety of your personal information. However, no method of transmission over the internet is completely secure.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">5. Contact Us</h2>
          <p>If you have questions or comments about this Privacy Policy, please contact us at privacy@brandingpioneers.com.</p>
        </section>

        <div className="pt-8 mt-8 border-t border-slate-800 text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
    </div>
  )
}
