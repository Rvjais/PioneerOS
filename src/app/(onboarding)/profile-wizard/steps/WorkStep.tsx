'use client'

import { safeJsonParse } from '@/shared/utils/safeJson'

interface Props {
  data: {
    department: string
    linkedIn: string
    skills: string
    bio: string
  }
  onChange: (data: Partial<Props['data']>) => void
}

const departments = [
  { value: 'WEB', label: 'Web Development' },
  { value: 'SEO', label: 'SEO' },
  { value: 'ADS', label: 'Paid Ads' },
  { value: 'SOCIAL', label: 'Social Media' },
  { value: 'HR', label: 'Human Resources' },
  { value: 'ACCOUNTS', label: 'Accounts' },
  { value: 'SALES', label: 'Sales' },
  { value: 'OPERATIONS', label: 'Operations' },
]

const skillSuggestions = [
  'SEO', 'Google Ads', 'Meta Ads', 'Content Writing', 'Social Media Management',
  'Web Development', 'UI/UX Design', 'Analytics', 'Email Marketing', 'Video Editing',
  'Graphic Design', 'Copywriting', 'Lead Generation', 'CRM', 'Project Management',
  'WordPress', 'Shopify', 'React', 'Node.js', 'Python', 'Data Analysis'
]

export function WorkStep({ data, onChange }: Props) {
  const currentSkills = safeJsonParse<string[]>(data.skills, [])

  const toggleSkill = (skill: string) => {
    const updated = currentSkills.includes(skill)
      ? currentSkills.filter((s: string) => s !== skill)
      : [...currentSkills, skill]
    onChange({ skills: JSON.stringify(updated) })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Department
        </label>
        <select
          value={data.department}
          onChange={(e) => onChange({ department: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-slate-900/40"
          disabled
        >
          {departments.map((dept) => (
            <option key={dept.value} value={dept.value}>
              {dept.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">Department is assigned by HR</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          LinkedIn Profile
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </div>
          <input
            type="url"
            value={data.linkedIn}
            onChange={(e) => onChange({ linkedIn: e.target.value })}
            className="w-full pl-10 pr-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Skills <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-slate-400 mb-3">Select your key skills (minimum 3)</p>
        <div className="flex flex-wrap gap-2">
          {skillSuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                currentSkills.includes(skill)
                  ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500'
                  : 'bg-slate-800/50 text-slate-300 border-2 border-transparent hover:bg-white/10'
              }`}
            >
              {currentSkills.includes(skill) && (
                <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              )}
              {skill}
            </button>
          ))}
        </div>
        {currentSkills.length > 0 && (
          <p className="mt-2 text-sm text-slate-300">
            Selected: {currentSkills.length} skill{currentSkills.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">
          Professional Bio
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => onChange({ bio: e.target.value })}
          className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          rows={4}
          placeholder="Tell us about yourself, your experience, and what you bring to the team..."
          maxLength={500}
        />
        <p className="mt-1 text-xs text-slate-400 text-right">
          {data.bio.length}/500 characters
        </p>
      </div>
    </div>
  )
}
