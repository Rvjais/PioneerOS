'use client'

import { useRef, useCallback } from 'react'
import { Type, Pen, Eraser } from 'lucide-react'
import { FieldLabel } from './ui'

interface SignatureCaptureProps {
  signerName: string
  onSignerNameChange: (v: string) => void
  agreed: boolean
  onAgreedChange: (v: boolean) => void
  signatureData: string
  onSignatureDataChange: (v: string) => void
  signatureType: 'type' | 'draw'
  onSignatureTypeChange: (v: 'type' | 'draw') => void
}

export default function SignatureCapture({
  signerName,
  onSignerNameChange,
  agreed,
  onAgreedChange,
  signatureData,
  onSignatureDataChange,
  signatureType,
  onSignatureTypeChange,
}: SignatureCaptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      isDrawingRef.current = true
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const pos = getPos(e)
      ctx.beginPath()
      ctx.moveTo(pos.x, pos.y)
    },
    [getPos]
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawingRef.current) return
      e.preventDefault()
      const ctx = canvasRef.current?.getContext('2d')
      if (!ctx) return
      const pos = getPos(e)
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#10B981'
      ctx.lineTo(pos.x, pos.y)
      ctx.stroke()
    },
    [getPos]
  )

  const stopDrawing = useCallback(() => {
    isDrawingRef.current = false
    const canvas = canvasRef.current
    if (canvas) {
      onSignatureDataChange(canvas.toDataURL())
    }
  }, [onSignatureDataChange])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onSignatureDataChange('')
  }, [onSignatureDataChange])

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel required>Your Full Name</FieldLabel>
        <input
          type="text"
          value={signerName}
          onChange={(e) => onSignerNameChange(e.target.value)}
          placeholder="Enter your full name"
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
        />
      </div>

      <div>
        <FieldLabel>Signature</FieldLabel>
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onSignatureTypeChange('type')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              signatureType === 'type'
                ? 'bg-orange-100 text-orange-600 border border-orange-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Type className="w-4 h-4" /> Type
          </button>
          <button
            onClick={() => {
              onSignatureTypeChange('draw')
              onSignatureDataChange('')
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              signatureType === 'draw'
                ? 'bg-orange-100 text-orange-600 border border-orange-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            <Pen className="w-4 h-4" /> Draw
          </button>
        </div>

        {signatureType === 'type' ? (
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-6 text-center">
            <p
              className="text-3xl text-emerald-600 min-h-[60px] flex items-center justify-center"
              style={{ fontFamily: "'Dancing Script', 'Brush Script MT', cursive" }}
            >
              {signerName || 'Your signature preview'}
            </p>
          </div>
        ) : (
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={600}
              height={200}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full bg-gray-100 border border-gray-200 rounded-xl cursor-crosshair touch-none"
              style={{ height: '150px' }}
            />
            <button
              onClick={clearCanvas}
              className="absolute top-2 right-2 p-1.5 bg-white/80 border border-gray-200 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear signature"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="mt-1 w-4 h-4 rounded border-gray-400 text-orange-500 focus:ring-orange-500/50 bg-white"
        />
        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
          I have read and agree to all terms and conditions stated in this document.
        </span>
      </label>
    </div>
  )
}
