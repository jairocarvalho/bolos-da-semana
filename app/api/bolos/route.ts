import { NextRequest, NextResponse } from 'next/server'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

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

interface VotosData {
  votos: Voto[]
}

export async function GET() {
  try {
    const configFilePath = join(process.cwd(), 'data', 'config.json')
    const fileContent = readFileSync(configFilePath, 'utf-8')
    const configData: ConfigData = JSON.parse(fileContent)
    
    return NextResponse.json(configData)
  } catch (error) {
    console.error('Erro ao ler configuração:', error)
    return NextResponse.json(
      { message: 'Erro ao ler configuração dos bolos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, bolo, username, votacaoAtiva, limiteVotos } = await request.json()

    const configFilePath = join(process.cwd(), 'data', 'config.json')
    const fileContent = readFileSync(configFilePath, 'utf-8')
    const configData: ConfigData = JSON.parse(fileContent)

    if (action === 'add') {
      const newBolo: Bolo = {
        id: Date.now().toString(),
        titulo: bolo.titulo,
        descricao: bolo.descricao || '',
        count: 0
      }
      configData.bolos.push(newBolo)
    } else if (action === 'remove') {
      configData.bolos = configData.bolos.filter(b => b.id !== bolo.id)
    } else if (action === 'vote') {
      // Verificar se votação está ativa
      if (!configData.votacaoAtiva) {
        return NextResponse.json(
          { message: 'A votação não está ativa no momento' },
          { status: 400 }
        )
      }

      // Verificar limite de votos do usuário
      const votosFilePath = join(process.cwd(), 'data', 'votos.json')
      let votosData: VotosData
      try {
        const votosContent = readFileSync(votosFilePath, 'utf-8')
        votosData = JSON.parse(votosContent)
      } catch {
        votosData = { votos: [] }
      }

      const userVotes = votosData.votos.filter(v => v.username === username)
      if (userVotes.length >= configData.limiteVotos) {
        return NextResponse.json(
          { message: `Você já atingiu o limite de ${configData.limiteVotos} voto(s)` },
          { status: 400 }
        )
      }

      // Verificar se já votou neste bolo
      const alreadyVoted = userVotes.some(v => v.boloId === bolo.id)
      if (alreadyVoted) {
        return NextResponse.json(
          { message: 'Você já votou neste bolo' },
          { status: 400 }
        )
      }

      // Registrar voto
      const newVoto: Voto = {
        username,
        boloId: bolo.id,
        timestamp: new Date().toISOString()
      }
      votosData.votos.push(newVoto)
      writeFileSync(votosFilePath, JSON.stringify(votosData, null, 2))

      // Incrementar contador do bolo
      const boloIndex = configData.bolos.findIndex(b => b.id === bolo.id)
      if (boloIndex !== -1) {
        configData.bolos[boloIndex].count += 1
      }
    } else if (action === 'toggleVotacao') {
      configData.votacaoAtiva = !configData.votacaoAtiva
    } else if (action === 'updateLimiteVotos') {
      if (limiteVotos >= 1 && limiteVotos <= 2) {
        configData.limiteVotos = limiteVotos
      } else {
        return NextResponse.json(
          { message: 'O limite de votos deve ser entre 1 e 2' },
          { status: 400 }
        )
      }
    }

    writeFileSync(configFilePath, JSON.stringify(configData, null, 2))

    return NextResponse.json({
      message: 'Configuração atualizada com sucesso',
      config: configData
    })

  } catch (error) {
    console.error('Erro ao atualizar configuração:', error)
    return NextResponse.json(
      { message: 'Erro ao atualizar configuração dos bolos' },
      { status: 500 }
    )
  }
}
