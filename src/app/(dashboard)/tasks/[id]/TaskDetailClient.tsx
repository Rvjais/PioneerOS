'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { UserAvatar } from '@/client/components/ui/UserAvatar'
import { ClientAvatar } from '@/client/components/ui/ClientAvatar'
import { Breadcrumb } from '@/client/components/ui/Breadcrumb'

interface User {
  id: string
  firstName: string
  lastName: string | null
  email?: string | null
  department?: string | null
  role?: string | null
  empId?: string | null
  profile?: { profilePicture?: string | null } | null
}

interface Subtask {
  id: string
  title: string
  isCompleted: boolean
  createdAt: string
  completedAt: string | null
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: User
}

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  department: string
  dueDate: string | null
  startDate: string | null
  createdAt: string
  updatedAt: string
  completedAt: string | null
  estimatedHours: number | null
  actualHours: number | null
  qaStatus: string | null
  qaComments: string | null
  qaReviewedAt: string | null
  assignee: User | null
  creator: User
  reviewer: User | null
  client: {
    id: string
    name: string
    brandName: string | null
    logoUrl: string | null
  } | null
  subtasks: Subtask[]
  comments: Comment[]
}

interface TaskDetailClientProps {
  task: Task
  users: { id: string; firstName: string; lastName: string | null; department: string }[]
  currentUserId: string
  isManager: boolean
}

const statusColors: Record<string, string> = {
  TODO: 'bg-slate-500/20 text-slate-300',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
  REVIEW: 'bg-purple-500/20 text-purple-400',
  DONE: 'bg-green-500/20 text-green-400',
  CANCELLED: 'bg-red-500/20 text-red-400',
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-500/20 text-slate-300',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400',
  HIGH: 'bg-orange-500/20 text-orange-400',
  URGENT: 'bg-red-500/20 text-red-400',
}

export function TaskDetailClient({ task, users, currentUserId, isManager }: TaskDetailClientProps) {
  const router = useRouter()
  const [status, setStatus] = useState(task.status)
  const [saving, setSaving] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const canEdit = isManager || task.assignee?.id === currentUserId || task.creator.id === currentUserId

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setStatus(newStatus)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })
      if (res.ok) {
        setNewComment('')
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setSubmittingComment(false)
    }
  }

  return (
    <div>
      <Breadcrumb items={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Tasks', href: '/tasks' },
        { label: task.title },
      ]} />
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Task Header */}
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
                  {status.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{task.title}</h1>
            </div>
          </div>

          {task.description && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-400 mb-2">Description</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Status Actions */}
          {canEdit && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={saving || status === s}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      status === s
                        ? 'bg-blue-600 text-white'
                        : 'glass-card border border-white/10 text-slate-300 hover:bg-white/10'
                    } disabled:opacity-50`}
                  >
                    {s.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Subtasks */}
        {task.subtasks.length > 0 && (
          <div className="glass-card rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Subtasks ({task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length})
            </h3>
            <div className="space-y-2">
              {task.subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    subtask.isCompleted ? 'bg-green-500/10' : 'bg-slate-800/50'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      subtask.isCompleted
                        ? 'bg-green-500 border-green-500'
                        : 'border-slate-500'
                    }`}
                  >
                    {subtask.isCompleted && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`flex-1 ${subtask.isCompleted ? 'text-slate-400 line-through' : 'text-white'}`}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Comments ({task.comments.length})
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              className="w-full px-4 py-3 glass-card border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {task.comments.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No comments yet</p>
            ) : (
              task.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <UserAvatar user={comment.user} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {comment.user.firstName} {comment.user.lastName}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-300">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Task Info */}
        <div className="glass-card rounded-2xl border border-white/10 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
          <div className="space-y-4">
            {/* Assignee */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2">Assignee</p>
              {task.assignee ? (
                <div className="flex items-center gap-3">
                  <UserAvatar user={task.assignee} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {task.assignee.firstName} {task.assignee.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{task.assignee.department}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Unassigned</p>
              )}
            </div>

            {/* Creator */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2">Created By</p>
              <div className="flex items-center gap-3">
                <UserAvatar user={task.creator} size="sm" />
                <p className="text-sm font-medium text-white">
                  {task.creator.firstName} {task.creator.lastName}
                </p>
              </div>
            </div>

            {/* Reviewer */}
            {task.reviewer && (
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2">Reviewer</p>
                <div className="flex items-center gap-3">
                  <UserAvatar user={task.reviewer} size="sm" />
                  <p className="text-sm font-medium text-white">
                    {task.reviewer.firstName} {task.reviewer.lastName}
                  </p>
                </div>
              </div>
            )}

            {/* Client */}
            {task.client && (
              <div>
                <p className="text-xs font-medium text-slate-400 mb-2">Client</p>
                <Link
                  href={`/clients/${task.client.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors -mx-2"
                >
                  <ClientAvatar
                    client={{
                      id: task.client.id,
                      name: task.client.name,
                      brandName: task.client.brandName,
                      logoUrl: task.client.logoUrl,
                    }}
                    size="sm"
                    showPreview={false}
                  />
                  <p className="text-sm font-medium text-white">
                    {task.client.brandName || task.client.name}
                  </p>
                </Link>
              </div>
            )}

            {/* Department */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Department</p>
              <p className="text-sm text-white">{task.department}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              {task.dueDate && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Due Date</p>
                  <p className="text-sm text-white">
                    {new Date(task.dueDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
              {task.startDate && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">Start Date</p>
                  <p className="text-sm text-white">
                    {new Date(task.startDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Time Tracking */}
            {(task.estimatedHours || task.actualHours) && (
              <div className="grid grid-cols-2 gap-4">
                {task.estimatedHours && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Estimated</p>
                    <p className="text-sm text-white">{task.estimatedHours}h</p>
                  </div>
                )}
                {task.actualHours && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1">Actual</p>
                    <p className="text-sm text-white">{task.actualHours}h</p>
                  </div>
                )}
              </div>
            )}

            {/* Created Date */}
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Created</p>
              <p className="text-sm text-white">
                {new Date(task.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>

            {/* Completed Date */}
            {task.completedAt && (
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Completed</p>
                <p className="text-sm text-green-400">
                  {new Date(task.completedAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* QA Status */}
        {task.qaStatus && (
          <div className="glass-card rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">QA Review</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.qaStatus === 'APPROVED'
                      ? 'bg-green-500/20 text-green-400'
                      : task.qaStatus === 'REJECTED'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {task.qaStatus}
                </span>
              </div>
              {task.qaComments && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">QA Comments</p>
                  <p className="text-sm text-slate-300">{task.qaComments}</p>
                </div>
              )}
              {task.qaReviewedAt && (
                <p className="text-xs text-slate-500">
                  Reviewed on {new Date(task.qaReviewedAt).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  )
}
