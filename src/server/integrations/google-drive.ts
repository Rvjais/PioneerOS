import { drive_v3, auth as googleAuth } from '@googleapis/drive'
import { prisma } from '@/server/db/prisma'
import { encrypt, decrypt } from '@/server/security/encryption'

// Lightweight OAuth2 client (replaces full 196MB googleapis package)
function createGoogleAuth() {
  return new googleAuth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  )
}

function createDriveClient(authClient: InstanceType<typeof googleAuth.OAuth2>) {
  return new drive_v3.Drive({ auth: authClient })
}

// Google OAuth2 Configuration
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Access to files created by app
  'https://www.googleapis.com/auth/userinfo.email',
]

const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || (
  (process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL)
    ? `${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL}/api/google-drive/callback`
    : 'http://localhost:3000/api/google-drive/callback'
)

// Create OAuth2 client
export function createOAuth2Client() {
  return createGoogleAuth()
}

// Generate OAuth URL for user to authorize
export function getAuthUrl(userId: string): string {
  const oauth2Client = createOAuth2Client()

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Force to get refresh token
    state: userId, // Pass userId through OAuth flow
  })
}

// Exchange authorization code for tokens
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

// Get authenticated Drive client for a user
export async function getDriveClient(userId: string) {
  const userDrive = await prisma.userGoogleDrive.findUnique({
    where: { userId },
  })

  if (!userDrive) {
    throw new Error('Google Drive not connected for this user')
  }

  const oauth2Client = createOAuth2Client()
  oauth2Client.setCredentials({
    access_token: decrypt(userDrive.accessToken),
    refresh_token: decrypt(userDrive.refreshToken),
  })

  // Check if token is expired and refresh if needed
  if (new Date() >= userDrive.tokenExpiry) {
    const { credentials } = await oauth2Client.refreshAccessToken()

    // Update stored tokens (encrypt before persisting)
    await prisma.userGoogleDrive.update({
      where: { userId },
      data: {
        accessToken: encrypt(credentials.access_token!),
        tokenExpiry: new Date(credentials.expiry_date!),
        lastSyncAt: new Date(),
      },
    })

    oauth2Client.setCredentials(credentials)
  }

  return createDriveClient(oauth2Client)
}

// Get or create the PioneerOS root folder in user's Drive
async function getOrCreateRootFolder(drive: drive_v3.Drive, userId: string) {
  const userDrive = await prisma.userGoogleDrive.findUnique({
    where: { userId },
  })

  if (userDrive?.rootFolderId) {
    // Verify folder still exists
    try {
      await drive.files.get({ fileId: userDrive.rootFolderId })
      return userDrive.rootFolderId
    } catch {
      // Folder deleted, create new one
    }
  }

  // Create PioneerOS folder
  const folderMetadata = {
    name: 'PioneerOS',
    mimeType: 'application/vnd.google-apps.folder',
  }

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  })

  // Save folder ID
  await prisma.userGoogleDrive.update({
    where: { userId },
    data: { rootFolderId: folder.data.id },
  })

  return folder.data.id!
}

// Get or create nested folder structure: PioneerOS/{Year}/{Month}/{ClientName}/
async function getOrCreateFolderPath(
  drive: drive_v3.Drive,
  userId: string,
  year: number,
  month: number,
  clientName?: string
): Promise<string> {
  const rootFolderId = await getOrCreateRootFolder(drive, userId)

  // Create year folder
  const yearFolderId = await getOrCreateSubFolder(drive, rootFolderId, year.toString())

  // Create month folder (e.g., "01-January")
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December']
  const monthFolderName = `${month.toString().padStart(2, '0')}-${monthNames[month - 1]}`
  const monthFolderId = await getOrCreateSubFolder(drive, yearFolderId, monthFolderName)

  // If client specified, create client folder
  if (clientName) {
    return await getOrCreateSubFolder(drive, monthFolderId, clientName)
  }

  return monthFolderId
}

// Helper to get or create a subfolder
async function getOrCreateSubFolder(
  drive: drive_v3.Drive,
  parentFolderId: string,
  folderName: string
): Promise<string> {
  // Escape single quotes to prevent query injection
  const safeName = folderName.replace(/'/g, "\\'")
  // Check if folder exists
  const response = await drive.files.list({
    q: `name='${safeName}' and '${parentFolderId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: 'files(id, name)',
  })

  if (response.data.files && response.data.files.length > 0) {
    return response.data.files[0].id!
  }

  // Create folder
  const folder = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentFolderId],
    },
    fields: 'id',
  })

  return folder.data.id!
}

// Upload file to Google Drive
export async function uploadFileToDrive(
  userId: string,
  file: {
    name: string
    mimeType: string
    buffer: Buffer
  },
  options: {
    year: number
    month: number
    clientName?: string
  }
): Promise<{
  fileId: string
  webViewLink: string
  thumbnailLink?: string
}> {
  const drive = await getDriveClient(userId)

  // Get target folder
  const folderId = await getOrCreateFolderPath(
    drive,
    userId,
    options.year,
    options.month,
    options.clientName
  )

  // Upload file
  const { Readable } = await import('stream')
  const stream = Readable.from(file.buffer)

  const response = await drive.files.create({
    requestBody: {
      name: file.name,
      parents: [folderId],
    },
    media: {
      mimeType: file.mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, thumbnailLink',
  })

  // Make file viewable within the organization's domain
  // TODO: Configure GOOGLE_WORKSPACE_DOMAIN env var per deployment; falls back to 'anyone' if not set
  const shareType = process.env.GOOGLE_WORKSPACE_DOMAIN ? 'domain' : 'anyone'
  await drive.permissions.create({
    fileId: response.data.id!,
    requestBody: {
      role: 'reader',
      type: shareType,
      ...(process.env.GOOGLE_WORKSPACE_DOMAIN && { domain: process.env.GOOGLE_WORKSPACE_DOMAIN }),
    },
  })

  return {
    fileId: response.data.id!,
    webViewLink: response.data.webViewLink!,
    thumbnailLink: response.data.thumbnailLink || undefined,
  }
}

// Delete file from Google Drive
export async function deleteFileFromDrive(userId: string, fileId: string): Promise<void> {
  const drive = await getDriveClient(userId)
  await drive.files.delete({ fileId })
}

// Check if user has Google Drive connected
export async function isGoogleDriveConnected(userId: string): Promise<boolean> {
  const userDrive = await prisma.userGoogleDrive.findUnique({
    where: { userId },
  })
  return !!userDrive?.isConnected
}

// Disconnect Google Drive
export async function disconnectGoogleDrive(userId: string): Promise<void> {
  await prisma.userGoogleDrive.delete({
    where: { userId },
  }).catch(() => {
    // Ignore if not found
  })
}
