import { createClient } from '@/lib/supabase/server'
import { ReferralsListClient } from '@/components/referrals-list-client'

export default async function ReferralsPage() {
  const supabase = await createClient()

  const { data: referrals } = await supabase
    .from('referrals')
    .select(`
      id,
      referred_to,
      referral_type,
      referral_reason,
      referral_date,
      status,
      follow_up_date,
      follow_up_notes,
      outcome,
      case_id,
      cases:case_id (case_number, full_name),
      creator:created_by (full_name)
    `)
    .order('referral_date', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">الإحالات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          متابعة جميع الإحالات وحالتها
        </p>
      </div>

      <ReferralsListClient referrals={referrals ?? []} />
    </div>
  )
}
