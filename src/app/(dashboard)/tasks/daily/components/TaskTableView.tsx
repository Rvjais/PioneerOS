import {
  TASK_STATUSES,
  TASK_PRIORITIES,
} from '@/shared/constants/departmentActivities'
import { BreakthroughBadge } from '@/client/components/tasks'
import type { Task } from './types'

interface TaskTableViewProps {
  tasks: Task[]
  activities: Array<{ id: string; label: string }>
  totalActual: number
  loading: boolean
  onShowAddTask: () => void
  onStartTask: (taskId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onCompleteTask: (task: Task) => void
  onPromptClientCommunication: (taskId: string) => void
}

const getStatusColor = (status: string) => {
  return TASK_STATUSES.find(s => s.id === status)?.color || 'bg-slate-800/50 text-slate-200'
}

const getRowClass = (task: Task) => {
  if (task.isBreakdown) return 'bg-red-500/10 border-red-200'
  if (task.status === 'COMPLETED') return 'bg-green-500/10 border-green-200'
  if (task.status === 'IN_PROGRESS') return 'bg-blue-500/10 border-blue-200'
  return 'glass-card border-white/10'
}

export function TaskTableView({
  tasks,
  activities,
  totalActual,
  loading,
  onShowAddTask,
  onStartTask,
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onPromptClientCommunication,
}: TaskTableViewProps) {
  return (
    <div className="glass-card rounded-xl shadow-none overflow-hidden">
      {/* Table Header */}
      <div className="bg-slate-800/50 border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-200">Task Details</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowAddTask}
            className="px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40 border-b border-white/10">
            <tr>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Timestamp</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Task</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Client</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Allocated By</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Status</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Type</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Rating</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Started</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Completed</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Deadline</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Deliverable</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">Remarks</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs">WhatsApp</th>
              <th className="px-2 py-3 text-left font-medium text-slate-300 text-xs w-28">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={14} className="px-4 py-8 text-center text-slate-400">
                  No tasks planned yet. Click &quot;Add Task&quot; to start planning your day.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className={`border-b ${getRowClass(task)} transition-colors hover:bg-slate-900/40`}>
                  {/* Timestamp */}
                  <td className="px-2 py-2 text-slate-400 text-xs whitespace-nowrap">
                    {new Date(task.addedAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  {/* Task Name */}
                  <td className="px-2 py-2 text-slate-200 text-sm max-w-[200px]">
                    <div className="font-medium truncate" title={task.description}>{task.description}</div>
                    {task.notes && (
                      <p className="text-xs text-slate-400 truncate" title={task.notes}>{task.notes}</p>
                    )}
                  </td>
                  {/* Client Name */}
                  <td className="px-2 py-2 text-slate-200 text-sm font-medium">{task.client?.name || '-'}</td>
                  {/* Allocated By */}
                  <td className="px-2 py-2 text-slate-300 text-xs">
                    {task.allocatedBy ? `${task.allocatedBy.firstName} ${task.allocatedBy.lastName || ''}`.trim() : 'Self'}
                  </td>
                  {/* Status */}
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${getStatusColor(task.status)}`}>
                        {task.isBreakdown ? 'BREAKDOWN' : task.status}
                      </span>
                      {(task.status === 'COMPLETED' || task.status === 'BREAKDOWN') && (
                        <BreakthroughBadge
                          isBreakthrough={task.isBreakthrough}
                          isBreakdown={task.isBreakdown}
                          status={task.status}
                          size="sm"
                        />
                      )}
                    </div>
                  </td>
                  {/* Type of Task */}
                  <td className="px-2 py-2 text-slate-300 text-xs">
                    {activities.find(a => a.id === task.activityType)?.label || task.activityType}
                  </td>
                  {/* Rating */}
                  <td className="px-2 py-2">
                    {task.rateTask ? (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <svg
                            key={star}
                            className={`w-3 h-3 ${star <= task.rateTask! ? 'text-amber-400' : 'text-slate-200'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">-</span>
                    )}
                  </td>
                  {/* In Progress Timestamp */}
                  <td className="px-2 py-2 text-slate-400 text-xs whitespace-nowrap">
                    {task.startedAt ? new Date(task.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  {/* Completed Timestamp */}
                  <td className="px-2 py-2 text-slate-400 text-xs whitespace-nowrap">
                    {task.completedAt ? new Date(task.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  {/* Deadline */}
                  <td className="px-2 py-2 text-xs whitespace-nowrap">
                    {task.deadline ? (
                      <span className={new Date(task.deadline) < new Date() && task.status !== 'COMPLETED' ? 'text-red-400 font-medium' : 'text-slate-300'}>
                        {new Date(task.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                    ) : '-'}
                  </td>
                  {/* Deliverable */}
                  <td className="px-2 py-2 text-slate-300 text-xs max-w-[100px]">
                    <span className="truncate block" title={task.deliverable || ''}>{task.deliverable || '-'}</span>
                  </td>
                  {/* Remarks */}
                  <td className="px-2 py-2 text-slate-400 text-xs max-w-[100px]">
                    <span className="truncate block" title={task.remarks || ''}>{task.remarks || '-'}</span>
                  </td>
                  {/* WhatsApp Communication */}
                  <td className="px-2 py-2 text-center">
                    {task.clientId ? (
                      task.clientCommunicated ? (
                        <span className="text-green-400" title={`Communicated at ${task.communicatedAt ? new Date(task.communicatedAt).toLocaleString() : ''}`}>
                          <svg className="w-4 h-4 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </span>
                      ) : (
                        <span className="text-slate-300">
                          <svg className="w-4 h-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </span>
                      )
                    ) : (
                      <span className="text-slate-300 text-xs">N/A</span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1">
                      {task.status === 'PLANNED' && (
                        <>
                          <button
                            onClick={() => onStartTask(task.id)}
                            disabled={loading}
                            className="p-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                            title="Start"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1.5 bg-white/10 text-slate-300 rounded hover:bg-white/20"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            disabled={loading}
                            className="p-1.5 bg-red-500/20 text-red-400 rounded hover:bg-red-200 disabled:opacity-50"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => onCompleteTask(task)}
                          disabled={loading}
                          className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50 flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete
                        </button>
                      )}
                      {task.status === 'COMPLETED' && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-green-400">Done</span>
                          {task.clientId && (
                            task.clientCommunicated ? (
                              <span className="flex items-center gap-1 text-xs text-green-400" title="Client notified">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                                </svg>
                              </span>
                            ) : (
                              <button
                                onClick={() => onPromptClientCommunication(task.id)}
                                className="text-xs text-amber-400 hover:text-amber-400 flex items-center gap-1"
                                title="Notify client"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Notify
                              </button>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Warning for under 4 hours */}
      {totalActual > 0 && totalActual < 4 && (
        <div className="bg-red-500/10 border-t border-red-200 px-4 py-3">
          <p className="text-red-400 font-medium text-sm">
            Warning: You have logged only {totalActual.toFixed(1)} hours. Minimum 4 hours required.
          </p>
        </div>
      )}
    </div>
  )
}
