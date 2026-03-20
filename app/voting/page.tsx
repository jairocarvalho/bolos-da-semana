'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import GerenciarBolos from '@/components/GerenciarBolos'
import { Cake, CheckCircle, Vote, Settings, LogOut } from 'lucide-react'

interface Bolo {
  id: string
  titulo: string
  descricao: string
  count: number
}

interface ConfigData {
  votacaoAtiva: boolean
  limiteVotos: number
  bolos: Bolo[]
}

interface Voto {
  username: string
  boloId: string
  timestamp: string
}

export default function VotingPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [userVotes, setUserVotes] = useState<Voto[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      // Carregar configuração
      const configResponse = await fetch('/api/bolos')
      const configData = await configResponse.json()
      setConfig(configData)

      // Carregar votos do usuário
      if (user) {
        const votosResponse = await fetch(`/api/votos?username=${user.username}`)
        const votosData = await votosResponse.json()
        setUserVotes(votosData.votos || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleVote = async (boloId: string, boloTitulo: string) => {
    if (!user || !config) return

    setLoading(true)
    try {
      const response = await fetch('/api/bolos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'vote',
          bolo: { id: boloId },
          username: user.username
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        await carregarDados()
      } else {
        console.error(data.message || 'Erro ao registrar voto')
      }
    } catch (error) {
      console.error('Erro ao votar:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasVotedInBolo = (boloId: string) => {
    return userVotes.some(voto => voto.boloId === boloId)
  }

  const canVote = () => {
    return config?.votacaoAtiva && userVotes.length < (config?.limiteVotos || 2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-[#0098da] p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#0098da]">Bolos da Semana</h1>
              <p className="text-gray-600 mt-1">Bem-vindo(a), {user?.name}!</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="border-[#0098da] text-[#0098da] hover:bg-[#0098da]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <Tabs defaultValue="votacao" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="votacao" className="flex items-center gap-2 text-base font-semibold text-[#2d2c46] data-[state=active]:text-[#0098da]">
              <Vote className="w-4 h-4" />
              Votação
            </TabsTrigger>
            {user?.isGerencial && (
              <TabsTrigger value="configurar" className="flex items-center gap-2 text-base font-semibold text-[#2d2c46] data-[state=active]:text-[#0098da]">
                <Settings className="w-4 h-4" />
                Administrar
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="votacao" className="mt-6">
            {!config?.votacaoAtiva ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Vote className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-600 mb-4">Votação Desativada</h2>
                  <p className="text-gray-500">A votação não está ativa no momento.</p>
                  <p className="text-gray-400 text-sm mt-2">Aguarde o administrador ativar a votação.</p>
                </CardContent>
              </Card>
            ) : (
              <>

                {config.bolos.length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Cake className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 text-lg">Nenhum bolo disponível para votação no momento.</p>
                      <p className="text-gray-400 text-sm mt-2">Peça a um administrador para adicionar bolos ao sistema.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    {config.bolos.map((bolo) => {
                      const voted = hasVotedInBolo(bolo.id)
                      const disabled = !canVote() || voted || loading
                      
                      return (
                        <Card key={bolo.id} className={`transition-shadow h-[50px] ${
                          voted ? 'border-green-300 bg-green-50' : ''
                        }`}>
                          <CardContent className="p-2 h-full">
                            <div className="flex items-center justify-between h-full">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#0098da] rounded-full flex items-center justify-center flex-shrink-0">
                                  <Cake className="w-4 h-4 text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="font-semibold text-sm truncate">{bolo.titulo}</h3>
                                  {voted && (
                                    <span className="flex items-center gap-1 text-green-600 text-xs">
                                      <CheckCircle className="w-3 h-3" />
                                      Votado
                                    </span>
                                  )}
                                </div>
                              </div>
                              <Button 
                                className={voted ? 'bg-green-600 hover:bg-green-700' : 'bg-[#0098da] hover:bg-[#0078b8]'}
                                onClick={() => handleVote(bolo.id, bolo.titulo)}
                                disabled={disabled}
                                size="sm"
                              >
                                {voted ? 'Votado' : loading ? 'Votando...' : 'Votar'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {user?.isGerencial && (
            <TabsContent value="configurar" className="mt-6">
              <GerenciarBolos />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}
