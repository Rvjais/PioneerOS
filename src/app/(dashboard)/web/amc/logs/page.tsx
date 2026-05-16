export default function WebAMCMaintenanceLogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Maintenance Log</h1>
        <p className="text-slate-500 mt-1">AMC activity and maintenance history</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Client</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Activity</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Status</th>
              <th className="p-4 text-sm font-semibold text-slate-600 dark:text-slate-300">Engineer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {[
              { date: '2023-11-01', client: 'Acme Corp', activity: 'Server Update', status: 'Completed', engineer: 'John Doe' },
              { date: '2023-11-02', client: 'TechFlow', activity: 'Database Backup', status: 'In Progress', engineer: 'Jane Smith' },
              { date: '2023-11-03', client: 'DataSys', activity: 'Security Patch', status: 'Scheduled', engineer: 'Mike Johnson' },
            ].map((log, i) => (
              <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="p-4 text-sm text-slate-900 dark:text-white">{log.date}</td>
                <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{log.client}</td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{log.activity}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                    log.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                    'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{log.engineer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
