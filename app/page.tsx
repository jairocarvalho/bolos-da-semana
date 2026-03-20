'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-[#0098da]">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-[#0098da]">Bolos da Semana</h1>
        </div>
        <p className="text-gray-800">Redirecionando para o login...</p>
      </div>
    </div>
  )
}
