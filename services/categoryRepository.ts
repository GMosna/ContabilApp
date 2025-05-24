import api from "./api"

// Interfaces
export interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color?: string
  icon?: string
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

// Repositório de Categoria
const categoryRepository = {
  // Endpoint base
  endpoint: "/categories",

  // Obter todas as categorias
  async getAll(): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>(this.endpoint)
      return response.data
    } catch (error) {
      console.error("Erro ao obter categorias:", error)
      throw error
    }
  },

  // Obter categorias por tipo (receita/despesa)
  async getByType(type: "income" | "expense"): Promise<Category[]> {
    try {
      const response = await api.get<Category[]>(`${this.endpoint}/type/${type}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter categorias do tipo ${type}:`, error)
      throw error
    }
  },

  // Obter categoria por ID
  async getById(id: string): Promise<Category> {
    try {
      const response = await api.get<Category>(`${this.endpoint}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erro ao obter categoria ${id}:`, error)
      throw error
    }
  },

  // Criar nova categoria
  async create(categoryData: Omit<Category, "id">): Promise<Category> {
    try {
      const response = await api.post<Category>(this.endpoint, categoryData)
      return response.data
    } catch (error) {
      console.error("Erro ao criar categoria:", error)
      throw error
    }
  },

  // Atualizar categoria
  async update(id: string, categoryData: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put<Category>(`${this.endpoint}/${id}`, categoryData)
      return response.data
    } catch (error) {
      console.error(`Erro ao atualizar categoria ${id}:`, error)
      throw error
    }
  },

  // Excluir categoria
  async delete(id: string): Promise<void> {
    try {
      await api.delete(`${this.endpoint}/${id}`)
    } catch (error) {
      console.error(`Erro ao excluir categoria ${id}:`, error)
      throw error
    }
  },
}

export default categoryRepository
