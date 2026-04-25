import IssueDetail from './IssueDetail'

type PageProps = {
  params: Promise<{ issueId: string }>
}

export default async function IssueDetailPage({ params }: PageProps) {
  const { issueId } = await params
  return <IssueDetail issueId={issueId} />
}
