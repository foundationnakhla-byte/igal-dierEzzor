import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const typeLabels: Record<string, string> = {
  in_person: 'شخصي',
  phone: 'هاتفي',
  online: 'عبر الإنترنت',
  field_visit: 'زيارة ميدانية',
}

type ConsultationRow = {
  id: string
  consultation_date: string | null
  consultation_type: string | null
  summary: string | null
  advice_given: string | null
  case_id: string | null
  cases: { case_number: string | null; full_name: string | null } | null
  lawyer: { full_name: string | null } | null
}

export default async function ConsultationsPage() {
  const supabase = await createClient()

  const { data: consultations, error } = await supabase
    .from('consultations')
    .select(
      `
      id,
      consultation_date,
      consultation_type,
      summary,
      advice_given,
      case_id,
      cases:case_id (case_number, full_name),
      lawyer:lawyer_id (full_name)
    `
    )
    .order('consultation_date', { ascending: false })

  // Optional: إذا بدك تعرض رسالة خطأ بدل صفحة فاضية
  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-10">
            <p className="text-sm text-muted-foreground">
              حصل خطأ أثناء جلب الاستشارات.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const rows = (consultations ?? []) as ConsultationRow[]

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">الاستشارات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          جميع الاستشارات القانونية المسجلة في النظام
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm text-muted-foreground">
              لا توجد استشارات مسجلة بعد. أضف استشارة من صفحة القضية.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {rows.map((c) => {
            const caseNumber = c.cases?.case_number ?? '-'
            const caseName = c.cases?.full_name ?? '-'
            const lawyerName = c.lawyer?.full_name ?? '-'

            const typeLabel =
              (c.consultation_type && typeLabels[c.consultation_type]) ||
              c.consultation_type ||
              '-'

            const dateLabel = c.consultation_date
              ? new Date(c.consultation_date).toLocaleDateString('ar-SA')
              : '-'

            return (
              <Card key={c.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Link
                        href={c.case_id ? `/dashboard/cases/${c.case_id}` : '#'}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {caseNumber}
                      </Link>
                      <span className="text-sm text-foreground">{caseName}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="bg-primary/10 text-primary border-primary/20"
                      >
                        {typeLabel}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{dateLabel}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">
                    {c.summary ?? ''}
                  </p>

                  {!!c.advice_given && (
                    <div className="mt-2 rounded bg-muted p-2.5">
                      <p className="text-xs text-muted-foreground mb-0.5">
                        النصيحة القانونية
                      </p>
                      <p className="text-sm text-foreground">{c.advice_given}</p>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-muted-foreground">
                    {'المحامي: ' + lawyerName}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
