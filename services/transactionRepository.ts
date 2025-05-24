import api from "./api"

// Interfaces
export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: "income" | "expense"
  categoryId: string
  accountId: string
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  type?: "income" | "expense"
  categoryId?: string
  accountId?: string
}

export interface TransactionSummary {
  income: number
  expense: number
  balance: number
}

// Repositório de Transação
const transactionRepository = {
  // Endpoint base
  endpoint: "/transactions",

  // Obter todas as transações com filtros opcionais
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>(this.endpoint, { params: filters })
      return response.data
    } catch (error) {
      console.error("Erro ao obter transações:", error)
      throw error
    }
  },

  // Obter transação por ID
  async getById(id: string): Promise<Transaction> {
    try {
      const response = await api.get<Transaction>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter transação ${id}:`, error)
      throw error
    }
  },

  // Criar nova transação
  async create(transactionData: Omit<Transaction, "id">): Promise<Transaction> {
    try {
      const response = await api.post<Transaction>(this.endpoint, transactionData)
      return response.data
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      throw error
    }
  },

  // Atualizar transação
  async update(id: string, transactionData: Partial<Transaction>): Promise<Transaction> {
    try {
      const response = await api.put<Transaction>(`${this.endpoint}/${id}`, transactionData)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar transação ${id}:`, error)
      throw error
    }
  },

  // Excluir transação
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Erro ao excluir transação ${id}:`, error)
      throw error
    }
  },

  // Obter resumo de transações
  async getSummary(filters?: TransactionFilters): Promise<TransactionSummary> {
    try {
      const response = await api.get<TransactionSummary>(`${this.endpoint}/summary`, { params: filters })
      return response.data
    } catch (error) {
      console.error("Erro ao obter resumo de transações:", error)
      throw error
    }
  },

  // Obter transações por categoria
  async getByCategory(categoryId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>(`${this.endpoint}/category/${categoryId}`, { params: filters })
      return response.data
    } catch (error) {
      console.error(`Erro ao obter transações da categoria ${categoryId}:`, error)
      throw error
    }
  },

  // Obter transações por conta
  async getByAccount(accountId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      const response = await api.get<Transaction[]>(`${this.endpoint}/account/${accountId}`, { params: filters })
      return response.data
    } catch (error) {
      console.error(`Erro ao obter transações da conta ${accountId}:`, error)
      throw error
    }
  },
}

export default transactionRepository
