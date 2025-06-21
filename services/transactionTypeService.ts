import AuthService from "./authService";

export interface TransactionType {
  id: number;
  transactionType: string;
}

class TransactionTypeService {
  private baseUrl = "http://localhost:8080/transaction-types";

  async getTransactionType(id: number): Promise<TransactionType> {
    const response = await AuthService.authenticatedRequest(`${this.baseUrl}/${id}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar tipo de transação");
    }

    return response.json();
  }

  async updateTransactionType(id: number, data: TransactionType): Promise<TransactionType> {
    const response = await AuthService.authenticatedRequest(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar tipo de transação");
    }

    return response.json();
  }

  async deleteTransactionType(id: number): Promise<void> {
    const response = await AuthService.authenticatedRequest(`${this.baseUrl}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Erro ao excluir tipo de transação");
    }
  }
}

export default new TransactionTypeService(); 