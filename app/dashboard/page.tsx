'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Dashboard from '@/components/dashboard'

export default function DashboardPage() {
  const router = useRouter()

  // Temporarily bypass authentication to show dashboard
  return <Dashboard />
}
