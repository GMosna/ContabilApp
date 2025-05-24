import api from "./api"

// Interfaces
export interface User {
  id: string
  name: string
  email: string
  password?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: User
}

// Repositório de Usuário
const userRepository = {
  // Endpoint base
  endpoint: "/users",

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials)
      return response.data
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      throw error
    }
  },

  // Registro
  async register(userData: Omit<User, "id">): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/register", userData)
      return response.data
    } catch (error) {
      console.error("Erro ao registrar usuário:", error)
      throw error
    }
  },

  // Obter usuário atual
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<User>("/auth/me")
      return response.data
    } catch (error) {
      console.error("Erro ao obter usuário atual:", error)
      throw error
    }
  },

  // Obter todos os usuários (admin)
  async getAll(): Promise<User[]> {
    try {
      const response = await api.get<User[]>(this.endpoint)
      return response.data
    } catch (error) {
      console.error("Erro ao obter usuários:", error)
      throw error
    }
  },

  // Obter usuário por ID
  async getById(id: string): Promise<User> {
    try {
      const response = await api.get<User>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter usuário ${id}:`, error)
      throw error
    }
  },

  // Atualizar usuário
  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await api.put<User>(`${this.endpoint}/${id}`, userData)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error)
      throw error
    }
  },

  // Excluir usuário
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Erro ao excluir usuário ${id}:`, error)
      throw error
    }
  },

  // Alterar senha
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      await api.post("/auth/change-password", { oldPassword, newPassword })
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      throw error
    }
  },
}

export default userRepository
