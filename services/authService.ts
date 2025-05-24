import axios from "axios"
import { toast } from "@/components/ui/use-toast"

// Tipos para autenticação
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData extends LoginCredentials {
  name: string
}

export interface User {
  id: string
  name: string
  email: string
}

// Obtém a URL da API do ambiente ou usa um fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Cria uma instância do Axios para este serviço
const authApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Função para verificar se o backend está disponível
const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    await authApi.get("/health", { timeout: 3000 })
    return true
  } catch (error) {
    console.warn("Backend não disponível, usando dados locais.")
    return false
  }
}

// Serviço de autenticação
const authService = {
  // Login do usuário
  async login(credentials: LoginCredentials): Promise<boolean> {
    try {
      console.log("Tentando fazer login com:", credentials)

      // Sempre aceita qualquer credencial em modo de desenvolvimento
      // Remova esta linha em produção e descomente o código abaixo
      if (true) {
        console.log("Login simulado bem-sucedido")
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: "1",
            name: "Usuário Teste",
            email: credentials.email || "teste@exemplo.com",
          }),
        )
        localStorage.setItem("authToken", "token-simulado-123456")
        return true
      }

      // Código para conectar com o backend real
      // Descomente este bloco quando o backend estiver pronto
      /*
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await authApi.post("/auth/login", credentials)
        const { token, user } = response.data

        // Armazena o token e informações do usuário
        localStorage.setItem("authToken", token)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userData", JSON.stringify(user))

        return true
      } else {
        // Modo offline: simula login para desenvolvimento
        console.log("Modo offline: simulando login")

        // Aceita qualquer credencial em modo de desenvolvimento
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: "1",
            name: "Usuário Teste",
            email: credentials.email,
          })
        )
        localStorage.setItem("authToken", "token-simulado-123456")
        return true
      }
      */
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      toast({
        title: "Erro ao fazer login",
        description: "Email ou senha incorretos.",
        variant: "destructive",
      })
      return false
    }
  },

  // Cadastro de novo usuário
  async signup(data: SignupData): Promise<boolean> {
    try {
      // Sempre aceita qualquer cadastro em modo de desenvolvimento
      console.log("Cadastro simulado bem-sucedido")
      localStorage.setItem("isLoggedIn", "true")
      localStorage.setItem(
        "userData",
        JSON.stringify({
          id: "1",
          name: data.name || "Usuário Teste",
          email: data.email || "teste@exemplo.com",
        }),
      )
      localStorage.setItem("authToken", "token-simulado-123456")
      return true

      // Código para conectar com o backend real
      // Descomente este bloco quando o backend estiver pronto
      /*
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await authApi.post("/auth/signup", data)
        const { token, user } = response.data

        // Armazena o token e informações do usuário
        localStorage.setItem("authToken", token)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userData", JSON.stringify(user))

        return true
      } else {
        // Modo offline: simula cadastro para desenvolvimento
        console.log("Modo offline: simulando cadastro")
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem(
          "userData",
          JSON.stringify({
            id: "1",
            name: data.name,
            email: data.email,
          })
        )
        localStorage.setItem("authToken", "token-simulado-123456")
        return true
      }
      */
    } catch (error) {
      console.error("Erro ao fazer cadastro:", error)
      toast({
        title: "Erro ao fazer cadastro",
        description: "Não foi possível criar sua conta. Tente novamente.",
        variant: "destructive",
      })
      return false
    }
  },

  // Logout do usuário
  logout(): void {
    localStorage.removeItem("authToken")
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("userData")
    window.location.href = "/login"
  },

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem("isLoggedIn") === "true"
  },

  // Obtém dados do usuário atual
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const userData = localStorage.getItem("userData")
    if (!userData) return null

    try {
      return JSON.parse(userData) as User
    } catch (error) {
      console.error("Erro ao obter dados do usuário:", error)
      return null
    }
  },
}

export default authService
