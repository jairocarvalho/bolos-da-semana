import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface Voto {
  username: string
  boloId: string
  timestamp: string
}

interface VotosData {
  votos: Voto[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { message: 'Username é obrigatório' },
        { status: 400 }
      )
    }

    const votosFilePath = join(process.cwd(), 'data', 'votos.json')
    let votosData: VotosData
    
    try {
      const votosContent = readFileSync(votosFilePath, 'utf-8')
      votosData = JSON.parse(votosContent)
    } catch {
      votosData = { votos: [] }
    }

    const userVotes = votosData.votos.filter(v => v.username === username)

    return NextResponse.json({
      votos: userVotes,
      total: userVotes.length
    })

  } catch (error) {
    console.error('Erro ao buscar votos:', error)
    return NextResponse.json(
      { message: 'Erro ao buscar votos do usuário' },
      { status: 500 }
    )
  }
}
