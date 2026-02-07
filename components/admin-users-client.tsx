'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Users } from 'lucide-react'

interface Profile {
  id: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

const roleLabels: Record<string, string> = {
  admin: 'مدير النظام',
  manager: 'مدير',
  lawyer: 'محامي',
  data_entry: 'مدخل بيانات',
}

const roleVariants: Record<string, string> = {
  admin: 'bg-destructive/10 text-destructive border-destructive/20',
  manager: 'bg-primary/10 text-primary border-primary/20',
  lawyer: 'bg-accent/10 text-accent border-accent/20',
  data_entry: 'bg-muted text-muted-foreground border-border',
}

export function AdminUsersClient({
  profiles,
  isAdmin,
}: {
  profiles: Profile[]
  isAdmin: boolean
}) {
  const router = useRouter()

  const handleRoleChange = async (profileId: string, newRole: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)

    if (error) {
      toast.error('حدث خطأ أثناء تحديث الصلاحية')
    } else {
      toast.success('تم تحديث الصلاحية بنجاح')
      router.refresh()
    }
  }

  const handleToggleActive = async (profileId: string, isActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', profileId)

    if (error) {
      toast.error('حدث خطأ')
    } else {
      toast.success(isActive ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب')
      router.refresh()
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">لا يوجد مستخدمين</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                  <th className="px-4 py-3 text-right font-medium">الاسم</th>
                  <th className="px-4 py-3 text-right font-medium">الصلاحية</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">تاريخ الإنشاء</th>
                  {isAdmin && (
                    <>
                      <th className="px-4 py-3 text-right font-medium">تغيير الصلاحية</th>
                      <th className="px-4 py-3 text-right font-medium">تفعيل/تعطيل</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {profiles.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {p.full_name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={roleVariants[p.role]}>
                        {roleLabels[p.role] || p.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          p.is_active
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }
                      >
                        {p.is_active ? 'نشط' : 'معطل'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    {isAdmin && (
                      <>
                        <td className="px-4 py-3">
                          <Select
                            value={p.role}
                            onValueChange={(val) => handleRoleChange(p.id, val)}
                          >
                            <SelectTrigger className="h-8 w-32 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">مدير النظام</SelectItem>
                              <SelectItem value="manager">مدير</SelectItem>
                              <SelectItem value="lawyer">محامي</SelectItem>
                              <SelectItem value="data_entry">مدخل بيانات</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3">
                          <Switch
                            checked={p.is_active}
                            onCheckedChange={(checked) =>
                              handleToggleActive(p.id, checked)
                            }
                          />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
