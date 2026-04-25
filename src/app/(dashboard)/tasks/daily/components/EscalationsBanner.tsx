import type { Escalation } from './types'

interface EscalationsBannerProps {
  escalations: Escalation
}

export function EscalationsBanner({ escalations }: EscalationsBannerProps) {
  if (escalations.underFourHours.length === 0 && escalations.breakdowns.length === 0) {
    return null
  }

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
      <h3 className="text-red-400 font-semibold mb-2">Escalations</h3>
      <div className="grid grid-cols-2 gap-4">
        {escalations.underFourHours.length > 0 && (
          <div>
            <p className="text-sm text-red-300 mb-1">Under 4 Hours Logged:</p>
            <ul className="text-sm text-red-200">
              {escalations.underFourHours.map(e => (
                <li key={e.id}>{e.user.firstName} {e.user.lastName}</li>
              ))}
            </ul>
          </div>
        )}
        {escalations.breakdowns.length > 0 && (
          <div>
            <p className="text-sm text-red-300 mb-1">Breakdown Tasks:</p>
            <ul className="text-sm text-red-200">
              {escalations.breakdowns.map(b => (
                <li key={b.id}>
                  {b.plan.user.firstName}: {b.description.slice(0, 30)}...
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
