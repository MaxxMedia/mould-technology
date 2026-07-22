import CandidateLinkedInProfile from "@/components/candidate/CandidateLinkedInProfile"

export default async function CandidateProfilePage(props: {
  params: Promise<{ username: string }>
}) {
  const { username } = await props.params

  return <CandidateLinkedInProfile username={username} />
}