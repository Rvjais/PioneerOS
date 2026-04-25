'use client'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AdminLoginInner() {
    const [status, setStatus] = useState('Verifying token...')
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    useEffect(() => {
        if (!token) {
            setStatus('❌ No token provided. Generate a new one.')
            return
        }

        async function doLogin() {
            try {
                // Step 1: Mark token as used via verify endpoint
                setStatus('Step 1/2: Verifying token...')
                const verifyRes = await fetch('/api/auth/magic-link/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                })

                if (!verifyRes.ok) {
                    const err = await verifyRes.json()
                    setStatus(`❌ ${err.error || 'Verification failed'}`)
                    return
                }

                // Step 2: Sign in via NextAuth credentials
                setStatus('Step 2/2: Signing in...')
                const result = await signIn('magic-link', {
                    token,
                    redirect: false,
                    callbackUrl: '/',
                })

                if (result?.error) {
                    setStatus(`❌ Sign in failed: ${result.error}`)
                } else if (result?.url) {
                    setStatus('✅ Logged in! Redirecting...')
                    window.location.href = result.url
                } else {
                    setStatus('✅ Logged in! Redirecting...')
                    window.location.href = '/'
                }
            } catch (e) {
                setStatus(`❌ Error: ${e}`)
            }
        }

        doLogin()
    }, [token])

    return (
        <div style={{ fontFamily: 'sans-serif', padding: '40px', textAlign: 'center' }}>
            <h2>Admin Login</h2>
            <p>{status}</p>
        </div>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div style={{ padding: 40 }}>Loading...</div>}>
            <AdminLoginInner />
        </Suspense>
    )
}
