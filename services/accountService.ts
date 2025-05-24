import api, { checkBackendAvailability } from "./api"

// Tipos para contas
export interface Account {
  id: string
  name: string
  balance: number
  type: "checking" | "savings" | "investment" | "credit" | "cash"
  color?: string
  icon?: string
}

// Serviço de contas
const accountService = {
  endpoint: "/accounts",

  // Busca todas as contas
  async getAll(): Promise<Account[]> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.get(this.endpoint)

        // Armazena os dados no localStorage para uso offline
        localStorage.setItem("accounts", JSON.stringify(response.data))

        return response.data
      } else {
        // Modo offline: usa dados do localStorage
        const cachedData = localStorage.getItem("accounts")
        if (cachedData) {
          return JSON.parse(cachedData) as Account[]
        }

        // Se não houver dados em cache, retorna array vazio
        return []
      }
    } catch (error) {
      console.error("Erro ao buscar contas:", error)

      // Em caso de erro, tenta usar dados em cache
      const cachedData = localStorage.getItem("accounts")
      if (cachedData) {
        return JSON.parse(cachedData) as Account[]
      }

      return []
    }
  },

  // Busca uma conta pelo ID
  async getById(id: string): Promise<Account | null> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.get(`${this.endpoint}/${id}`)
        return response.data
      } else {
        // Modo offline: busca nos dados em cache
        const cachedData = localStorage.getItem("accounts")
        if (cachedData) {
          const accounts = JSON.parse(cachedData) as Account[]
          return accounts.find((a) => a.id === id) || null
        }
        return null
      }
    } catch (error) {
      console.error(`Erro ao buscar conta ${id}:`, error)
      return null
    }
  },

  // Cria uma nova conta
  async create(account: Omit<Account, "id">): Promise<Account | null> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.post(this.endpoint, account)

        // Atualiza o cache
        const cachedData = localStorage.getItem("accounts")
        if (cachedData) {
          const accounts = JSON.parse(cachedData) as Account[]
          accounts.push(response.data)
          localStorage.setItem("accounts", JSON.stringify(accounts))
        }

        return response.data
      } else {
        // Modo offline: cria localmente
        const newAccount = {
          ...account,
          id: `local-${Date.now()}`,
        } as Account

        const cachedData = localStorage.getItem("accounts")
        const accounts = cachedData ? (JSON.parse(cachedData) as Account[]) : []
        accounts.push(newAccount)
        localStorage.setItem("accounts", JSON.stringify(accounts))

        return newAccount
      }
    } catch (error) {
      console.error("Erro ao criar conta:", error)
      return null
    }
  },

  // Atualiza uma conta existente
  async update(id: string, account: Partial<Account>): Promise<Account | null> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        const response = await api.put(`${this.endpoint}/${id}`, account)

        // Atualiza o cache
        const cachedData = localStorage.getItem("accounts")
        if (cachedData) {
          const accounts = JSON.parse(cachedData) as Account[]
          const index = accounts.findIndex((a) => a.id === id)
          if (index !== -1) {
            accounts[index] = response.data
            localStorage.setItem("accounts", JSON.stringify(accounts))
          }
        }

        return response.data
      } else {
        // Modo offline: atualiza localmente
        const cachedData = localStorage.getItem("accounts")
        if (cachedData) {
          const accounts = JSON.parse(cachedData) as Account[]
          const index = accounts.findIndex((a) => a.id === id)

          if (index !== -1) {
            accounts[index] = { ...accounts[index], ...account }
            localStorage.setItem("accounts", JSON.stringify(accounts))
            return accounts[index]
          }
        }
        return null
      }
    } catch (error) {
      console.error(`Erro ao atualizar conta ${id}:`, error)
      return null
    }
  },

  // Remove uma conta
  async delete(id: string): Promise<boolean> {
    try {
      // Verifica se o backend está disponível
      const isBackendAvailable = await checkBackendAvailability()

      if (isBackendAvailable) {
        // Se o backend estiver disponível, faz a requisição real
        await api.delete(`${this.endpoint}/${id}`)

        // Atualiza o cache
        const cachedData = localStorage.getItem("accounts")
        if (cachedData) {
          const accounts = JSON.parse(cachedData) as Account[]
          const filtered = accounts.filter((a) => a.id !== id)
          localStorage.setItem("accounts", JSON.stringify(filtered))
        }

        return true
      } else {
        // Modo offline: remove localmente
        const cachedData = localStorage.getItem("accounts")
        if (cachedData) {
          const accounts = JSON.parse(cachedData) as Account[]
          const filtered = accounts.filter((a) => a.id !== id)
          localStorage.setItem("accounts", JSON.stringify(filtered))
          return true
        }
        return false
      }
    } catch (error) {
      console.error(`Erro ao excluir conta ${id}:`, error)
      return false
    }
  },

  // Calcula o saldo total de todas as contas
  async getTotalBalance(): Promise<number> {
    const accounts = await this.getAll()
    return accounts.reduce((total, account) => total + account.balance, 0)
  },
}

export default accountService
