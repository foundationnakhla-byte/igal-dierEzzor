'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowRight, User, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface CaseData {
  id: string
  case_number: string
  full_name: string
  gender: string
  age: number | null
  id_number: string | null
  phone: string | null
  address: string | null
  displacement_status: string | null
  legal_issue_type: string
  legal_issue_details: string | null
  priority: string
  status: string
  assigned_lawyer_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  assigned_lawyer: { full_name: string } | null
  creator: { full_name: string } | null
}

interface Lawyer {
  id: string
  full_name: string
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

const issueLabels: Record<string, string> = {
  property: 'ملكية عقارية',
  civil_documentation: 'وثائق مدنية',
  family: 'أحوال شخصية',
  criminal: 'قضايا جزائية',
  labor: 'عمل',
  administrative: 'إداري',
  other: 'أخرى',
}

const displacementLabels: Record<string, string> = {
  displaced: 'نازح',
  returnee: 'عائد',
  host_community: 'مجتمع مضيف',
  refugee: 'لاجئ',
}

const genderLabels: Record<string, string> = {
  male: 'ذكر',
  female: 'أنثى',
}

export function CaseProfile({
  caseData,
  lawyers,
}: {
  caseData: CaseData
  lawyers: Lawyer[]
}) {
  const router = useRouter()
  const [status, setStatus] = useState(caseData.status)
  const [assignedLawyer, setAssignedLawyer] = useState(caseData.assigned_lawyer_id || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleUpdate = async () => {
    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase
      .from('cases')
      .update({
        status,
        assigned_lawyer_id: assignedLawyer || null,
      })
      .eq('id', caseData.id)

    if (error) {
      toast.error('حدث خطأ أثناء التحديث')
    } else {
      toast.success('تم تحديث القضية بنجاح')
      router.refresh()
    }
    setIsSaving(false)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/cases">
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {caseData.case_number}
              </h1>
              <Badge variant="outline" className={statusVariants[caseData.status]}>
                {statusLabels[caseData.status]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {caseData.full_name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Info */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">البيانات الشخصية</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">الاسم</dt>
                <dd className="font-medium text-foreground">{caseData.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">الجنس</dt>
                <dd className="text-foreground">{genderLabels[caseData.gender]}</dd>
              </div>
              {caseData.age && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">العمر</dt>
                  <dd className="text-foreground">{caseData.age}</dd>
                </div>
              )}
              {caseData.id_number && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">رقم الهوية</dt>
                  <dd className="text-foreground" dir="ltr">{caseData.id_number}</dd>
                </div>
              )}
              {caseData.phone && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">الهاتف</dt>
                  <dd className="text-foreground" dir="ltr">{caseData.phone}</dd>
                </div>
              )}
              {caseData.address && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">العنوان</dt>
                  <dd className="text-foreground">{caseData.address}</dd>
                </div>
              )}
              {caseData.displacement_status && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">حالة النزوح</dt>
                  <dd className="text-foreground">
                    {displacementLabels[caseData.displacement_status]}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Case Details */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">تفاصيل القضية</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">نوع القضية</dt>
                <dd className="font-medium text-foreground">
                  {issueLabels[caseData.legal_issue_type]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">الأولوية</dt>
                <dd className="text-foreground">
                  {priorityLabels[caseData.priority]}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">تاريخ الإنشاء</dt>
                <dd className="text-foreground">
                  {new Date(caseData.created_at).toLocaleDateString('ar-SA')}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">أنشئ بواسطة</dt>
                <dd className="text-foreground">
                  {caseData.creator?.full_name || '-'}
                </dd>
              </div>
            </dl>
            {caseData.legal_issue_details && (
              <div className="mt-4 rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">التفاصيل</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {caseData.legal_issue_details}
                </p>
              </div>
            )}
            {caseData.notes && (
              <div className="mt-3 rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground mb-1">ملاحظات</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {caseData.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">إجراءات</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">حالة القضية</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">مفتوحة</SelectItem>
                  <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                  <SelectItem value="referred">محالة</SelectItem>
                  <SelectItem value="resolved">محلولة</SelectItem>
                  <SelectItem value="closed">مغلقة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm text-muted-foreground">المحامي المسؤول</label>
              <Select value={assignedLawyer} onValueChange={setAssignedLawyer}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر محامي" />
                </SelectTrigger>
                <SelectContent>
                  {lawyers.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                'حفظ التغييرات'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
