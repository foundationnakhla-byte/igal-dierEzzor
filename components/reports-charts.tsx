'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

interface CaseRow {
  id: string
  legal_issue_type: string
  status: string
  priority: string
  gender: string
  displacement_status: string | null
  created_at: string
}

interface ConsultationRow {
  id: string
  consultation_type: string
  consultation_date: string
}

interface ReferralRow {
  id: string
  referral_type: string
  status: string
  referral_date: string
}

const issueLabels: Record<string, string> = {
  property: 'ملكية عقارية',
  civil_documentation: 'وثائق مدنية',
  family: 'أحوال شخصية',
  criminal: 'جزائية',
  labor: 'عمل',
  administrative: 'إداري',
  other: 'أخرى',
}

const statusLabels: Record<string, string> = {
  open: 'مفتوحة',
  in_progress: 'قيد المعالجة',
  referred: 'محالة',
  resolved: 'محلولة',
  closed: 'مغلقة',
}

const COLORS = [
  'hsl(215, 65%, 40%)',
  'hsl(170, 50%, 40%)',
  'hsl(35, 85%, 55%)',
  'hsl(0, 72%, 51%)',
  'hsl(260, 50%, 55%)',
  'hsl(215, 35%, 60%)',
  'hsl(170, 40%, 55%)',
]

function countBy<T>(arr: T[], key: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of arr) {
    const k = key(item)
    result[k] = (result[k] || 0) + 1
  }
  return result
}

export function ReportsCharts({
  cases,
  consultations,
  referrals,
}: {
  cases: CaseRow[]
  consultations: ConsultationRow[]
  referrals: ReferralRow[]
}) {
  // Cases by issue type
  const issueData = Object.entries(countBy(cases, (c) => c.legal_issue_type)).map(
    ([key, value]) => ({
      name: issueLabels[key] || key,
      value,
    })
  )

  // Cases by status
  const statusData = Object.entries(countBy(cases, (c) => c.status)).map(
    ([key, value]) => ({
      name: statusLabels[key] || key,
      value,
    })
  )

  // Cases by gender
  const genderData = Object.entries(countBy(cases, (c) => c.gender)).map(
    ([key, value]) => ({
      name: key === 'male' ? 'ذكر' : 'أنثى',
      value,
    })
  )

  // Monthly case trends
  const monthlyData: Record<string, number> = {}
  for (const c of cases) {
    const month = new Date(c.created_at).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
    })
    monthlyData[month] = (monthlyData[month] || 0) + 1
  }
  const monthlyChartData = Object.entries(monthlyData).map(([name, value]) => ({
    name,
    count: value,
  }))

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Summary Cards */}
      <Card className="lg:col-span-2">
        <CardContent className="grid gap-4 p-6 sm:grid-cols-4">
          <div className="rounded-lg bg-primary/10 p-4 text-center">
            <p className="text-3xl font-bold text-primary">{cases.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي القضايا</p>
          </div>
          <div className="rounded-lg bg-accent/10 p-4 text-center">
            <p className="text-3xl font-bold text-accent">{consultations.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي الاستشارات</p>
          </div>
          <div className="rounded-lg bg-warning/10 p-4 text-center">
            <p className="text-3xl font-bold text-warning">{referrals.length}</p>
            <p className="text-sm text-muted-foreground">إجمالي الإحالات</p>
          </div>
          <div className="rounded-lg bg-success/10 p-4 text-center">
            <p className="text-3xl font-bold text-success">
              {cases.filter((c) => c.status === 'resolved').length}
            </p>
            <p className="text-sm text-muted-foreground">قضايا محلولة</p>
          </div>
        </CardContent>
      </Card>

      {/* Cases by Issue Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">القضايا حسب النوع</CardTitle>
        </CardHeader>
        <CardContent>
          {issueData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={issueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  {issueData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Cases by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">القضايا حسب الحالة</CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(215, 65%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Gender Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">التوزيع حسب الجنس</CardTitle>
        </CardHeader>
        <CardContent>
          {genderData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  <Cell fill="hsl(215, 65%, 40%)" />
                  <Cell fill="hsl(170, 50%, 40%)" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">القضايا الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyChartData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="القضايا" fill="hsl(170, 50%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
