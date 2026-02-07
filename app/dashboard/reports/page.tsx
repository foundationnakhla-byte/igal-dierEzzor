import { createClient } from '@/lib/supabase/server'
import { ReportsCharts } from '@/components/reports-charts'

export default async function ReportsPage() {
  const supabase = await createClient()

  const [
    { data: cases },
    { data: consultations },
    { data: referrals },
  ] = await Promise.all([
    supabase.from('cases').select('id, legal_issue_type, status, priority, gender, displacement_status, created_at'),
    supabase.from('consultations').select('id, consultation_type, consultation_date'),
    supabase.from('referrals').select('id, referral_type, status, referral_date'),
  ])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">التقارير</h1>
        <p className="text-sm text-muted-foreground mt-1">
          إحصائيات وتحليلات نشاط العيادة القانونية
        </p>
      </div>

      <ReportsCharts
        cases={cases ?? []}
        consultations={consultations ?? []}
        referrals={referrals ?? []}
      />
    </div>
  )
}
