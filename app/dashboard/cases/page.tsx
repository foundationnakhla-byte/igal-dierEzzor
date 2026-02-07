import { createClient } from '@/lib/supabase/server'
import { CasesTable } from '@/components/cases-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FolderPlus } from 'lucide-react'

export default async function CasesPage() {
  const supabase = await createClient()

  const { data: cases } = await supabase
    .from('cases')
    .select(`
      id,
      case_number,
      full_name,
      gender,
      age,
      phone,
      displacement_status,
      legal_issue_type,
      status,
      priority,
      assigned_lawyer_id,
      created_at,
      profiles:assigned_lawyer_id (full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">القضايا</h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة جميع القضايا المسجلة في النظام
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cases/new">
            <FolderPlus className="h-4 w-4" />
            قضية جديدة
          </Link>
        </Button>
      </div>

      <CasesTable cases={cases ?? []} />
    </div>
  )
}
