'use client'

import Link from 'next/link'
import { useState } from 'react'
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
import { Search, FolderOpen } from 'lucide-react'

interface CaseRow {
  id: string
  case_number: string
  full_name: string
  gender: string
  age: number | null
  phone: string | null
  displacement_status: string | null
  legal_issue_type: string
  status: string
  priority: string
  assigned_lawyer_id: string | null
  created_at: string
  profiles: { full_name: string } | null
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

export function CasesTable({ cases }: { cases: CaseRow[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [issueFilter, setIssueFilter] = useState<string>('all')

  const filtered = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.full_name.includes(search) ||
      c.case_number.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    const matchesIssue = issueFilter === 'all' || c.legal_issue_type === issueFilter

    return matchesSearch && matchesStatus && matchesIssue
  })

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="بحث بالاسم أو رقم القضية..."
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
              <SelectItem value="open">مفتوحة</SelectItem>
              <SelectItem value="in_progress">قيد المعالجة</SelectItem>
              <SelectItem value="referred">محالة</SelectItem>
              <SelectItem value="resolved">محلولة</SelectItem>
              <SelectItem value="closed">مغلقة</SelectItem>
            </SelectContent>
          </Select>
          <Select value={issueFilter} onValueChange={setIssueFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="نوع القضية" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="property">ملكية عقارية</SelectItem>
              <SelectItem value="civil_documentation">وثائق مدنية</SelectItem>
              <SelectItem value="family">أحوال شخصية</SelectItem>
              <SelectItem value="criminal">قضايا جزائية</SelectItem>
              <SelectItem value="labor">عمل</SelectItem>
              <SelectItem value="administrative">إداري</SelectItem>
              <SelectItem value="other">أخرى</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">لا توجد قضايا مطابقة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50 text-sm text-muted-foreground">
                    <th className="px-4 py-3 text-right font-medium">رقم القضية</th>
                    <th className="px-4 py-3 text-right font-medium">الاسم</th>
                    <th className="px-4 py-3 text-right font-medium">نوع القضية</th>
                    <th className="px-4 py-3 text-right font-medium">الحالة</th>
                    <th className="px-4 py-3 text-right font-medium">الأولوية</th>
                    <th className="px-4 py-3 text-right font-medium">المحامي</th>
                    <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/cases/${c.id}`}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {c.case_number}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">{c.full_name}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {issueLabels[c.legal_issue_type] || c.legal_issue_type}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={statusVariants[c.status]}>
                          {statusLabels[c.status] || c.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={priorityVariants[c.priority]}>
                          {priorityLabels[c.priority] || c.priority}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {c.profiles?.full_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString('ar-SA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {'عرض ' + filtered.length + ' من أصل ' + cases.length + ' قضية'}
      </p>
    </div>
  )
}
