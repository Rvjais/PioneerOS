export async function syncGoogleDriveFiles(clientId: string): Promise<{ synced: number; errors: string[] }> {
  try {
    const { uploadFileToDrive, isGoogleDriveConnected } = await import('./google-drive')
    const prisma = (await import('@/server/db/prisma')).prisma

    const connectedUsers = await prisma.userGoogleDrive.findMany({
      where: { isConnected: true },
      select: { userId: true },
    })

    if (connectedUsers.length === 0) {
      return { synced: 0, errors: ['No users have Google Drive connected'] }
    }

    let synced = 0
    const errors: string[] = []

    for (const { userId } of connectedUsers) {
      try {
        const isConnected = await isGoogleDriveConnected(userId)
        if (!isConnected) continue

        const now = new Date()
        await uploadFileToDrive(userId, {
          name: `sync-client-${clientId}-${now.toISOString()}.txt`,
          mimeType: 'text/plain',
          buffer: Buffer.from(`Sync marker for client ${clientId} at ${now.toISOString()}`),
        }, {
          year: now.getFullYear(),
          month: now.getMonth() + 1,
          clientName: clientId,
        })

        synced++
      } catch (err) {
        errors.push(`User ${userId}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return { synced, errors }
  } catch (error) {
    console.error('[GoogleDrive] Sync failed:', error)
    return { synced: 0, errors: [`Google Drive sync error: ${error instanceof Error ? error.message : 'Unknown'}`] }
  }
}
