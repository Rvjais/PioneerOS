'use client'

import { useState } from 'react'
import Link from 'next/link'

interface RiskClient {
  id: string
  name: string
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW'
  riskScore: number
  riskFactors: {
    delays: number
    complaints: number
    lowEngagement: boolean
    paymentIssues: boolean
    escalations: number
  }
  accountManager: string
  services: string[]
  monthlyValue: number
  lastContact: string
  actionRequired: string
}

const RISK_CLIENTS: RiskClient[] = [
  {
    id: '1',
    name: 'Apollo Hospitals',
    riskLevel: 'HIGH',
    riskScore: 85,
    riskFactors: { delays: 5, complaints: 3, lowEngagement: true, paymentIssues: false, escalations: 3 },
    accountManager: 'Priya Sharma',
    services: ['SEO', 'Ads', 'Social'],
    monthlyValue: 150000,
    lastContact: '2024-03-05',
    actionRequired: 'Schedule urgent client meeting'
  },
  {
    id: '2',
    name: 'MedPlus Clinics',
    riskLevel: 'HIGH',
    riskScore: 78,
    riskFactors: { delays: 3, complaints: 2, lowEngagement: true, paymentIssues: true, escalations: 2 },
    accountManager: 'Rahul Verma',
    services: ['SEO', 'Web'],
    monthlyValue: 80000,
    lastContact: '2024-03-08',
    actionRequired: 'Address communication concerns'
  },
  {
    id: '3',
    name: 'HealthFirst Labs',
    riskLevel: 'MEDIUM',
    riskScore: 55,
    riskFactors: { delays: 1, complaints: 1, lowEngagement: false, paymentIssues: false, escalations: 1 },
    accountManager: 'Anita Desai',
    services: ['Ads', 'Social'],
    monthlyValue: 60000,
    lastContact: '2024-03-09',
    actionRequired: 'Review ad performance'
  },
  {
    id: '4',
    name: 'CareConnect',
    riskLevel: 'MEDIUM',
    riskScore: 48,
    riskFactors: { delays: 0, complaints: 0, lowEngagement: false, paymentIssues: true, escalations: 0 },
    accountManager: 'Vikram Singh',
    services: ['SEO', 'Ads', 'Web'],
    monthlyValue: 120000,
    lastContact: '2024-03-10',
    actionRequired: 'Follow up on payment'
  },
  {
    id: '5',
    name: 'WellnessHub',
    riskLevel: 'LOW',
    riskScore: 25,
    riskFactors: { delays: 1, complaints: 0, lowEngagement: false, paymentIssues: false, escalations: 0 },
    accountManager: 'Neha Gupta',
    services: ['Social', 'Web'],
    monthlyValue: 45000,
    lastContact: '2024-03-11',
    actionRequired: 'Routine check-in'
  },
]

export default function ClientRiskEnginePage() {
  const [filter, setFilter] = useState<'all' | 'HIGH' | 'MEDIUM' | 'LOW'>('all')

  const filteredClients = filter === 'all'
    ? RISK_CLIENTS
    : RISK_CLIENTS.filter(c => c.riskLevel === filter)

  const highRiskCount = RISK_CLIENTS.filter(c => c.riskLevel === 'HIGH').length
  const mediumRiskCount = RISK_CLIENTS.filter(c => c.riskLevel === 'MEDIUM').length
  const lowRiskCount = RISK_CLIENTS.filter(c => c.riskLevel === 'LOW').length
  const totalAtRisk = RISK_CLIENTS.reduce((sum, c) => sum + c.monthlyValue, 0)

  const formatCurrency = (amount: number) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`
    }
    return `${(amount / 1000).toFixed(0)}K`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Client Risk Engine</h1>
            <p className="text-red-100">AI-powered client risk detection and monitoring</p>
          </div>
          <div className="text-right">
            <p className="text-red-100 text-sm">Revenue at Risk</p>
            <p className="text-3xl font-bold">{formatCurrency(totalAtRisk)}</p>
          </div>
        </div>
      </div>

      {/* Risk Distribution */}
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('HIGH')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'HIGH' ? 'border-red-500 bg-red-500/10' : 'border-white/10 glass-card hover:border-red-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-400">High Risk</p>
              <p className="text-2xl font-bold text-red-400">{highRiskCount}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter('MEDIUM')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'MEDIUM' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 glass-card hover:border-amber-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-400">Medium Risk</p>
              <p className="text-2xl font-bold text-amber-400">{mediumRiskCount}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setFilter('LOW')}
          className={`p-4 rounded-xl border-2 transition-all ${
            filter === 'LOW' ? 'border-yellow-500 bg-yellow-50' : 'border-white/10 glass-card hover:border-yellow-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm text-slate-400">Low Risk</p>
              <p className="text-2xl font-bold text-yellow-600">{lowRiskCount}</p>
            </div>
          </div>
        </button>
      </div>

      {filter !== 'all' && (
        <button onClick={() => setFilter('all')} className="text-sm text-purple-400 hover:underline">
          Show all clients
        </button>
      )}

      {/* Risk Clients List */}
      <div className="space-y-4">
        {filteredClients.map(client => (
          <div key={client.id} className={`glass-card rounded-xl border-2 p-4 ${
            client.riskLevel === 'HIGH' ? 'border-red-200' :
            client.riskLevel === 'MEDIUM' ? 'border-amber-200' :
            'border-yellow-200'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-white text-lg">{client.name}</h3>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                    client.riskLevel === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                    client.riskLevel === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {client.riskLevel} RISK - Score: {client.riskScore}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  Account Manager: {client.accountManager} | Monthly Value: {formatCurrency(client.monthlyValue)}
                </p>
              </div>
              <div className="flex gap-2">
                {client.services.map(service => (
                  <span key={service} className="px-2 py-1 text-xs bg-slate-800/50 text-slate-300 rounded">
                    {service}
                  </span>
                ))}
              </div>
            </div>

            {/* Risk Factors */}
            <div className="grid grid-cols-5 gap-4 mb-4">
              <div className={`p-3 rounded-lg ${client.riskFactors.delays > 0 ? 'bg-red-500/10' : 'bg-slate-900/40'}`}>
                <p className="text-xs text-slate-400">Delays</p>
                <p className={`text-xl font-bold ${client.riskFactors.delays > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {client.riskFactors.delays}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${client.riskFactors.complaints > 0 ? 'bg-red-500/10' : 'bg-slate-900/40'}`}>
                <p className="text-xs text-slate-400">Complaints</p>
                <p className={`text-xl font-bold ${client.riskFactors.complaints > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {client.riskFactors.complaints}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${client.riskFactors.lowEngagement ? 'bg-amber-500/10' : 'bg-slate-900/40'}`}>
                <p className="text-xs text-slate-400">Engagement</p>
                <p className={`text-xl font-bold ${client.riskFactors.lowEngagement ? 'text-amber-400' : 'text-green-400'}`}>
                  {client.riskFactors.lowEngagement ? 'Low' : 'Good'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${client.riskFactors.paymentIssues ? 'bg-amber-500/10' : 'bg-slate-900/40'}`}>
                <p className="text-xs text-slate-400">Payment</p>
                <p className={`text-xl font-bold ${client.riskFactors.paymentIssues ? 'text-amber-400' : 'text-green-400'}`}>
                  {client.riskFactors.paymentIssues ? 'Issues' : 'OK'}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${client.riskFactors.escalations > 0 ? 'bg-red-500/10' : 'bg-slate-900/40'}`}>
                <p className="text-xs text-slate-400">Escalations</p>
                <p className={`text-xl font-bold ${client.riskFactors.escalations > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                  {client.riskFactors.escalations}
                </p>
              </div>
            </div>

            {/* Action Required */}
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-medium text-purple-800">Action Required: {client.actionRequired}</span>
              </div>
              <button className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600">
                Take Action
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Detection Info */}
      <div className="bg-slate-800 rounded-xl p-6 text-white">
        <h3 className="font-bold text-lg mb-4">How Risk Detection Works</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Delay Detection</h4>
            <p className="text-sm text-slate-300">Monitors task completion vs deadlines across all departments</p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Complaint Analysis</h4>
            <p className="text-sm text-slate-300">Tracks escalations, feedback, and communication issues</p>
          </div>
          <div>
            <h4 className="font-semibold text-purple-300 mb-2">Engagement Tracking</h4>
            <p className="text-sm text-slate-300">Measures response rates, meeting attendance, and interaction frequency</p>
          </div>
        </div>
      </div>
    </div>
  )
}
