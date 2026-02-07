'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, ArrowLeftRight, Loader2 } from 'lucide-react'

interface Referral {
  id: string
  referred_to: string
  referral_type: string
  referral_reason: string
  referral_date: string
  status: string
  follow_up_date: string | null
  follow_up_notes: string | null
  outcome: string | null
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

export function CaseReferrals({
  caseId,
  referrals,
}: {
  caseId: string
  referrals: Referral[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const form = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error('يرجى تسجيل الدخول')
      setIsSubmitting(false)
      return
    }

    const { error } = await supabase.from('referrals').insert({
      case_id: caseId,
      referred_to: form.get('referred_to') as string,
      referral_type: form.get('referral_type') as string,
      referral_reason: form.get('referral_reason') as string,
      follow_up_date: (form.get('follow_up_date') as string) || null,
      created_by: user.id,
    })

    if (error) {
      toast.error('حدث خطأ أثناء إضافة الإحالة')
    } else {
      toast.success('تم إضافة الإحالة بنجاح')
      setOpen(false)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  const handleStatusUpdate = async (referralId: string, newStatus: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('referrals')
      .update({ status: newStatus })
      .eq('id', referralId)

    if (error) {
      toast.error('حدث خطأ')
    } else {
      toast.success('تم تحديث الحالة')
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">
            {'الإحالات (' + referrals.length + ')'}
          </CardTitle>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              إضافة إحالة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة إحالة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="referred_to">
                  جهة الإحالة <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="referred_to"
                  name="referred_to"
                  required
                  placeholder="اسم الجهة المحال إليها"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referral_type">
                  نوع الإحالة <span className="text-destructive">*</span>
                </Label>
                <Select name="referral_type" required>
                  <SelectTrigger id="referral_type">
                    <SelectValue placeholder="اختر النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal_aid">مساعدة قانونية</SelectItem>
                    <SelectItem value="government">جهة حكومية</SelectItem>
                    <SelectItem value="ngo">منظمة غير حكومية</SelectItem>
                    <SelectItem value="court">محكمة</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referral_reason">
                  سبب الإحالة <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="referral_reason"
                  name="referral_reason"
                  required
                  rows={3}
                  placeholder="سبب الإحالة..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="follow_up_date">تاريخ المتابعة</Label>
                <Input
                  id="follow_up_date"
                  name="follow_up_date"
                  type="date"
                  dir="ltr"
                  className="text-left"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    'حفظ'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            لا توجد إحالات مسجلة بعد
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {referrals.map((r) => (
              <div key={r.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm text-foreground">{r.referred_to}</span>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {typeLabels[r.referral_type]}
                    </span>
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
                  <span>
                    {'التاريخ: ' + new Date(r.referral_date).toLocaleDateString('ar-SA')}
                  </span>
                  {r.follow_up_date && (
                    <span>
                      {'المتابعة: ' + new Date(r.follow_up_date).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
