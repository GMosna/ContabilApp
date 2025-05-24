import axios from "axios"
import { toast } from "@/components/ui/use-toast"

// Obtém a URL da API do ambiente ou usa um fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

// Cria uma instância do Axios com configurações padrão
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação às requisições
api.interceptors.request.use(
  (config) => {
    // Verifica se estamos no navegador antes de acessar localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("authToken")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para tratar erros de CORS e outros
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // O servidor respondeu com um status de erro
      console.error('Erro na resposta:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('Erro na requisição:', error.request);
    } else {
      // Algo aconteceu na configuração da requisição
      console.error('Erro:', error.message);
    }
    return Promise.reject(error);
  }
);

// Função para verificar se o backend está disponível
export const checkBackendAvailability = async (): Promise<boolean> => {
  try {
    await api.get("/health")
    return true
  } catch (error) {
    console.warn("Backend não disponível:", error)
    return false
  }
}

export default api
