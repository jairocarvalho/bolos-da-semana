'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const router = useRouter()
  const { login } = useAuth()

  const validateFields = (): boolean => {
    if (!username.trim()) {
      setError('Por favor, digite seu nome de usuário')
      return false
    }
    if (!password.trim()) {
      setError('Por favor, digite sua senha')
      return false
    }
    return true
  }

  const authenticateUser = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        login(data.user)
        setSuccess(`Bem-vindo(a), ${data.user.name}!`)
        return true
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Usuário ou senha incorretos')
        return false
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateFields()) {
      return
    }

    setIsLoading(true)

    const isAuthenticated = await authenticateUser(username, password)
    
    setIsLoading(false)

    if (isAuthenticated) {
      setIsRedirecting(true)
      setTimeout(() => {
        router.push('/voting')
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-[#0098da] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#0098da]">
            Bolos da Semana
          </CardTitle>
          <CardDescription>
            Faça login para votar no seu bolo favorito!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isRedirecting ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Usuário</Label>
                  <Input
                    id="username"
                    placeholder="Digite seu usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertDescription className="text-green-800">
                      {success}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit"
                  className="w-full bg-[#0098da] hover:bg-[#0078b8] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-gray-600">
                <p>Use suas credenciais para acessar o sistema de votação</p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 text-[#0098da] animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold text-[#0098da]">Login realizado com sucesso!</h3>
                  <p className="text-gray-600 text-sm mt-1">Redirecionando para a votação...</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
