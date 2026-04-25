import { NextRequest, NextResponse } from 'next/server'
import { DEPARTMENT_KPI_CONFIGS, getDepartmentKPIConfig } from '@/shared/constants/departmentKPIs'
import { withAuth } from '@/server/auth/withAuth'

// GET: Fetch KPI config for a department or all departments
export const GET = withAuth(async (req, { user, params }) => {
  try {
const { searchParams } = new URL(req.url)
    const department = searchParams.get('department')

    if (department) {
      const config = getDepartmentKPIConfig(department)
      if (!config) {
        return NextResponse.json({ error: 'Department not found' }, { status: 404 })
      }
      return NextResponse.json({ config })
    }

    // Return all configs
    return NextResponse.json({ configs: DEPARTMENT_KPI_CONFIGS })
  } catch (error) {
    console.error('Error fetching KPI configs:', error)
    return NextResponse.json({ error: 'Failed to fetch KPI configs' }, { status: 500 })
  }
})
