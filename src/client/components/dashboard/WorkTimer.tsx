'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type TimerMode = 'work' | 'break'

const WORK_DURATION = 25 * 60 // 25 minutes in seconds
const BREAK_DURATION = 5 * 60 // 5 minutes in seconds

export function WorkTimer() {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState(WORK_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<TimerMode>('work')
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setCurrentTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      )
      setCurrentDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      )
    }
    updateClock()
    const clockInterval = setInterval(updateClock, 1000)
    return () => clearInterval(clockInterval)
  }, [])

  // Pomodoro timer
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      if (mode === 'work') {
        setSessionsCompleted((prev) => prev + 1)
        setMode('break')
        setTimeLeft(BREAK_DURATION)
      } else {
        setMode('work')
        setTimeLeft(WORK_DURATION)
      }
      setIsRunning(false)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, timeLeft, mode])

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev)
  }, [])

  const resetTimer = useCallback(() => {
    setIsRunning(false)
    setMode('work')
    setTimeLeft(WORK_DURATION)
  }, [])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const progress = mode === 'work'
    ? ((WORK_DURATION - timeLeft) / WORK_DURATION) * 100
    : ((BREAK_DURATION - timeLeft) / BREAK_DURATION) * 100

  return (
    <div className="bg-slate-900/40 rounded-xl border border-white/5 overflow-hidden">
      {/* Live Clock */}
      <div className="p-4 border-b border-white/5 text-center">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">Current Time</p>
        <p className="text-2xl font-bold text-white font-mono tracking-wide">{currentTime || '--:--:-- --'}</p>
        <p className="text-xs text-slate-500 mt-0.5">{currentDate || '---'}</p>
      </div>

      {/* Pomodoro Timer */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider"
            style={{ color: mode === 'work' ? '#f97316' : '#22c55e' }}
          >
            {mode === 'work' ? 'Focus Session' : 'Break Time'}
          </p>
          {sessionsCompleted > 0 && (
            <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
              {sessionsCompleted} done
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${progress}%`,
              backgroundColor: mode === 'work' ? '#f97316' : '#22c55e',
            }}
          />
        </div>

        {/* Timer display */}
        <div className="text-center mb-3">
          <span className="text-3xl font-bold font-mono text-white tracking-wider">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleTimer}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              isRunning
                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                : 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={resetTimer}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
