import api from "./api"

// Interfaces
export interface Account {
  id: string
  name: string
  type: string
  balance: number
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

// Repositório de Conta
const accountRepository = {
  // Endpoint base
  endpoint: "/accounts",

  // Obter todas as contas do usuário
  async getAll(): Promise<Account[]> {
    try {
      const response = await api.get<Account[]>(this.endpoint)
      return response.data
    } catch (error) {
      console.error("Erro ao obter contas:", error)
      throw error
    }
  },

  // Obter conta por ID
  async getById(id: string): Promise<Account> {
    try {
      const response = await api.get<Account>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter conta ${id}:`, error)
      throw error
    }
  },

  // Criar nova conta
  async create(accountData: Omit<Account, "id">): Promise<Account> {
    try {
      const response = await api.post<Account>(this.endpoint, accountData)
      return response.data
    } catch (error) {
      console.error("Erro ao criar conta:", error)
      throw error
    }
  },

  // Atualizar conta
  async update(id: string, accountData: Partial<Account>): Promise<Account> {
    try {
      const response = await api.put<Account>(`${this.endpoint}/${id}`, accountData)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar conta ${id}:`, error)
      throw error
    }
  },

  // Excluir conta
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Erro ao excluir conta ${id}:`, error)
      throw error
    }
  },

  // Obter saldo total de todas as contas
  async getTotalBalance(): Promise<number> {
    try {
      const response = await api.get<{ total: number }>(`${this.endpoint}/balance`)
      return response.data.total
    } catch (error) {
      console.error("Erro ao obter saldo total:", error)
      throw error
    }
  },

  // Realizar depósito em uma conta
  async deposit(id: string, amount: number): Promise<Account> {
    try {
      const response = await api.post<Account>(`${this.endpoint}/${id}/deposit`, { amount })
      return response.data
    } catch (error) {
      console.error(`Erro ao realizar depósito na conta ${id}:`, error)
      throw error
    }
  },

  // Realizar saque em uma conta
  async withdraw(id: string, amount: number): Promise<Account> {
    try {
      const response = await api.post<Account>(`${this.endpoint}/${id}/withdraw`, { amount })
      return response.data
    } catch (error) {
      console.error(`Erro ao realizar saque na conta ${id}:`, error)
      throw error
    }
  },

  // Transferir entre contas
  async transfer(fromId: string, toId: string, amount: number): Promise<void> {
    try {
      await api.post(`${this.endpoint}/transfer`, { fromId, toId, amount })
    } catch (error) {
      console.error(`Erro ao transferir entre contas:`, error)
      throw error
    }
  },
}

export default accountRepository
