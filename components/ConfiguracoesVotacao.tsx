'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Power, BarChart3, Users, Cake, Wrench } from 'lucide-react'

interface ConfigData {
  votacaoAtiva: boolean
  limiteVotos: number
  bolos: any[]
}

export default function ConfiguracoesVotacao() {
  const [config, setConfig] = useState<ConfigData | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    carregarConfig()
  }, [])

  const carregarConfig = async () => {
    try {
      const response = await fetch('/api/bolos')
      const data = await response.json()
      setConfig(data)
    } catch (error) {
      console.error('Erro ao carregar configuração:', error)
      setMessage('Erro ao carregar configuração')
    }
  }

  const toggleVotacao = async () => {
    if (!config) return

    setLoading(true)
    try {
      const response = await fetch('/api/bolos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggleVotacao'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        setMessage(`Votação ${data.config.votacaoAtiva ? 'ativada' : 'desativada'} com sucesso!`)
      } else {
        setMessage('Erro ao alterar status da votação')
      }
    } catch (error) {
      console.error('Erro ao alterar votação:', error)
      setMessage('Erro ao alterar status da votação')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const updateLimiteVotos = async (novoLimite: number) => {
    if (!config) return

    setLoading(true)
    try {
      const response = await fetch('/api/bolos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateLimiteVotos',
          limiteVotos: novoLimite
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setConfig(data.config)
        setMessage(`Limite de votos atualizado para ${novoLimite}!`)
      } else {
        setMessage('Erro ao atualizar limite de votos')
      }
    } catch (error) {
      console.error('Erro ao atualizar limite:', error)
      setMessage('Erro ao atualizar limite de votos')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  if (!config) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-6">
      {message && (
        <Alert className={message.includes('sucesso') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <AlertDescription className={message.includes('sucesso') ? 'text-green-800' : 'text-red-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Settings className="w-6 h-6" />
            Configurações da Votação
          </CardTitle>
          <CardDescription>
            Gerencie as configurações da votação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Power className="w-5 h-5" />
                Status da Votação
              </h3>
              <p className="text-gray-600">
                {config.votacaoAtiva 
                  ? 'A votação está ativa e os usuários podem votar' 
                  : 'A votação está desativada e os usuários não podem votar'
                }
              </p>
            </div>
            <Button 
              onClick={toggleVotacao}
              disabled={loading}
              variant={config.votacaoAtiva ? "destructive" : "default"}
              className={config.votacaoAtiva ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              <Power className="w-4 h-4 mr-2" />
              {loading ? 'Processando...' : config.votacaoAtiva ? 'Desativar Votação' : 'Ativar Votação'}
            </Button>
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Limite de Votos por Usuário</h3>
                <p className="text-gray-600">
                  Cada usuário pode votar em até {config.limiteVotos} bolo(s)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Label htmlFor="limiteVotos">Limite:</Label>
              <select
                id="limiteVotos"
                value={config.limiteVotos}
                onChange={(e) => updateLimiteVotos(parseInt(e.target.value))}
                disabled={loading}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={1}>1 voto</option>
                <option value={2}>2 votos</option>
              </select>
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Resumo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Power className="w-4 h-4" />
                <span className="font-medium">Status: </span>
                <span className={config.votacaoAtiva ? 'text-green-600' : 'text-red-600'}>
                  {config.votacaoAtiva ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="font-medium">Limite: </span>
                <span className="text-[#0098da]">{config.limiteVotos} voto(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <Cake className="w-4 h-4" />
                <span className="font-medium">Bolos: </span>
                <span className="text-[#0098da]">{config.bolos.length} cadastrado(s)</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
