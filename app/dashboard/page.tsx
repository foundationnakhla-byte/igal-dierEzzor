import { createClient } from '@/lib/supabase/server'
import { DashboardStats } from '@/components/dashboard-stats'
import { RecentCases } from '@/components/recent-cases'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalCases },
    { count: openCases },
    { count: resolvedCases },
    { count: totalConsultations },
    { count: pendingReferrals },
    { data: recentCases },
  ] = await Promise.all([
    supabase.from('cases').select('*', { count: 'exact', head: true }),
    supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('cases').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabase.from('consultations').select('*', { count: 'exact', head: true }),
    supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('cases')
      .select('id, case_number, full_name, legal_issue_type, status, priority, created_at')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
        <p className="text-sm text-muted-foreground mt-1">
          نظرة عامة على نشاط العيادة القانونية
        </p>
      </div>

      <DashboardStats
        totalCases={totalCases ?? 0}
        openCases={openCases ?? 0}
        resolvedCases={resolvedCases ?? 0}
        totalConsultations={totalConsultations ?? 0}
        pendingReferrals={pendingReferrals ?? 0}
      />

      <div className="mt-8">
        <RecentCases cases={recentCases ?? []} />
      </div>
    </div> 
  )
}
