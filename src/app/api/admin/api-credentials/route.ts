import { NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/server/auth/rbac'
import {
  listCredentials,
  saveCredentials,
  CredentialType,
  Environment,
} from '@/server/api-credentials'
import { PROVIDERS } from '@/server/api-credentials/providers'

// GET - List all credentials (masked)
export async function GET() {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const credentials = await listCredentials()

    // Also return provider metadata for UI
    const providers = Object.entries(PROVIDERS).map(([key, config]) => ({
      key,
      name: config.name,
      type: config.type,
      category: config.category,
      description: config.description,
      docsUrl: config.docsUrl,
      fields: config.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        required: f.required,
        placeholder: f.placeholder,
        helpText: f.helpText,
      })),
    }))

    return NextResponse.json({ credentials, providers })
  } catch (error) {
    console.error('Failed to fetch credentials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create new credential
export async function POST(request: Request) {
  try {
    const auth = await requireAuth({ roles: ['SUPER_ADMIN'] })
    if (isAuthError(auth)) return auth.error

    const body = await request.json()
    const { provider, credentialType, name, credentials, environment } = body

    // Validate required fields
    if (!provider || !credentials || typeof credentials !== 'object') {
      return NextResponse.json(
        { error: 'Missing required fields: provider, credentials' },
        { status: 400 }
      )
    }

    // Validate provider exists
    const providerConfig = PROVIDERS[provider]
    if (!providerConfig) {
      return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
    }

    // Validate required credential fields
    for (const field of providerConfig.fields) {
      if (field.required && !credentials[field.key]) {
        return NextResponse.json(
          { error: `Missing required field: ${field.label}` },
          { status: 400 }
        )
      }
    }

    const credentialId = await saveCredentials(
      provider,
      (credentialType as CredentialType) || providerConfig.type,
      name || providerConfig.name,
      credentials,
      auth.user.id,
      (environment as Environment) || 'PRODUCTION'
    )

    return NextResponse.json({
      id: credentialId,
      message: 'Credentials saved successfully',
    })
  } catch (error) {
    console.error('Failed to save credentials:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
