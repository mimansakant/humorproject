export type Caption = {
  id: string
  content: string | null
  created_datetime_utc: string
  imageUrl: string | null
  likeCount: number
  userVote: 1 | -1 | null
}
