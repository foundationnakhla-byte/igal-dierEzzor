'use client'

import React from "react"

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Scale, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(
        error instanceof Error
          ? error.message === 'Invalid login credentials'
            ? 'بيانات الدخول غير صحيحة'
            : error.message
          : 'حدث خطأ أثناء تسجيل الدخول'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
              <Scale className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              العيادة القانونية
            </h1>
            <p className="text-sm text-muted-foreground">
              نظام إدارة القضايا - دير الزور
            </p>
          </div>
          <Card className="w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">تسجيل الدخول</CardTitle>
              <CardDescription>
                أدخل بيانات حسابك للوصول إلى النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-5">
                  <div className="grid gap-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="example@clinic.org"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="text-left"
                      dir="ltr"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الدخول...
                      </>
                    ) : (
                      'دخول'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          <p className="text-xs text-muted-foreground text-center">
            {'العيادة القانونية - جميع الحقوق محفوظة 2025'}
          </p>
        </div>
      </div>
    </div>
  )
}
