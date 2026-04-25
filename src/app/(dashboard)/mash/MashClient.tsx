'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
import { TEAM_CHAT } from '@/shared/constants/constants'
import { UserAvatar } from '@/client/components/ui/UserAvatar'

interface Channel {
  id: string
  name: string
  slug: string
  description: string | null
  type: string
  icon: string | null
  isMash: boolean
  isReadOnly: boolean
  _count: { messages: number; members: number }
  lastReadAt: Date | null
}

interface User {
  id: string
  firstName: string
  lastName: string | null
  department: string
  role: string
  profile: { profilePicture: string | null } | null
}

interface Message {
  id: string
  content: string
  type: string
  priority: string | null
  isPinned: boolean
  createdAt: string
  sender: {
    id: string
    firstName: string
    lastName: string | null
    profile: { profilePicture: string | null } | null
  }
  reactions: string | null
  parentId: string | null
}

interface Props {
  initialChannels: Channel[]
  users: User[]
  currentUserId: string
  currentUserRole: string
  unreadDMs: number
  unreadDMCounts: Record<string, number>
  initialChannelSlug?: string
}

// Department icon mapping
const DEPT_ICONS: Record<string, React.ReactNode> = {
  seo: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  ads: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  social: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>,
  web: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  hr: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  accounts: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  sales: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  operations: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
}

export function MashClient(props: Props) {
  const { initialChannels, users, currentUserId, currentUserRole, unreadDMs, initialChannelSlug } = props
  const [channels] = useState<Channel[]>(initialChannels)
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(() => {
    // Try to find channel by slug first
    if (initialChannelSlug) {
      const found = initialChannels.find(c => c.slug === initialChannelSlug)
      if (found) return found
    }
    // Default to company channel or first channel
    return initialChannels.find(c => c.isMash) || initialChannels[0] || null
  })
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sendingMessage, setSendingMessage] = useState(false)
  const [showDMs, setShowDMs] = useState(false)
  const [selectedDMUser, setSelectedDMUser] = useState<User | null>(null)
  const [dmMessages, setDMMessages] = useState<Message[]>([])
  const [dmSearch, setDmSearch] = useState('')
  const [unreadDMCounts, setUnreadDMCounts] = useState<Record<string, number>>(props.unreadDMCounts || {})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Filter and group users for DMs
  const filteredUsers = useMemo(() => {
    const searchLower = dmSearch.toLowerCase()
    return users.filter(user =>
      user.id !== currentUserId && (
        user.firstName.toLowerCase().includes(searchLower) ||
        (user.lastName?.toLowerCase() || '').includes(searchLower) ||
        user.department.toLowerCase().includes(searchLower)
      )
    )
  }, [users, dmSearch, currentUserId])

  // Group users by department, with unread contacts sorted to top
  const groupedUsers = useMemo(() => {
    // First sort by: has unread (desc), then by firstName (asc)
    const sortedUsers = [...filteredUsers].sort((a, b) => {
      const aUnread = (unreadDMCounts[a.id] || 0) > 0
      const bUnread = (unreadDMCounts[b.id] || 0) > 0
      if (aUnread && !bUnread) return -1
      if (!aUnread && bUnread) return 1
      return a.firstName.localeCompare(b.firstName)
    })

    const groups: Record<string, User[]> = {}
    sortedUsers.forEach(user => {
      const dept = user.department || 'Other'
      if (!groups[dept]) groups[dept] = []
      groups[dept].push(user)
    })
    return groups
  }, [filteredUsers, unreadDMCounts])

  const canPost = !selectedChannel?.isReadOnly ||
    currentUserRole === 'SUPER_ADMIN' ||
    currentUserRole === 'MANAGER'

  useEffect(() => {
    if (selectedChannel && !showDMs) {
      fetchMessages(selectedChannel.id)
    }
  }, [selectedChannel, showDMs])

  useEffect(() => {
    if (selectedDMUser && showDMs) {
      fetchDMMessages(selectedDMUser.id)
    }
  }, [selectedDMUser, showDMs])

  useEffect(() => {
    scrollToBottom()
  }, [messages, dmMessages])

  // Poll for unread DM counts periodically
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const res = await fetch('/api/mash/dm/unread-counts')
        if (res.ok) {
          const data = await res.json()
          setUnreadDMCounts(data)
        }
      } catch (error) {
        console.error('Failed to fetch unread counts:', error)
      }
    }

    fetchUnreadCounts()
    const interval = setInterval(fetchUnreadCounts, 15000) // Poll every 15 seconds

    return () => clearInterval(interval)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMessages = async (channelId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/mash/channels/${channelId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDMMessages = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/mash/dm/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setDMMessages(data)
      }
    } catch (error) {
      console.error('Failed to fetch DMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      if (showDMs && selectedDMUser) {
        const res = await fetch(`/api/mash/dm/${selectedDMUser.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newMessage }),
        })
        if (res.ok) {
          const msg = await res.json()
          setDMMessages(prev => [...prev, msg])
          setNewMessage('')
        }
      } else if (selectedChannel) {
        const res = await fetch(`/api/mash/channels/${selectedChannel.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: newMessage,
            type: selectedChannel.isMash ? 'ANNOUNCEMENT' : 'TEXT',
            priority: selectedChannel.isMash ? 'NORMAL' : undefined,
          }),
        })
        if (res.ok) {
          const msg = await res.json()
          setMessages(prev => [...prev, msg])
          setNewMessage('')
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  }

  const getChannelIcon = (channel: Channel) => {
    if (channel.isMash) return (
      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    )
    if (channel.type === 'PRIVATE') return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Sidebar */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
        {/* Team Chat Header */}
        <div className="p-4 border-b border-slate-200">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {TEAM_CHAT.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">{TEAM_CHAT.description}</p>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Channels (MASH and non-team channels) */}
          <div className="p-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Channels</h2>
            <div className="space-y-1">
              {channels.filter(c => c.isMash || !c.slug.startsWith('team-')).map(channel => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel)
                    setShowDMs(false)
                    setSelectedDMUser(null)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedChannel?.id === channel.id && !showDMs
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {getChannelIcon(channel)}
                  <span className="flex-1 truncate">{channel.name}</span>
                  {channel._count.messages > 0 && (
                    <span className="text-xs text-slate-400">{channel._count.messages}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Team Groups (department channels) */}
          <div className="p-3 border-t border-slate-200">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Team Groups</h2>
            <div className="space-y-1">
              {channels.filter(c => !c.isMash && c.slug.startsWith('team-')).map(channel => (
                <button
                  key={channel.id}
                  onClick={() => {
                    setSelectedChannel(channel)
                    setShowDMs(false)
                    setSelectedDMUser(null)
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedChannel?.id === channel.id && !showDMs
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded ${
                    selectedChannel?.id === channel.id && !showDMs ? 'text-purple-400' : 'text-slate-400'
                  }`}>
                    {DEPT_ICONS[channel.icon || ''] || <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                  </span>
                  <span className="flex-1 truncate">{channel.name}</span>
                  {channel._count.messages > 0 && (
                    <span className="text-xs text-slate-400">{channel._count.messages}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div className="p-3 border-t border-slate-200 flex-1 flex flex-col min-h-0">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              Team Members ({users.length - 1})
              {unreadDMs > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{unreadDMs}</span>
              )}
            </h2>
            {/* Search */}
            <div className="relative mb-2">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={dmSearch}
                onChange={(e) => setDmSearch(e.target.value)}
                placeholder="Search team..."
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
            {/* User list grouped by department */}
            <div className="space-y-3 overflow-y-auto flex-1">
              {Object.entries(groupedUsers).map(([dept, deptUsers]) => (
                <div key={dept}>
                  <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 px-1">{dept}</h3>
                  <div className="space-y-0.5">
                    {deptUsers.map(user => {
                      const unreadCount = unreadDMCounts[user.id] || 0
                      return (
                        <button
                          key={user.id}
                          onClick={() => {
                            setSelectedDMUser(user)
                            setShowDMs(true)
                            setSelectedChannel(null)
                            // Clear unread badge for this contact when opened
                            setUnreadDMCounts(prev => {
                              const updated = { ...prev }
                              delete updated[user.id]
                              return updated
                            })
                          }}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors ${
                            selectedDMUser?.id === user.id && showDMs
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <div className="relative">
                            <UserAvatar user={user} size="xs" showPreview={false} />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
                            )}
                          </div>
                          <span className="flex-1 truncate text-sm">{user.firstName} {user.lastName}</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No team members found</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          {showDMs && selectedDMUser ? (
            <div className="flex items-center gap-3">
              <UserAvatar user={selectedDMUser} size="lg" />
              <div>
                <h2 className="text-slate-900 font-semibold">{selectedDMUser.firstName} {selectedDMUser.lastName}</h2>
                <p className="text-xs text-slate-400">{selectedDMUser.department}</p>
              </div>
            </div>
          ) : selectedChannel ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                {getChannelIcon(selectedChannel)}
              </div>
              <div>
                <h2 className="text-slate-900 font-semibold">{selectedChannel.name}</h2>
                <p className="text-xs text-slate-400">{selectedChannel.description || `${selectedChannel._count.members} members`}</p>
              </div>
            </div>
          ) : (
            <div className="text-slate-400">Select a channel or conversation</div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (showDMs ? dmMessages : messages).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            <>
              {(showDMs ? dmMessages : messages).map((msg, idx) => {
                const isOwn = msg.sender.id === currentUserId
                const prevMsg = (showDMs ? dmMessages : messages)[idx - 1]
                const showDateDivider = !prevMsg || formatDate(prevMsg.createdAt) !== formatDate(msg.createdAt)

                return (
                  <div key={msg.id}>
                    {showDateDivider && (
                      <div className="flex items-center gap-4 my-4">
                        <div className="flex-1 h-px bg-slate-200"></div>
                        <span className="text-xs text-slate-400">{formatDate(msg.createdAt)}</span>
                        <div className="flex-1 h-px bg-slate-200"></div>
                      </div>
                    )}
                    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <UserAvatar
                        user={{
                          id: msg.sender.id,
                          firstName: msg.sender.firstName,
                          lastName: msg.sender.lastName,
                          profile: msg.sender.profile,
                        }}
                        size="sm"
                      />
                      <div className={`flex flex-col ${isOwn ? 'items-end' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-slate-900">
                            {msg.sender.firstName} {msg.sender.lastName}
                          </span>
                          <span className="text-xs text-slate-400">{formatTime(msg.createdAt)}</span>
                          {msg.type === 'ANNOUNCEMENT' && (
                            <span className="px-1.5 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">Announcement</span>
                          )}
                          {msg.isPinned && (
                            <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z" />
                            </svg>
                          )}
                        </div>
                        <div className={`px-4 py-2 rounded-2xl max-w-md ${
                          isOwn
                            ? 'bg-purple-500 text-white'
                            : msg.type === 'ANNOUNCEMENT'
                            ? 'bg-purple-50 text-slate-900 border border-purple-200'
                            : 'bg-slate-100 text-slate-900'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        {(canPost || showDMs) && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder={
                    showDMs
                      ? `Message ${selectedDMUser?.firstName}...`
                      : selectedChannel?.isMash
                      ? 'Post an announcement...'
                      : `Message #${selectedChannel?.name}...`
                  }
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={sendingMessage || !newMessage.trim()}
                className="px-4 py-3 bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors flex items-center gap-2"
              >
                {sendingMessage ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
            {selectedChannel?.isReadOnly && !canPost && (
              <p className="text-xs text-slate-400 mt-2">Only admins can post in this channel</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
