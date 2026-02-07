import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FolderPlus } from 'lucide-react'

interface Case {
  id: string
  case_number: string
  full_name: string
  legal_issue_type: string
  status: string
  priority: string
  created_at: string
}

const statusLabels: Record<string, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  referred: 'محالة',
  resolved: 'محلولة',
  closed: 'مغلقة',
}

const statusVariants: Record<string, string> = {
  open: 'bg-warning/10 text-warning border-warning/20',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  referred: 'bg-accent/10 text-accent border-accent/20',
  resolved: 'bg-success/10 text-success border-success/20',
  closed: 'bg-muted text-muted-foreground border-border',
}

const priorityLabels: Record<string, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
}

const priorityVariants: Record<string, string> = {
  low: 'bg-muted text-muted-foreground border-border',
  medium: 'bg-primary/10 text-primary border-primary/20',
  high: 'bg-warning/10 text-warning border-warning/20',
  urgent: 'bg-destructive/10 text-destructive border-destructive/20',
}

const issueLabels: Record<string, string> = {
  property: 'ملكية عقارية',
  civil_documentation: 'وثائق مدنية',
  family: 'أحوال شخصية',
  criminal: 'قضايا جزائية',
  labor: 'عمل',
  administrative: 'إداري',
  other: 'أخرى',
}

export function RecentCases({ cases }: { cases: Case[] }) {
  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FolderPlus className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            لا توجد قضايا بعد
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            ابدأ بإنشاء قضية جديدة
          </p>
          <Button asChild>
            <Link href="/dashboard/cases/new">إنشاء قضية جديدة</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">آخر القضايا</CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/cases">عرض الكل</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-sm text-muted-foreground">
                <th className="pb-3 text-right font-medium">رقم القضية</th>
                <th className="pb-3 text-right font-medium">الاسم</th>
                <th className="pb-3 text-right font-medium">نوع القضية</th>
                <th className="pb-3 text-right font-medium">الحالة</th>
                <th className="pb-3 text-right font-medium">الأولوية</th>
                <th className="pb-3 text-right font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-3">
                    <Link
                      href={`/dashboard/cases/${c.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {c.case_number}
                    </Link>
                  </td>
                  <td className="py-3 text-sm text-foreground">{c.full_name}</td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {issueLabels[c.legal_issue_type] || c.legal_issue_type}
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className={statusVariants[c.status]}>
                      {statusLabels[c.status] || c.status}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <Badge variant="outline" className={priorityVariants[c.priority]}>
                      {priorityLabels[c.priority] || c.priority}
                    </Badge>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground" dir="ltr">
                    {new Date(c.created_at).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
