import { Card, CardContent } from '@/components/ui/card'
import {
  FolderOpen,
  FolderClock,
  CheckCircle2,
  MessageSquare,
  ArrowLeftRight,
} from 'lucide-react'

interface DashboardStatsProps {
  totalCases: number
  openCases: number
  resolvedCases: number
  totalConsultations: number
  pendingReferrals: number
}

const stats = [
  {
    key: 'totalCases',
    label: 'إجمالي القضايا',
    icon: FolderOpen,
    color: 'bg-primary/10 text-primary',
  },
  {
    key: 'openCases',
    label: 'قضايا مفتوحة',
    icon: FolderClock,
    color: 'bg-warning/10 text-warning',
  },
  {
    key: 'resolvedCases',
    label: 'قضايا محلولة',
    icon: CheckCircle2,
    color: 'bg-success/10 text-success',
  },
  {
    key: 'totalConsultations',
    label: 'الاستشارات',
    icon: MessageSquare,
    color: 'bg-accent/10 text-accent',
  },
  {
    key: 'pendingReferrals',
    label: 'إحالات معلقة',
    icon: ArrowLeftRight,
    color: 'bg-destructive/10 text-destructive',
  },
] as const

export function DashboardStats(props: DashboardStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.key}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">
                {props[stat.key]}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
