'use client'

import { useState } from 'react'

interface ClientKRA {
  client: string
  observationsRemarks: string
  discipline: {
    attendance: Record<string, number>
    productivityScore: Record<string, number>
  }
  learning: {
    topics: Array<{
      name: string
      certificateLink: string
      url: string
      time: number
    }>
    totalTimeByMonth: Record<string, number>
  }
  websiteDelivery: {
    newPagesAdded: string[]
    avgCROScore: number | null
    maintenanceTasksRaised: string
    maintenanceTasksCompleted: string
    toolsConversions: number
  }
  monthlyData: Record<string, number>
  aggregateScore: number
  avgPerformanceScore: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const CLIENT_DATA: ClientKRA[] = [
  {
    client: 'Akropolis Hospital',
    observationsRemarks: 'Strong delivery on service pages. CRO scores improving.',
    discipline: {
      attendance: { Oct: 10, Nov: 0, Dec: 22 },
      productivityScore: { Oct: 0, Nov: 0 }
    },
    learning: {
      topics: [
        { name: 'Next.js Fundamentals', certificateLink: '', url: '', time: 0 },
        { name: 'CRO Best Practices', certificateLink: '', url: '', time: 0 },
      ],
      totalTimeByMonth: {}
    },
    websiteDelivery: {
      newPagesAdded: [
        'https://akropolishospital.com/oncology',
        'https://akropolishospital.com/health-nutrition',
        'https://akropolishospital.com/ophthalmology',
        'https://akropolishospital.com/ent',
        'https://akropolishospital.com/dermatology',
        'https://akropolishospital.com/pediatrics',
        'https://akropolishospital.com/gastroenterology',
        'https://akropolishospital.com/nephrology',
        'https://akropolishospital.com/cardiology',
        'https://akropolishospital.com/obstetrics-gynecology',
        'https://akropolishospital.com/plastic-surgery',
        'https://akropolishospital.com/orthopedics',
      ],
      avgCROScore: 8,
      maintenanceTasksRaised: '3',
      maintenanceTasksCompleted: '100%',
      toolsConversions: 0
    },
    monthlyData: {},
    aggregateScore: 32,
    avgPerformanceScore: 2.05
  },
  {
    client: 'Impact Ortho',
    observationsRemarks: 'New website launched. High maintenance completion rate.',
    discipline: {
      attendance: {},
      productivityScore: {}
    },
    learning: {
      topics: [],
      totalTimeByMonth: {}
    },
    websiteDelivery: {
      newPagesAdded: [
        'https://cheerful-chimera-516c81.netlify.app/ (35 pages)'
      ],
      avgCROScore: 7.5,
      maintenanceTasksRaised: '2',
      maintenanceTasksCompleted: '95%',
      toolsConversions: 0
    },
    monthlyData: {},
    aggregateScore: 28,
    avgPerformanceScore: 1.87
  },
  {
    client: 'Dr Anvesh',
    observationsRemarks: 'Multiple pages delivered. Focus on maintenance tasks.',
    discipline: {
      attendance: {},
      productivityScore: {}
    },
    learning: {
      topics: [],
      totalTimeByMonth: {}
    },
    websiteDelivery: {
      newPagesAdded: [
        'https://dranveshdharanikota.com/contact',
        'https://dranveshdharanikota.com/publications',
        'https://dranveshdharanikota.com/media',
        'https://dranveshdharanikota.com/awards',
        'https://dranveshdharanikota.com/about',
        'https://dranveshdharanikota.com/',
        'https://dranveshdharanikota.com/videos',
        'https://dranveshdharanikota.com/testimonials',
        'https://dranveshdharanikota.com/faqs',
        'https://dranveshdharanikota.com/gallery',
        'https://dranveshdharanikota.com/techniques/icg-fluorescence',
        'https://dranveshdharanikota.com/techniques/vats',
        'https://dranveshdharanikota.com/techniques/crs-hipec',
        'https://dranveshdharanikota.com/techniques/robotic-surgery',
      ],
      avgCROScore: null,
      maintenanceTasksRaised: '10-15',
      maintenanceTasksCompleted: '',
      toolsConversions: 0
    },
    monthlyData: {},
    aggregateScore: 24,
    avgPerformanceScore: 1.6
  },
  {
    client: 'Rapple Skincare',
    observationsRemarks: '1 upsell touchpoint recorded. Good progress on clinical pages.',
    discipline: {
      attendance: {},
      productivityScore: {}
    },
    learning: {
      topics: [],
      totalTimeByMonth: {}
    },
    websiteDelivery: {
      newPagesAdded: [
        'https://therappleskincare.com/index',
        'https://therappleskincare.com/ear-lobe-repair',
        'https://therappleskincare.com/ear-piercing',
        'https://therappleskincare.com/electrocautery-and-wart-removal',
        'https://therappleskincare.com/microneedling',
        'https://therappleskincare.com/clinical-dermatology',
      ],
      avgCROScore: null,
      maintenanceTasksRaised: '12-15',
      maintenanceTasksCompleted: '',
      toolsConversions: 1
    },
    monthlyData: {},
    aggregateScore: 22,
    avgPerformanceScore: 1.47
  },
  {
    client: 'Aitelz',
    observationsRemarks: 'New client onboarded. Initial website setup complete.',
    discipline: {
      attendance: {},
      productivityScore: {}
    },
    learning: {
      topics: [],
      totalTimeByMonth: {}
    },
    websiteDelivery: {
      newPagesAdded: [
        'https://aitelz.com/',
      ],
      avgCROScore: null,
      maintenanceTasksRaised: '5-6',
      maintenanceTasksCompleted: '',
      toolsConversions: 0
    },
    monthlyData: {},
    aggregateScore: 12,
    avgPerformanceScore: 0.8
  },
]

const TEAM_DISCIPLINE = [
  { name: 'Manish', attendance: { Oct: 22, Nov: 21, Dec: 20 }, productivity: { Oct: 85, Nov: 88, Dec: 90 } },
  { name: 'Shivam', attendance: { Oct: 20, Nov: 22, Dec: 21 }, productivity: { Oct: 82, Nov: 85, Dec: 87 } },
  { name: 'Aniket', attendance: { Oct: 21, Nov: 20, Dec: 19 }, productivity: { Oct: 78, Nov: 80, Dec: 82 } },
  { name: 'Chitransh', attendance: { Oct: 19, Nov: 21, Dec: 20 }, productivity: { Oct: 75, Nov: 78, Dec: 80 } },
]

const TEAM_LEARNING = [
  {
    name: 'Manish',
    topics: [
      { name: 'Advanced React Patterns', certificateLink: 'https://cert.example.com/1', time: 4 },
      { name: 'Performance Optimization', certificateLink: 'https://cert.example.com/2', time: 3 },
    ],
    totalHours: 7
  },
  {
    name: 'Shivam',
    topics: [
      { name: 'Next.js 14 Deep Dive', certificateLink: 'https://cert.example.com/3', time: 5 },
      { name: 'TypeScript Mastery', certificateLink: 'https://cert.example.com/4', time: 4 },
    ],
    totalHours: 9
  },
  {
    name: 'Aniket',
    topics: [
      { name: 'CSS Grid & Flexbox', certificateLink: 'https://cert.example.com/5', time: 3 },
    ],
    totalHours: 3
  },
  {
    name: 'Chitransh',
    topics: [
      { name: 'JavaScript Fundamentals', certificateLink: 'https://cert.example.com/6', time: 6 },
      { name: 'React Basics', certificateLink: 'https://cert.example.com/7', time: 4 },
    ],
    totalHours: 10
  },
]

export default function TacticalMeetingPage() {
  const [selectedClient, setSelectedClient] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'discipline' | 'learning' | 'kra'>('overview')

  const selectedClientData = CLIENT_DATA.find(c => c.client === selectedClient)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Tactical Meeting</h1>
            <p className="text-indigo-200">Monthly Performance & KRA Tracking</p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Total Clients</p>
              <p className="text-3xl font-bold">{CLIENT_DATA.length}</p>
            </div>
            <div className="text-right">
              <p className="text-indigo-200 text-sm">Avg Performance</p>
              <p className="text-3xl font-bold">
                {(CLIENT_DATA.reduce((acc, c) => acc + c.avgPerformanceScore, 0) / CLIENT_DATA.length).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        {(['overview', 'discipline', 'learning', 'kra'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800/50'
            }`}
          >
            {tab === 'kra' ? 'KRA - Website Delivery' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Client Performance Table */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40">
              <h2 className="font-semibold text-white">Client Accountability Scores</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400">CLIENT</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">PAGES ADDED</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">CRO SCORE</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">MAINTENANCE</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">UPSELL</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">AGGREGATE</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">AVG SCORE</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {CLIENT_DATA.map(client => (
                    <tr key={client.client} className="border-b border-white/5 hover:bg-slate-900/40">
                      <td className="py-3 px-4">
                        <p className="font-medium text-white">{client.client}</p>
                        <p className="text-xs text-slate-400 truncate max-w-[200px]">{client.observationsRemarks}</p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-semibold text-indigo-600">{client.websiteDelivery.newPagesAdded.length}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {client.websiteDelivery.avgCROScore ? (
                          <span className={`font-semibold ${
                            client.websiteDelivery.avgCROScore >= 8 ? 'text-green-400' :
                            client.websiteDelivery.avgCROScore >= 6 ? 'text-amber-400' : 'text-red-400'
                          }`}>
                            {client.websiteDelivery.avgCROScore}/10
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-300">
                        {client.websiteDelivery.maintenanceTasksCompleted || client.websiteDelivery.maintenanceTasksRaised}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${client.websiteDelivery.toolsConversions > 0 ? 'text-green-400' : 'text-slate-400'}`}>
                          {client.websiteDelivery.toolsConversions}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-bold text-white">{client.aggregateScore}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${
                          client.avgPerformanceScore >= 2 ? 'text-green-400' :
                          client.avgPerformanceScore >= 1.5 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {client.avgPerformanceScore.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedClient(client.client)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40">
              <h2 className="font-semibold text-white">Monthly Score Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 sticky left-0 bg-slate-900/40">CLIENT</th>
                    {MONTHS.map(month => (
                      <th key={month} className="text-center py-3 px-3 text-xs font-semibold text-slate-400 min-w-[60px]">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {CLIENT_DATA.map(client => (
                    <tr key={client.client} className="border-b border-white/5">
                      <td className="py-3 px-4 font-medium text-white sticky left-0 glass-card">{client.client}</td>
                      {MONTHS.map(month => (
                        <td key={month} className="py-3 px-3 text-center text-sm text-slate-300">
                          {client.monthlyData[month] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Discipline Tab */}
      {activeTab === 'discipline' && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Attendance */}
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-slate-900/40">
                <h2 className="font-semibold text-white">Attendance (Biometric)</h2>
                <p className="text-xs text-slate-400">Days present per month</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400">MEMBER</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">OCT</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">NOV</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">DEC</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAM_DISCIPLINE.map(member => (
                    <tr key={member.name} className="border-b border-white/5">
                      <td className="py-3 px-4 font-medium text-white">{member.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${member.attendance.Oct >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
                          {member.attendance.Oct}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${member.attendance.Nov >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
                          {member.attendance.Nov}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${member.attendance.Dec >= 20 ? 'text-green-400' : 'text-amber-400'}`}>
                          {member.attendance.Dec}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Productivity */}
            <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-slate-900/40">
                <h2 className="font-semibold text-white">Productivity Score (Myzen)</h2>
                <p className="text-xs text-slate-400">Score out of 100</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-900/40">
                    <th className="text-left py-2 px-4 text-xs font-semibold text-slate-400">MEMBER</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">OCT</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">NOV</th>
                    <th className="text-center py-2 px-4 text-xs font-semibold text-slate-400">DEC</th>
                  </tr>
                </thead>
                <tbody>
                  {TEAM_DISCIPLINE.map(member => (
                    <tr key={member.name} className="border-b border-white/5">
                      <td className="py-3 px-4 font-medium text-white">{member.name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${member.productivity.Oct >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
                          {member.productivity.Oct}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${member.productivity.Nov >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
                          {member.productivity.Nov}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${member.productivity.Dec >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
                          {member.productivity.Dec}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Learning Tab */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
            <div className="p-4 border-b border-white/10 bg-slate-900/40">
              <h2 className="font-semibold text-white">Learning & Development</h2>
              <p className="text-xs text-slate-400">Courses completed with certificates</p>
            </div>
            <div className="divide-y divide-white/10">
              {TEAM_LEARNING.map(member => (
                <div key={member.name} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white">{member.name}</p>
                      <p className="text-xs text-slate-400">Total Learning: {member.totalHours} hours</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      member.totalHours >= 8 ? 'bg-green-500/20 text-green-400' :
                      member.totalHours >= 5 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {member.topics.length} course{member.topics.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {member.topics.map((topic, idx) => (
                      <div key={topic.name} className="flex items-center justify-between bg-slate-900/40 rounded-lg p-3">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{topic.name}</p>
                          <p className="text-xs text-slate-400">{topic.time} hours</p>
                        </div>
                        {topic.certificateLink && (
                          <a
                            href={topic.certificateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:text-indigo-800"
                          >
                            View Certificate
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Summary */}
          <div className="bg-indigo-500/10 rounded-xl border border-indigo-200 p-4">
            <h3 className="font-semibold text-indigo-800 mb-3">Monthly Learning Summary</h3>
            <div className="grid grid-cols-4 gap-4">
              {TEAM_LEARNING.map(member => (
                <div key={member.name} className="glass-card rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-600">{member.totalHours}h</p>
                  <p className="text-sm text-slate-300">{member.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KRA Tab */}
      {activeTab === 'kra' && (
        <div className="space-y-6">
          {CLIENT_DATA.map(client => (
            <div key={client.client} className="glass-card rounded-xl border border-white/10 overflow-hidden">
              <div className="p-4 border-b border-white/10 bg-slate-900/40 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-white">{client.client}</h2>
                  <p className="text-xs text-slate-400">{client.observationsRemarks}</p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">CRO Score</p>
                    <p className="font-bold text-indigo-600">{client.websiteDelivery.avgCROScore || '-'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Upsells</p>
                    <p className="font-bold text-green-400">{client.websiteDelivery.toolsConversions}</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">
                    New Pages Added ({client.websiteDelivery.newPagesAdded.length})
                  </h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {client.websiteDelivery.newPagesAdded.slice(0, 6).map((url, idx) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-800 truncate bg-slate-900/40 rounded px-2 py-1"
                      >
                        {url}
                      </a>
                    ))}
                    {client.websiteDelivery.newPagesAdded.length > 6 && (
                      <p className="text-xs text-slate-400 px-2 py-1">
                        +{client.websiteDelivery.newPagesAdded.length - 6} more pages
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/40 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Maintenance Tasks</p>
                    <p className="font-semibold text-white">{client.websiteDelivery.maintenanceTasksRaised}</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Completion Rate</p>
                    <p className="font-semibold text-green-400">{client.websiteDelivery.maintenanceTasksCompleted || 'Pending'}</p>
                  </div>
                  <div className="bg-slate-900/40 rounded-lg p-3">
                    <p className="text-xs text-slate-400">Tools Conversions</p>
                    <p className="font-semibold text-indigo-600">{client.websiteDelivery.toolsConversions}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Client Detail Modal */}
      {selectedClient && selectedClientData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedClient(null)}>
          <div className="glass-card rounded-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-semibold text-white">{selectedClientData.client}</h2>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-300">
                Close
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">Observations & Remarks</h3>
                <p className="text-sm text-slate-300 bg-slate-900/40 p-3 rounded">{selectedClientData.observationsRemarks}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">All Pages Added</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {selectedClientData.websiteDelivery.newPagesAdded.map((url, idx) => (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-indigo-600 hover:text-indigo-800 bg-slate-900/40 rounded px-3 py-2"
                    >
                      {url}
                    </a>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-500/10 rounded-lg p-3">
                  <p className="text-xs text-indigo-600">Aggregate Score</p>
                  <p className="text-2xl font-bold text-indigo-700">{selectedClientData.aggregateScore}</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3">
                  <p className="text-xs text-green-400">Avg Performance</p>
                  <p className="text-2xl font-bold text-green-400">{selectedClientData.avgPerformanceScore.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
