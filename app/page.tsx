'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-200">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <img src="/logo-selsyn.svg" alt="Selsyn Tecnologia" className="h-12 w-auto" />
          <h1 className="text-2xl font-bold text-purple-800">Bolos da Semana</h1>
        </div>
        <p className="text-gray-600">Redirecionando para o login...</p>
      </div>
    </div>
  )
}
