'use client'

interface Props {
  data: {
    toolsConfirmed: boolean
  }
  onChange: (data: Partial<Props['data']>) => void
}

const tools = [
  {
    name: 'Slack',
    description: 'Team communication and messaging',
    iconType: 'chat',
    status: 'pending',
  },
  {
    name: 'Google Workspace',
    description: 'Email, Calendar, Drive, Docs, Sheets',
    iconType: 'mail',
    status: 'pending',
  },
  {
    name: 'ClickUp',
    description: 'Project and task management',
    iconType: 'check',
    status: 'pending',
  },
  {
    name: 'Zoho CRM',
    description: 'Client relationship management',
    iconType: 'chart',
    status: 'pending',
  },
  {
    name: 'Razorpay',
    description: 'Salary and expense management',
    iconType: 'card',
    status: 'pending',
  },
  {
    name: 'Biometric Attendance',
    description: 'Office attendance system',
    iconType: 'finger',
    status: 'pending',
  },
]

const renderToolIcon = (iconType: string, className: string = "w-8 h-8") => {
  switch (iconType) {
    case 'chat':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
    case 'mail':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
    case 'check':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    case 'chart':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    case 'card':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    case 'finger':
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
    default:
      return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
  }
}

export function ToolsStep({ data, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-amber-500/10 border border-amber-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="font-medium text-amber-900">Tools Access Setup</h4>
            <p className="text-sm text-amber-400 mt-1">
              After your profile is verified, HR will set up access to the following tools. You will receive credentials via email.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tools.map((tool) => (
          <div
            key={tool.name}
            className="flex items-start gap-4 p-4 bg-slate-900/40 border border-white/10 rounded-lg"
          >
            <div className="text-blue-500">{renderToolIcon(tool.iconType)}</div>
            <div className="flex-1">
              <h3 className="font-medium text-white">{tool.name}</h3>
              <p className="text-sm text-slate-300">{tool.description}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Setup
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pt-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={data.toolsConfirmed}
            onChange={(e) => onChange({ toolsConfirmed: e.target.checked })}
            className="w-5 h-5 rounded border-white/20 text-blue-400 focus:ring-blue-500 mt-0.5"
          />
          <div>
            <span className="font-medium text-white">
              I understand that tool access will be provided after verification
            </span>
            <p className="text-sm text-slate-300 mt-1">
              I acknowledge that login credentials for the above tools will be created by HR once my profile is verified.
              I will receive setup instructions via my official email.
            </p>
          </div>
        </label>
      </div>

      <div className="bg-blue-500/10 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
        <ol className="text-sm text-blue-400 space-y-1">
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-400 flex items-center justify-center text-xs font-bold">1</span>
            <span>Complete this profile wizard and submit for verification</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-400 flex items-center justify-center text-xs font-bold">2</span>
            <span>HR reviews and verifies your documents</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-400 flex items-center justify-center text-xs font-bold">3</span>
            <span>Tool access is provisioned and credentials are sent</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-200 text-blue-400 flex items-center justify-center text-xs font-bold">4</span>
            <span>You gain full access to the PioneerOS dashboard</span>
          </li>
        </ol>
      </div>
    </div>
  )
}
