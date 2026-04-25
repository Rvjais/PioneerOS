export async function syncGoogleDriveFiles(clientId: string): Promise<{ synced: number; errors: string[] }> {
  // TODO: Implement Google Drive sync using googleapis
  console.warn('[GoogleDrive] Sync not yet implemented for client:', clientId)
  return { synced: 0, errors: ['Google Drive sync not yet configured'] }
}
