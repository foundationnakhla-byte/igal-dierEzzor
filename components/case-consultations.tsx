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
import { Plus, MessageSquare, Loader2 } from 'lucide-react'

interface Consultation {
  id: string
  consultation_date: string
  consultation_type: string
  summary: string
  advice_given: string | null
  next_steps: string | null
  documents_reviewed: string | null
  lawyer: { full_name: string } | null
  creator: { full_name: string } | null
}

interface Lawyer {
  id: string
  full_name: string
}

const typeLabels: Record<string, string> = {
  in_person: 'شخصي',
  phone: 'هاتفي',
  online: 'عبر الإنترنت',
  field_visit: 'زيارة ميدانية',
}

export function CaseConsultations({
  caseId,
  consultations,
  lawyers,
}: {
  caseId: string
  consultations: Consultation[]
  lawyers: Lawyer[]
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

    const { error } = await supabase.from('consultations').insert({
      case_id: caseId,
      consultation_date: (form.get('date') as string) || new Date().toISOString(),
      consultation_type: form.get('type') as string,
      lawyer_id: form.get('lawyer_id') as string,
      summary: form.get('summary') as string,
      advice_given: (form.get('advice_given') as string) || null,
      next_steps: (form.get('next_steps') as string) || null,
      documents_reviewed: (form.get('documents_reviewed') as string) || null,
      created_by: user.id,
    })

    if (error) {
      toast.error('حدث خطأ أثناء إضافة الاستشارة')
    } else {
      toast.success('تم إضافة الاستشارة بنجاح')
      setOpen(false)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <CardTitle className="text-base">
            {'الاستشارات (' + consultations.length + ')'}
          </CardTitle>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              إضافة استشارة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>إضافة استشارة جديدة</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    name="date"
                    type="datetime-local"
                    defaultValue={new Date().toISOString().slice(0, 16)}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">
                    نوع الاستشارة <span className="text-destructive">*</span>
                  </Label>
                  <Select name="type" required>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="اختر النوع" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in_person">شخصي</SelectItem>
                      <SelectItem value="phone">هاتفي</SelectItem>
                      <SelectItem value="online">عبر الإنترنت</SelectItem>
                      <SelectItem value="field_visit">زيارة ميدانية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lawyer_id">
                  المحامي <span className="text-destructive">*</span>
                </Label>
                <Select name="lawyer_id" required>
                  <SelectTrigger id="lawyer_id">
                    <SelectValue placeholder="اختر المحامي" />
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
              <div className="grid gap-2">
                <Label htmlFor="summary">
                  الملخص <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="summary"
                  name="summary"
                  required
                  rows={3}
                  placeholder="ملخص الاستشارة..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="advice_given">النصيحة القانونية</Label>
                <Textarea
                  id="advice_given"
                  name="advice_given"
                  rows={2}
                  placeholder="النصيحة المقدمة..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="next_steps">الخطوات التالية</Label>
                <Textarea
                  id="next_steps"
                  name="next_steps"
                  rows={2}
                  placeholder="الخطوات المطلوبة..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="documents_reviewed">الوثائق المراجعة</Label>
                <Input
                  id="documents_reviewed"
                  name="documents_reviewed"
                  placeholder="أسماء الوثائق..."
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
        {consultations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            لا توجد استشارات مسجلة بعد
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {consultations.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border p-4"
              >
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {typeLabels[c.consultation_type]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(c.consultation_date).toLocaleDateString('ar-SA')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {'المحامي: ' + (c.lawyer?.full_name || '-')}
                  </span>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{c.summary}</p>
                {c.advice_given && (
                  <div className="mt-2 rounded bg-muted p-2.5">
                    <p className="text-xs text-muted-foreground mb-0.5">النصيحة القانونية</p>
                    <p className="text-sm text-foreground">{c.advice_given}</p>
                  </div>
                )}
                {c.next_steps && (
                  <div className="mt-2 rounded bg-muted p-2.5">
                    <p className="text-xs text-muted-foreground mb-0.5">الخطوات التالية</p>
                    <p className="text-sm text-foreground">{c.next_steps}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
