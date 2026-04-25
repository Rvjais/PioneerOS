import { faqEntries, getAllCategories, categoryIcons } from '@/shared/constants/knowledgeBase'
import { policyChapters } from '@/shared/constants/policyContent'
import { KnowledgeBaseClient } from './KnowledgeBaseClient'

export default function KnowledgeBasePage() {
  const categories = getAllCategories()

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
        <p className="text-slate-300 mt-1">Find answers to common questions about policies, tools, and processes</p>
      </div>

      <KnowledgeBaseClient
        faqs={faqEntries}
        policies={policyChapters.map(p => ({
          id: p.id,
          title: p.title,
          subtitle: p.subtitle,
          contentPreview: p.content.substring(0, 200) + '...',
        }))}
        categories={categories}
        categoryIcons={categoryIcons}
      />
    </div>
  )
}
