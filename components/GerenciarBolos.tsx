'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ConfiguracoesVotacao from './ConfiguracoesVotacao'
import { Cake, Plus, Trash2, Settings, Vote } from 'lucide-react'

interface Bolo {
  id: string
  titulo: string
  descricao: string
  count: number
}

export default function GerenciarBolos() {
  const [bolos, setBolos] = useState<Bolo[]>([])
  const [novoBolo, setNovoBolo] = useState({
    titulo: '',
    descricao: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    carregarBolos()
  }, [])

  const carregarBolos = async () => {
    try {
      const response = await fetch('/api/bolos')
      const data = await response.json()
      setBolos(data.bolos || [])
    } catch (error) {
      console.error('Erro ao carregar bolos:', error)
      setMessage('Erro ao carregar bolos')
    }
  }

  const adicionarBolo = async () => {
    if (!novoBolo.titulo.trim()) {
      setMessage('Por favor, digite o título do bolo')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bolos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add',
          bolo: novoBolo
        }),
      })

      if (response.ok) {
        await carregarBolos()
        setNovoBolo({ titulo: '', descricao: '' })
        setMessage('Bolo adicionado com sucesso!')
      } else {
        setMessage('Erro ao adicionar bolo')
      }
    } catch (error) {
      console.error('Erro ao adicionar bolo:', error)
      setMessage('Erro ao adicionar bolo')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  const removerBolo = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este bolo?')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bolos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'remove',
          bolo: { id }
        }),
      })

      if (response.ok) {
        await carregarBolos()
        setMessage('Bolo removido com sucesso!')
      } else {
        setMessage('Erro ao remover bolo')
      }
    } catch (error) {
      console.error('Erro ao remover bolo:', error)
      setMessage('Erro ao remover bolo')
    } finally {
      setLoading(false)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="bolos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bolos" className="flex items-center gap-2">
            <Cake className="w-4 h-4" />
            Bolos
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="bolos" className="mt-6">
          {message && (
            <Alert className={message.includes('sucesso') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertDescription className={message.includes('sucesso') ? 'text-green-800' : 'text-red-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Adicionar Novo Bolo
              </CardTitle>
              <CardDescription>Adicione um novo bolo à votação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    placeholder="Nome do bolo"
                    value={novoBolo.titulo}
                    onChange={(e) => setNovoBolo({ ...novoBolo, titulo: e.target.value })}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    placeholder="Descrição do bolo"
                    value={novoBolo.descricao}
                    onChange={(e) => setNovoBolo({ ...novoBolo, descricao: e.target.value })}
                    disabled={loading}
                  />
                </div>
              </div>
              <Button 
                onClick={adicionarBolo} 
                disabled={loading}
                className="bg-[#0098da] hover:bg-[#0078b8]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {loading ? 'Adicionando...' : 'Adicionar Bolo'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cake className="w-5 h-5" />
                Bolos Atuais
              </CardTitle>
              <CardDescription>Gerencie os bolos disponíveis para votação</CardDescription>
            </CardHeader>
            <CardContent>
              {bolos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum bolo cadastrado ainda</p>
              ) : (
                <div className="space-y-3">
                  {bolos.map((bolo) => (
                    <div key={bolo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{bolo.titulo}</h3>
                        <p className="text-gray-600 text-sm">{bolo.descricao}</p>
                        <div className="flex items-center gap-1 text-[#0098da] text-sm mt-1">
                          <Vote className="w-3 h-3" />
                          {bolo.count} votos
                        </div>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => removerBolo(bolo.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="mt-6">
          <ConfiguracoesVotacao />
        </TabsContent>
      </Tabs>
    </div>
  )
}
