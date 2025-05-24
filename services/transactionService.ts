import api, { checkBackendAvailability } from "./api"

// Tipos para transações
export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  type: "income" | "expense"
  category: string
  accountId: string
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  type?: "income" | "expense"
  category?: string
  accountId?: string
}

// Serviço de transações
const transactionService = {
  endpoint: "/transactions",

  // Busca todas as transações com filtros opcionais
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.get(this.endpoint, { params: filters })

        // Armazena os dados no localStorage para uso offline
        localStorage.setItem("transactions", JSON.stringify(response.data))

        return response.data
      } else {
        // Modo offline: usa dados do localStorage
        const cachedData = localStorage.getItem("transactions")
        if (cachedData) {
          const transactions = JSON.parse(cachedData) as Transaction[]

          // Aplica filtros localmente se necessário
          if (filters) {
            return this.applyFilters(transactions, filters)
          }

          return transactions
        }

        // Se não houver dados em cache, retorna array vazio
        return []
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error)

      // Em caso de erro, tenta usar dados em cache
      const cachedData = localStorage.getItem("transactions")
      if (cachedData) {
        return JSON.parse(cachedData) as Transaction[]
      }

      return []
    }
  },

  // Busca uma transação pelo ID
  async getById(id: string): Promise<Transaction | null> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.get(`${this.endpoint}/${id}`)
        return response.data
      } else {
        // Modo offline: busca nos dados em cache
        const cachedData = localStorage.getItem("transactions")
        if (cachedData) {
          const transactions = JSON.parse(cachedData) as Transaction[]
          return transactions.find((t) => t.id === id) || null
        }
        return null
      }
    } catch (error) {
      console.error(`Erro ao buscar transação ${id}:`, error)
      return null
    }
  },

  // Cria uma nova transação
  async create(transaction: Omit<Transaction, "id">): Promise<Transaction | null> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.post(this.endpoint, transaction)

        // Atualiza o cache
        const cachedData = localStorage.getItem("transactions")
        if (cachedData) {
          const transactions = JSON.parse(cachedData) as Transaction[]
          transactions.push(response.data)
          localStorage.setItem("transactions", JSON.stringify(transactions))
        }

        return response.data
      } else {
        // Modo offline: cria localmente
        const newTransaction = {
          ...transaction,
          id: `local-${Date.now()}`,
        } as Transaction

        const cachedData = localStorage.getItem("transactions")
        const transactions = cachedData ? (JSON.parse(cachedData) as Transaction[]) : []
        transactions.push(newTransaction)
        localStorage.setItem("transactions", JSON.stringify(transactions))

        return newTransaction
      }
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      return null
    }
  },

  // Atualiza uma transação existente
  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction | null> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.put(`${this.endpoint}/${id}`, transaction)

        // Atualiza o cache
        const cachedData = localStorage.getItem("transactions")
        if (cachedData) {
          const transactions = JSON.parse(cachedData) as Transaction[]
          const index = transactions.findIndex((t) => t.id === id)
          if (index !== -1) {
            transactions[index] = response.data
            localStorage.setItem("transactions", JSON.stringify(transactions))
          }
        }

        return response.data
      } else {
        // Modo offline: atualiza localmente
        const cachedData = localStorage.getItem("transactions")
        if (cachedData) {
          const transactions = JSON.parse(cachedData) as Transaction[]
          const index = transactions.findIndex((t) => t.id === id)

          if (index !== -1) {
            transactions[index] = { ...transactions[index], ...transaction }
            localStorage.setItem("transactions", JSON.stringify(transactions))
            return transactions[index]
          }
        }
        return null
      }
    } catch (error) {
      console.error(`Erro ao atualizar transação ${id}:`, error)
      return null
    }
  },

  // Remove uma transação
  async delete(id: string): Promise<boolean> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        await api.delete(`${this.endpoint}/${id}`)

        // Atualiza o cache
        const cachedData = localStorage.getItem("transactions")
        if (cachedData) {
          const transactions = JSON.parse(cachedData) as Transaction[]
          const filtered = transactions.filter((t) => t.id !== id)
          localStorage.setItem("transactions", JSON.stringify(filtered))
        }

        return true
      } else {
        // Modo offline: remove localmente
        const cachedData = localStorage.getItem("transactions")
        if (cachedData) {
          const transactions = JSON.parse(cachedData) as Transaction[]
          const filtered = transactions.filter((t) => t.id !== id)
          localStorage.setItem("transactions", JSON.stringify(filtered))
          return true
        }
        return false
      }
    } catch (error) {
      console.error(`Erro ao excluir transação ${id}:`, error)
      return false
    }
  },

  // Função auxiliar para aplicar filtros localmente
  applyFilters(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
    return transactions.filter((transaction) => {
      // Filtro por tipo
      if (filters.type && transaction.type !== filters.type) {
        return false
      }

      // Filtro por categoria
      if (filters.category && transaction.category !== filters.category) {
        return false
      }

      // Filtro por conta
      if (filters.accountId && transaction.accountId !== filters.accountId) {
        return false
      }

      // Filtro por data inicial
      if (filters.startDate && new Date(transaction.date) < new Date(filters.startDate)) {
        return false
      }

      // Filtro por data final
      if (filters.endDate && new Date(transaction.date) > new Date(filters.endDate)) {
        return false
      }

      return true
    })
  },
}

export default transactionService
