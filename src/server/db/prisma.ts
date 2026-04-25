import { PrismaClient } from '@prisma/client'
import { encryptModelData, decryptModelData, decryptModelArray } from './prismaEncryption'

// Models that have sensitive data requiring encryption
const ENCRYPTED_MODELS = [
  'Profile',
  'Client',
  'FreelancerProfile',
  'VendorOnboarding',
  'EntityBankAccount',
  'EntityPaymentGateway',
  'CompanyEntity',
]

// Connection pool config for low RAM VPS
// Adds connection_limit & pool_timeout to DATABASE_URL if not already present
function getPrismaDatasourceUrl(): string {
  const url = process.env.DATABASE_URL || ''
  if (!url) return url
  const separator = url.includes('?') ? '&' : '?'
  const hasLimit = url.includes('connection_limit=')
  const hasTimeout = url.includes('pool_timeout=')
  const params: string[] = []
  if (!hasLimit) params.push('connection_limit=5')
  if (!hasTimeout) params.push('pool_timeout=10')
  return params.length > 0 ? url + separator + params.join('&') : url
}

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    datasources: {
      db: { url: getPrismaDatasourceUrl() },
    },
  })

  // Add encryption middleware for write operations
  client.$use(async (params, next) => {
    const { model, action, args } = params

    // Skip encryption in development (no sensitive data locally)
    // DISABLE_ENCRYPTION is only allowed in non-production environments
    const encryptionDisabled = process.env.DISABLE_ENCRYPTION === 'true' && process.env.NODE_ENV !== 'production'
    if (process.env.NODE_ENV === 'development' || encryptionDisabled || !model || !ENCRYPTED_MODELS.includes(model)) {
      return next(params)
    }

    // Encrypt data on write operations
    if (['create', 'update', 'upsert', 'createMany', 'updateMany'].includes(action)) {
      if (args.data) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map((item: any) => encryptModelData(model, item))
        } else {
          args.data = encryptModelData(model, args.data)
        }
      }

      // Handle upsert
      if (action === 'upsert') {
        if (args.create) {
          args.create = encryptModelData(model, args.create)
        }
        if (args.update) {
          args.update = encryptModelData(model, args.update)
        }
      }
    }

    // Execute the operation
    const result = await next(params)

    // Decrypt data on read operations
    if (result && ['findUnique', 'findFirst', 'findMany', 'create', 'update', 'upsert'].includes(action)) {
      if (Array.isArray(result)) {
        return decryptModelArray(model, result)
      } else if (typeof result === 'object' && result !== null) {
        return decryptModelData(model, result)
      }
    }

    return result
  })

  return client
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

globalThis.prismaGlobal = globalThis.prismaGlobal ?? prismaClientSingleton()
const prisma = globalThis.prismaGlobal

export { prisma }
export default prisma
