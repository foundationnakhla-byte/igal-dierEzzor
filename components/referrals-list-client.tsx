'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, ArrowLeftRight } from 'lucide-react'
import Link from 'next/link'

interface ReferralRow {
  id: string
  referred_to: string
  referral_type: string
  referral_reason: string
  referral_date: string
  status: string
  follow_up_date: string | null
  follow_up_notes: string | null
  outcome: string | null
  case_id: string
  cases: { case_number: string; full_name: string } | null
  creator: { full_name: string } | null
}

const typeLabels: Record<string, string> = {
  legal_aid: 'مساعدة قانونية',
  government: 'جهة حكومية',
  ngo: 'منظمة غير حكومية',
  court: 'محكمة',
  other: 'أخرى',
}

const statusLabels: Record<string, string> = {
  pending: 'معلقة',
  accepted: 'مقبولة',
  in_progress: 'قيد التنفيذ',
  completed: 'مكتملة',
  rejected: 'مرفوضة',
}

const statusVariants: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  accepted: 'bg-primary/10 text-primary border-primary/20',
  in_progress: 'bg-accent/10 text-accent border-accent/20',
  completed: 'bg-success/10 text-success border-success/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function ReferralsListClient({ referrals }: { referrals: ReferralRow[] }) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = referrals.filter((r) => {
    const matchesSearch =
      !search ||
      r.referred_to.includes(search) ||
      r.cases?.case_number.toLowerCase().includes(search.toLowerCase()) ||
      r.cases?.full_name.includes(search)
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (referralId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('referrals')
      .update({ status: newStatus })
      .eq('id', referralId)

    if (error) {
      toast.error('حدث خطأ أثناء التحديث')
    } else {
      toast.success('تم تحديث الحالة')
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالجهة أو اسم المستفيد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">معلقة</SelectItem>
              <SelectItem value="accepted">مقبولة</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتملة</SelectItem>
              <SelectItem value="rejected">مرفوضة</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowLeftRight className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">لا توجد إحالات مطابقة</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm text-foreground">{r.referred_to}</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {typeLabels[r.referral_type]}
                    </span>
                    <Link
                      href={`/dashboard/cases/${r.case_id}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {r.cases?.case_number || '-'}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusVariants[r.status]}>
                      {statusLabels[r.status]}
                    </Badge>
                    <Select
                      value={r.status}
                      onValueChange={(val) => handleStatusUpdate(r.id, val)}
                    >
                      <SelectTrigger className="h-7 w-28 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">معلقة</SelectItem>
                        <SelectItem value="accepted">مقبولة</SelectItem>
                        <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                        <SelectItem value="completed">مكتملة</SelectItem>
                        <SelectItem value="rejected">مرفوضة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-foreground">{r.referral_reason}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>{'المستفيد: ' + (r.cases?.full_name || '-')}</span>
                  <span>
                    {'التاريخ: ' + new Date(r.referral_date).toLocaleDateString('ar-SA')}
                  </span>
                  {r.follow_up_date && (
                    <span className="text-warning font-medium">
                      {'المتابعة: ' + new Date(r.follow_up_date).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {'عرض ' + filtered.length + ' من أصل ' + referrals.length + ' إحالة'}
      </p>
    </div>
  )
}
