import axios from "axios"
import { toast } from "@/components/ui/use-toast"

// Tipos para autenticação
export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData extends LoginCredentials {
  name: string
  cpf: string
  dateOfBirth: string
}

export interface User {
  id: string
  name: string
  email: string
}

export interface AuthResponse {
  name: string
  token: string
}

// Obtém a URL da API do ambiente ou usa um fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Cria uma instância do Axios para este serviço
const authApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  withCredentials: true // Enable sending cookies if needed
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

// Constantes para chaves do localStorage
const STORAGE_KEYS = {
  TOKEN: 'authToken',
  IS_LOGGED_IN: 'isLoggedIn',
  USER_DATA: 'userData'
} as const;

// Serviço de autenticação
const authService = {
  // Login do usuário
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log("Tentando fazer login com:", credentials)

      const response = await authApi.post("/auth/login", credentials)
      console.log("Resposta do servidor:", response)

      const { name, token } = response.data

      // Armazena o token e informações do usuário
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true")
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify({ name, email: credentials.email }))

      return response.data
    } catch (error: any) {
      console.error("Erro detalhado ao fazer login:", error.response || error)
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Erro ao conectar com o servidor"
      
      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      })
      throw error
    }
  },

  // Cadastro de novo usuário
  async signup(data: SignupData): Promise<boolean> {
    try {
      // Sempre aceita qualquer cadastro em modo de desenvolvimento
      console.log("Cadastro simulado bem-sucedido")
      const token = "token-simulado-123456";
      const user = {
        id: "1",
        name: data.name || "Usuário Teste",
        email: data.email || "teste@exemplo.com",
      };

      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, "true")
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user))
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
      
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
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN)
    localStorage.removeItem(STORAGE_KEYS.USER_DATA)
    window.location.href = "/login"
  },

  // Verifica se o usuário está autenticado
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN) === "true" && !!this.getToken()
  },

  // Obtém dados do usuário atual
  getCurrentUser(): User | null {
    if (typeof window === "undefined") return null

    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA)
    if (!userData) return null

    try {
      return JSON.parse(userData) as User
    } catch (error) {
      console.error("Erro ao obter dados do usuário:", error)
      return null
    }
  },

  // Salvar token no localStorage
  setToken(token: string) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
  },

  // Obter token do localStorage
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  },

  // Fazer requisição autenticada
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken()
    if (!token) {
      throw new Error("Token não encontrado")
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    }

    try {
      console.log("Fazendo requisição para:", `${API_URL}${url}`)
      console.log("Headers:", headers)
      console.log("Options:", options)

      const response = await fetch(`${API_URL}${url}`, {
        ...options,
        headers,
        credentials: 'include'
      })

      if (response.status === 403) {
        console.error("Erro 403: Token inválido ou expirado")
        this.logout() // Fazer logout se o token estiver inválido
        throw new Error("Sessão expirada. Por favor, faça login novamente.")
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`)
      }

      return response
    } catch (error) {
      console.error("Erro na requisição autenticada:", error)
      throw error
    }
  },
}

export default authService
