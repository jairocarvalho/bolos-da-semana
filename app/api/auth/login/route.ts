import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

interface User {
  username: string
  password: string
  name: string
  isGerencial: boolean
}

interface UsersData {
  users: User[]
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { message: 'Usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    const usersFilePath = join(process.cwd(), 'data', 'users.json')
    const fileContent = readFileSync(usersFilePath, 'utf-8')
    const usersData: UsersData = JSON.parse(fileContent)

    const user = usersData.users.find(
      (u: User) => u.username === username && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { message: 'Usuário ou senha incorretos' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'Login realizado com sucesso',
      user: {
        username: user.username,
        name: user.name,
        isGerencial: user.isGerencial
      }
    })

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
