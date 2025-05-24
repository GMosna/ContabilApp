import api from "./api"

// Interfaces
export interface TransactionType {
  id: string
  name: string
  description?: string
  createdAt?: Date
  updatedAt?: Date
}

// Repositório de Tipo de Transação
const transactionTypeRepository = {
  // Endpoint base
  endpoint: "/transaction-types",

  // Obter todos os tipos de transação
  async getAll(): Promise<TransactionType[]> {
    try {
      const response = await api.get<TransactionType[]>(this.endpoint)
      return response.data
    } catch (error) {
      console.error("Erro ao obter tipos de transação:", error)
      throw error
    }
  },

  // Obter tipo de transação por ID
  async getById(id: string): Promise<TransactionType> {
    try {
      const response = await api.get<TransactionType>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter tipo de transação ${id}:`, error)
      throw error
    }
  },

  // Criar novo tipo de transação (admin)
  async create(typeData: Omit<TransactionType, "id">): Promise<TransactionType> {
    try {
      const response = await api.post<TransactionType>(this.endpoint, typeData)
      return response.data
    } catch (error) {
      console.error("Erro ao criar tipo de transação:", error)
      throw error
    }
  },

  // Atualizar tipo de transação (admin)
  async update(id: string, typeData: Partial<TransactionType>): Promise<TransactionType> {
    try {
      const response = await api.put<TransactionType>(`${this.endpoint}/${id}`, typeData)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar tipo de transação ${id}:`, error)
      throw error
    }
  },

  // Excluir tipo de transação (admin)
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Erro ao excluir tipo de transação ${id}:`, error)
      throw error
    }
  },
}

export default transactionTypeRepository
