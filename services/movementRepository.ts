import api from "./api"

// Interfaces
export interface Movement {
  id: string
  type: "deposit" | "withdraw" | "transfer"
  amount: number
  date: string
  description?: string
  accountId: string
  toAccountId?: string
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export interface MovementFilters {
  startDate?: string
  endDate?: string
  type?: "deposit" | "withdraw" | "transfer"
  accountId?: string
}

// Repositório de Movimento
const movementRepository = {
  // Endpoint base
  endpoint: "/movements",

  // Obter todos os movimentos com filtros opcionais
  async getAll(filters?: MovementFilters): Promise<Movement[]> {
    try {
      const response = await api.get<Movement[]>(this.endpoint, { params: filters })
      return response.data
    } catch (error) {
      console.error("Erro ao obter movimentos:", error)
      throw error
    }
  },

  // Obter movimento por ID
  async getById(id: string): Promise<Movement> {
    try {
      const response = await api.get<Movement>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter movimento ${id}:`, error)
      throw error
    }
  },

  // Criar novo movimento
  async create(movementData: Omit<Movement, "id">): Promise<Movement> {
    try {
      const response = await api.post<Movement>(this.endpoint, movementData)
      return response.data
    } catch (error) {
      console.error("Erro ao criar movimento:", error)
      throw error
    }
  },

  // Atualizar movimento
  async update(id: string, movementData: Partial<Movement>): Promise<Movement> {
    try {
      const response = await api.put<Movement>(`${this.endpoint}/${id}`, movementData)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar movimento ${id}:`, error)
      throw error
    }
  },

  // Excluir movimento
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Erro ao excluir movimento ${id}:`, error)
      throw error
    }
  },

  // Obter movimentos por conta
  async getByAccount(accountId: string, filters?: MovementFilters): Promise<Movement[]> {
    try {
      const response = await api.get<Movement[]>(`${this.endpoint}/account/${accountId}`, { params: filters })
      return response.data
    } catch (error) {
      console.error(`Erro ao obter movimentos da conta ${accountId}:`, error)
      throw error
    }
  },

  // Realizar depósito
  async deposit(accountId: string, amount: number, description?: string): Promise<Movement> {
    try {
      const response = await api.post<Movement>(`${this.endpoint}/deposit`, {
        accountId,
        amount,
        description,
        date: new Date().toISOString().split("T")[0],
      })
      return response.data
    } catch (error) {
      console.error(`Erro ao realizar depósito na conta ${accountId}:`, error)
      throw error
    }
  },

  // Realizar saque
  async withdraw(accountId: string, amount: number, description?: string): Promise<Movement> {
    try {
      const response = await api.post<Movement>(`${this.endpoint}/withdraw`, {
        accountId,
        amount,
        description,
        date: new Date().toISOString().split("T")[0],
      })
      return response.data
    } catch (error) {
      console.error(`Erro ao realizar saque na conta ${accountId}:`, error)
      throw error
    }
  },

  // Realizar transferência
  async transfer(fromAccountId: string, toAccountId: string, amount: number, description?: string): Promise<Movement> {
    try {
      const response = await api.post<Movement>(`${this.endpoint}/transfer`, {
        fromAccountId,
        toAccountId,
        amount,
        description,
        date: new Date().toISOString().split("T")[0],
      })
      return response.data
    } catch (error) {
      console.error(`Erro ao realizar transferência entre contas:`, error)
      throw error
    }
  },
}

export default movementRepository
