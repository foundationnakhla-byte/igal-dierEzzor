import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { CaseProfile } from '@/components/case-profile'
import { CaseConsultations } from '@/components/case-consultations'
import { CaseReferrals } from '@/components/case-referrals'

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: caseData }, { data: consultations }, { data: referrals }, { data: lawyers }] =
    await Promise.all([
      supabase
        .from('cases')
        .select(`
          *,
          assigned_lawyer:assigned_lawyer_id (full_name),
          creator:created_by (full_name)
        `)
        .eq('id', id)
        .single(),
      supabase
        .from('consultations')
        .select(`
          *,
          lawyer:lawyer_id (full_name),
          creator:created_by (full_name)
        `)
        .eq('case_id', id)
        .order('consultation_date', { ascending: false }),
      supabase
        .from('referrals')
        .select(`
          *,
          creator:created_by (full_name)
        `)
        .eq('case_id', id)
        .order('referral_date', { ascending: false }),
      supabase
        .from('profiles')
        .select('id, full_name')
        .in('role', ['lawyer', 'admin', 'manager']),
    ])

  if (!caseData) notFound()

  return (
    <div className="p-6 lg:p-8">
      <CaseProfile caseData={caseData} lawyers={lawyers ?? []} />

      <div className="mt-8 flex flex-col gap-8">
        <CaseConsultations
          caseId={id}
          consultations={consultations ?? []}
          lawyers={lawyers ?? []}
        />
        <CaseReferrals
          caseId={id}
          referrals={referrals ?? []}
        />
      </div>
    </div>
  )
}
