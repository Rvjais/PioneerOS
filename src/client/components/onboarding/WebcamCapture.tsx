'use client'

import { useRef, useState, useEffect, useCallback } from 'react'

interface WebcamCaptureProps {
  onCapture: (imageData: string) => void
  label?: string
}

type CameraState = 'loading' | 'active' | 'captured' | 'denied' | 'error'

export default function WebcamCapture({
  onCapture,
  label = 'Take a selfie for identity verification',
}: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [cameraState, setCameraState] = useState<CameraState>('loading')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const stopTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    setCameraState('loading')
    setCapturedImage(null)
    setErrorMessage('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })

      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraState('active')
    } catch (err) {
      const error = err as DOMException
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraState('denied')
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser settings and try again.')
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraState('error')
        setErrorMessage('No camera found on this device.')
      } else {
        setCameraState('error')
        setErrorMessage('Could not access camera. Please check your device and try again.')
      }
    }
  }, [])

  useEffect(() => {
    startCamera()
    return () => {
      stopTracks()
    }
  }, [startCamera, stopTracks])

  const takePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Mirror the image horizontally so it looks natural
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    setCapturedImage(dataUrl)
    setCameraState('captured')
    stopTracks()
  }

  const retake = () => {
    setCapturedImage(null)
    startCamera()
  }

  const confirmPhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-slate-300 text-center">{label}</p>

      {/* Video / Photo preview container */}
      <div className="relative w-64 h-64 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-800 flex items-center justify-center">
        {cameraState === 'loading' && (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg
              className="h-8 w-8 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-xs">Initializing camera...</span>
          </div>
        )}

        {(cameraState === 'denied' || cameraState === 'error') && (
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <svg
              className="h-8 w-8 text-red-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <span className="text-xs text-red-300">{errorMessage}</span>
          </div>
        )}

        {cameraState === 'captured' && capturedImage && (
          <img
            src={capturedImage}
            alt="Captured selfie"
            className="w-full h-full object-cover"
          />
        )}

        {/* Video is always rendered but hidden when not active so ref stays attached */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover scale-x-[-1] ${
            cameraState === 'active' ? 'block' : 'hidden'
          }`}
        />
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Action buttons */}
      <div className="flex gap-3">
        {cameraState === 'active' && (
          <button
            type="button"
            onClick={takePhoto}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Take Photo
          </button>
        )}

        {cameraState === 'captured' && (
          <>
            <button
              type="button"
              onClick={retake}
              className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={confirmPhoto}
              className="px-5 py-2.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              Confirm
            </button>
          </>
        )}

        {(cameraState === 'denied' || cameraState === 'error') && (
          <button
            type="button"
            onClick={startCamera}
            className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  )
}
