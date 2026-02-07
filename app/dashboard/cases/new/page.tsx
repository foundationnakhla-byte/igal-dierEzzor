'use client'

import React from "react"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function NewCasePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('يرجى تسجيل الدخول أولاً')
      setIsSubmitting(false)
      return
    }

    const caseData = {
      full_name: formData.get('full_name') as string,
      gender: formData.get('gender') as string,
      age: formData.get('age') ? Number(formData.get('age')) : null,
      id_number: (formData.get('id_number') as string) || null,
      phone: (formData.get('phone') as string) || null,
      address: (formData.get('address') as string) || null,
      displacement_status: (formData.get('displacement_status') as string) || null,
      legal_issue_type: formData.get('legal_issue_type') as string,
      legal_issue_details: (formData.get('legal_issue_details') as string) || null,
      priority: formData.get('priority') as string,
      notes: (formData.get('notes') as string) || null,
      created_by: user.id,
    }

    const { error } = await supabase.from('cases').insert(caseData)

    if (error) {
      toast.error('حدث خطأ أثناء إنشاء القضية')
      console.error(error)
      setIsSubmitting(false)
      return
    }

    toast.success('تم إنشاء القضية بنجاح')
    router.push('/dashboard/cases')
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">قضية جديدة</h1>
        <p className="text-sm text-muted-foreground mt-1">
          أدخل بيانات المستفيد والقضية القانونية
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>البيانات الشخصية</CardTitle>
            <CardDescription>معلومات المستفيد الأساسية</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="full_name">
                الاسم الكامل <span className="text-destructive">*</span>
              </Label>
              <Input id="full_name" name="full_name" required placeholder="الاسم الثلاثي" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">
                الجنس <span className="text-destructive">*</span>
              </Label>
              <Select name="gender" required>
                <SelectTrigger id="gender">
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="age">العمر</Label>
              <Input
                id="age"
                name="age"
                type="number"
                min={0}
                max={150}
                placeholder="العمر بالسنوات"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="id_number">رقم الهوية</Label>
              <Input id="id_number" name="id_number" placeholder="رقم الهوية الوطنية" dir="ltr" className="text-left" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input id="phone" name="phone" type="tel" placeholder="09xxxxxxxx" dir="ltr" className="text-left" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="address">العنوان</Label>
              <Input id="address" name="address" placeholder="المنطقة - الحي - التفاصيل" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="displacement_status">حالة النزوح</Label>
              <Select name="displacement_status">
                <SelectTrigger id="displacement_status">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="displaced">نازح</SelectItem>
                  <SelectItem value="returnee">عائد</SelectItem>
                  <SelectItem value="host_community">مجتمع مضيف</SelectItem>
                  <SelectItem value="refugee">لاجئ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Legal Issue */}
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل القضية</CardTitle>
            <CardDescription>معلومات المشكلة القانونية</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="legal_issue_type">
                نوع القضية <span className="text-destructive">*</span>
              </Label>
              <Select name="legal_issue_type" required>
                <SelectTrigger id="legal_issue_type">
                  <SelectValue placeholder="اختر نوع القضية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="property">ملكية عقارية</SelectItem>
                  <SelectItem value="civil_documentation">وثائق مدنية</SelectItem>
                  <SelectItem value="family">أحوال شخصية</SelectItem>
                  <SelectItem value="criminal">قضايا جزائية</SelectItem>
                  <SelectItem value="labor">عمل</SelectItem>
                  <SelectItem value="administrative">إداري</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="priority">
                الأولوية <span className="text-destructive">*</span>
              </Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger id="priority">
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                  <SelectItem value="urgent">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="legal_issue_details">تفاصيل القضية</Label>
              <Textarea
                id="legal_issue_details"
                name="legal_issue_details"
                rows={4}
                placeholder="وصف تفصيلي للمشكلة القانونية..."
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="أي ملاحظات أخرى..."
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ القضية'
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  )
}
