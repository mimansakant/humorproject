'use server'

import { createAuthClient } from '@/lib/supabase-server'

export async function castVote(captionId: string, voteValue: 1 | -1 | 0) {
  const supabase = await createAuthClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const profileId = user.id

  if (voteValue === 0) {
    const { error } = await supabase
      .from('caption_votes')
      .delete()
      .eq('caption_id', captionId)
      .eq('profile_id', profileId)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('caption_votes')
      .upsert(
        { caption_id: captionId, profile_id: profileId, vote_value: voteValue },
        { onConflict: 'caption_id,profile_id' }
      )
    if (error) throw new Error(error.message)
  }
}
