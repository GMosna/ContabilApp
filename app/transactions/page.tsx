/**
 * Página de Transações
 *
 * Esta página permite ao usuário:
 * - Visualizar todas as transações
 * - Adicionar novas transações
 * - Editar transações existentes
 * - Excluir transações
 * - Filtrar transações por diferentes critérios
 */

"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowUpDown,
  CreditCard,
  DollarSign,
  Filter,
  Home,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import AuthService from "@/services/authService"
import { toast } from "@/components/ui/use-toast"
import TransactionTypeService, { TransactionType as TransactionTypeInterface } from "@/services/transactionTypeService"

/**
 * Tipos e interfaces para os dados da aplicação
 */
// Tipos para as transações
type TransactionType = "income" | "expense"

// Nova Interface para Categoria (vindo do backend)
interface Category {
  id: number;
  categoryName: string;
}

// Nova Interface para Tipo de Transação (vindo do backend)
interface TransactionTypeBackend {
  id: number;
  transactionType: string;
}

// Interface para transações
interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType // 'income' | 'expense'
  category: string // Agora armazena o ID da categoria como string
  date: string
  accountId: string
  transactionTypeId?: string; // Novo campo para o ID do tipo de transação
}

// Interface para contas bancárias
interface BankAccount {
  id: string
  name: string
  cpf: string
  dateOfBirth: string
  bank: string
  balance: number
}

/**
 * Funções auxiliares para formatação e preparação de dados
 */
// Função para obter o nome amigável da categoria
const getCategoryDisplayName = (categoryId: string, categories: Category[]) => {
  const category = categories.find(cat => cat.id.toString() === categoryId);
  return category ? category.categoryName : "Desconhecido";
};

// Função para obter o ícone da categoria (você pode personalizar isso)
const getCategoryIcon = (categoryId: string, categories: Category[], isExpense: boolean) => {
  const category = categories.find(cat => cat.id.toString() === categoryId);
  // Se a categoria não for encontrada, retorna um ícone padrão
  return isExpense ? CreditCard : DollarSign; 
};

// Função para obter o nome amigável do tipo de transação
const getTransactionTypeDisplayName = (transactionTypeId: string, transactionTypes: TransactionTypeBackend[]) => {
  const type = transactionTypes.find(tt => tt.id.toString() === transactionTypeId);
  return type ? type.transactionType : "Desconhecido";
};

// Função para obter o nome do banco a partir do valor
const getBankLabel = (bankValue: string) => {
  const bankOptions = [
    { value: "banco-do-brasil", label: "Banco do Brasil" },
    { value: "bradesco", label: "Bradesco" },
    { value: "caixa", label: "Caixa Econômica Federal" },
    { value: "itau", label: "Itaú" },
    { value: "santander", label: "Santander" },
    { value: "nubank", label: "Nubank" },
    { value: "inter", label: "Banco Inter" },
    { value: "c6", label: "C6 Bank" },
    { value: "original", label: "Banco Original" },
    { value: "next", label: "Next" },
    { value: "outro", label: "Outro" },
  ]

  const bank = bankOptions.find((bank) => bank.value === bankValue)
  return bank ? bank.label : bankValue
}

/**
 * Componente principal da página de Transações
 * Gerencia o estado e as operações CRUD para transações
 */
export default function TransactionsPage() {
  const router = useRouter()

  // Estados para armazenar dados
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])

  // Novos estados para categorias e tipos de transação do backend
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionTypesBackend, setTransactionTypesBackend] = useState<TransactionTypeBackend[]>([]);

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7))

  // Estados para diálogos
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Estados para transação atual
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: "",
    type: "expense" as TransactionType, // Manter o tipo para controle do formulário
    category: "", // Agora vai armazenar o ID da categoria como string
    date: new Date().toISOString().slice(0, 10),
    accountId: "",
    transactionTypeId: "", // Novo campo para o ID do tipo de transação
  })

  // Função para obter o nome da conta, incluindo o caso especial "Dinheiro em Espécie"
  const getAccountName = (accountId: string) => {
    if (accountId === "cash") return "Dinheiro em Espécie"

    const account = accounts.find((acc) => acc.id === accountId)
    return account ? `${account.name} - ${getBankLabel(account.bank)}` : "Conta desconhecida"
  }

  // Funções de busca de dados do backend
  const fetchAccounts = useCallback(async () => {
    try {
      const response = await AuthService.authenticatedRequest('/account', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar contas bancárias');
      }

      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas contas bancárias.",
        variant: "destructive",
      });
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await AuthService.authenticatedRequest('/transactions', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar transações');
      }

      const data: any[] = await response.json();
      const mappedTransactions: Transaction[] = data.map(t => ({
        id: t.id.toString(),
        description: t.description,
        amount: t.amount,
        date: t.date,
        accountId: t.account ? t.account.id.toString() : "cash",
        category: t.category ? t.category.id.toString() : "",
        transactionTypeId: t.transactionType ? t.transactionType.id.toString() : "",
        type: t.transactionType && t.transactionType.transactionType ? t.transactionType.transactionType.toLowerCase() as TransactionType : "expense",
      }));
      setTransactions(mappedTransactions);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas transações.",
        variant: "destructive",
      });
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await AuthService.authenticatedRequest('/categories', {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar categorias');
      }
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    }
  }, []);

  const fetchTransactionTypes = useCallback(async () => {
    try {
      const response = await AuthService.authenticatedRequest('/transaction-types', {
        method: 'GET'
      });
      if (!response.ok) {
        throw new Error('Erro ao buscar tipos de transação');
      }
      const data = await response.json();
      setTransactionTypesBackend(data);
    } catch (error) {
      console.error('Erro ao buscar tipos de transação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de transação.",
        variant: "destructive",
      });
    }
  }, []);

  // Efeito para carregar dados iniciais
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    if (!isLoggedIn) {
      router.push("/login")
      return;
    }

    // Carregar dados apenas uma vez na montagem do componente
    const loadInitialData = async () => {
      await Promise.all([
        fetchAccounts(),
        fetchTransactions(),
        fetchCategories(),
        fetchTransactionTypes()
      ]);
    };

    loadInitialData();
  }, []); // Removidas as dependências desnecessárias

  // Efeito para definir valores padrão para categoria e tipo de transação quando as listas são carregadas
  useEffect(() => {
    if (categories.length > 0 && newTransaction.category === "") {
      setNewTransaction(prev => ({ ...prev, category: categories[0].id.toString() }));
    }
    if (transactionTypesBackend.length > 0 && newTransaction.transactionTypeId === "") {
      // Não definir um tipo padrão, deixar o usuário escolher
      setNewTransaction(prev => ({ ...prev, transactionTypeId: "" }));
    }
  }, [categories, transactionTypesBackend, newTransaction.category, newTransaction.transactionTypeId]);

  /**
   * Efeito para aplicar filtros às transações
   */
  useEffect(() => {
    // Aplicar filtros às transações
    let result = [...transactions]

    // Filtrar por termo de busca
    if (searchTerm) {
      result = result.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtrar por tipo
    if (filterType !== "all") {
      result = result.filter((t) => t.type === filterType)
    }

    // Filtrar por categoria
    if (filterCategory !== "all") {
      result = result.filter((t) => t.category === filterCategory) // Comparar IDs de string
    }

    // Filtrar por mês
    if (filterMonth) {
      result = result.filter((t) => t.date.startsWith(filterMonth))
    }

    setFilteredTransactions(result)
  }, [transactions, searchTerm, filterType, filterCategory, filterMonth])

  /**
   * Funções para navegação e logout
   */
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  /**
   * Funções para adicionar, editar e excluir transações
   */
  // Adicionar nova transação
  const handleAddTransaction = async () => {
    console.log('Clicou em adicionar');
    // Validação dos campos obrigatórios
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.accountId || !newTransaction.category || !newTransaction.transactionTypeId || !newTransaction.date) {
      console.log('Faltam campos obrigatórios:', newTransaction);
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para adicionar uma transação.",
        variant: "destructive",
      });
      return;
    }

    // Obter usuário logado
    const user = AuthService.getCurrentUser();
    if (!user) {
      console.log('Usuário não autenticado');
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // Montar o payload conforme padrão informado
    const transactionPayload = {
      description: newTransaction.description,
      amount: Number(newTransaction.amount),
      date: new Date(newTransaction.date).toISOString(),
      categoryId: Number(newTransaction.category), // Enviar ID como número
      transactionTypeId: Number(newTransaction.transactionTypeId), // Enviar ID como número
      accountId: newTransaction.accountId === "cash" ? null : Number(newTransaction.accountId), // Handle "cash" account
      userId: Number(user.id),
    };
    console.log('Payload a ser enviado:', transactionPayload);

    try {
      // Enviar requisição para o backend
      const response = await AuthService.authenticatedRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(transactionPayload),
      });
      console.log('Resposta recebida:', response);

      if (response.status === 403) {
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente para adicionar uma transação.",
          variant: "destructive",
        });
        return;
      }

      if (!response.ok) {
        let errorMessage = 'Erro ao adicionar transação';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        console.log('Erro na resposta:', errorMessage);
        toast({
          title: "Erro ao adicionar transação",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Re-fetch all transactions and accounts to ensure consistency
      await fetchTransactions();
      await fetchAccounts();

      setIsAddDialogOpen(false);
      setNewTransaction({
        description: "",
        amount: "",
        type: "expense",
        category: "",
        date: new Date().toISOString().slice(0, 10),
        accountId: "",
        transactionTypeId: "",
      });
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
        variant: "default",
      });
    } catch (error: any) {
      console.log('Erro no catch:', error);
      toast({
        title: "Erro ao adicionar transação",
        description: error.message || "Não foi possível adicionar a transação.",
        variant: "destructive",
      });
    }
  }

  // Editar transação existente
  const handleEditTransaction = async () => {
    if (!currentTransaction || !newTransaction.description || !newTransaction.amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para editar uma transação.",
        variant: "destructive",
      });
      return;
    }

    const user = AuthService.getCurrentUser();
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // Prepare payload for backend PUT request
    const transactionPayload = {
      description: newTransaction.description,
      amount: Number(newTransaction.amount),
      date: new Date(newTransaction.date).toISOString(),
      categoryId: Number(newTransaction.category), // Enviar ID como número
      transactionTypeId: Number(newTransaction.transactionTypeId), // Enviar ID como número
      accountId: newTransaction.accountId === "cash" ? null : Number(newTransaction.accountId),
      userId: Number(user.id),
    };

    try {
      const response = await AuthService.authenticatedRequest(`/transactions/${currentTransaction.id}`, {
        method: 'PUT',
        body: JSON.stringify(transactionPayload),
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao editar transação';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      // After successful update, re-fetch all transactions and accounts to ensure consistency
      await fetchTransactions();
      await fetchAccounts();

      setIsEditDialogOpen(false);
      setCurrentTransaction(null);
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso!",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erro ao editar transação:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a transação.",
        variant: "destructive",
      });
    }
  }

  // Excluir transação
  const handleDeleteTransaction = async () => {
    if (!currentTransaction) return

    try {
      // Validação e requisição DELETE
      const response = await AuthService.authenticatedRequest(`/transactions/${currentTransaction.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erro ao excluir transação')
      }

      // Re-fetch all transactions and accounts to ensure consistency
      await fetchTransactions();
      await fetchAccounts();

      setIsDeleteDialogOpen(false)
      setCurrentTransaction(null)
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
        variant: "default",
      })
    } catch (error: any) {
      toast({
        title: "Erro ao excluir transação",
        description: error.message || "Não foi possível excluir a transação.",
        variant: "destructive",
      })
    }
  }

  // Excluir todas as transações (this function needs to be updated to interact with backend API)
  const handleDeleteAllTransactions = async () => {
    try {
      // Assuming there's a backend endpoint to delete all transactions for a user
      const response = await AuthService.authenticatedRequest('/transactions/clear-all', {
        method: 'DELETE',
      });

      if (!response.ok) {
        let errorMessage = 'Erro ao excluir todas as transações';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      // Re-fetch all transactions and accounts to ensure consistency
      await fetchTransactions();
      await fetchAccounts();

      setIsDeleteAllDialogOpen(false);
      toast({
        title: "Sucesso",
        description: "Todas as transações foram excluídas!",
        variant: "default",
      });
    } catch (error: any) {
      console.error('Erro ao excluir todas as transações:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir todas as transações.",
        variant: "destructive",
      });
    }
  }

  /**
   * Funções para preparar edição e exclusão
   */
  // Preparar para editar uma transação
  const prepareEditTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction)
    setNewTransaction({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category, // Já é string
      date: transaction.date,
      accountId: transaction.accountId,
      transactionTypeId: transaction.transactionTypeId || "", // Já é string
    })
    setIsEditDialogOpen(true)
  }

  // Preparar para excluir uma transação
  const prepareDeleteTransaction = (transaction: Transaction) => {
    setCurrentTransaction(transaction)
    setIsDeleteDialogOpen(true)
  }

  /**
   * Funções de formatação
   */
  // Formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  // Formatar datas
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR").format(date)
  }

  // Função para validação GET com JSON customizado
  // Esta função não parece ser usada na UI, mantida para referência/debug se necessário
  const validateGetTransactions = async () => {
    try {
      const payload = [
        {
          id: 0,
          description: "string",
          amount: 0,
          date: new Date().toISOString(),
          category: {
            id: 0,
            categoryName: "string"
          },
          transactionType: {
            id: 0,
            transactionType: "string"
          },
          user: {
            id: 0,
            name: "string",
            email: "string"
          }
        }
      ]
      const response = await AuthService.authenticatedRequest('/transactions', {
        method: 'GET',
        body: JSON.stringify(payload), // Este body em GET é incomum e pode causar erros no backend
      })
      if (!response.ok) {
        throw new Error('Erro ao validar GET /transactions com JSON')
      }
      toast({
        title: 'Validação GET /transactions',
        description: 'Validação realizada com sucesso!',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Erro na validação GET /transactions',
        description: error.message || 'Não foi possível validar o backend.',
        variant: 'destructive',
      })
    }
  }

  // Função para validação GET de tipos de transação
  const validateGetTransactionTypes = async () => {
    try {
      const payload = [
        {
          id: 0,
          transactionType: "string"
        }
      ]
      const response = await AuthService.authenticatedRequest('/transaction-types', {
        method: 'GET',
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Erro ao validar GET /transaction-types com JSON')
      }
      toast({
        title: 'Validação GET /transaction-types',
        description: 'Validação realizada com sucesso!',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Erro na validação GET /transaction-types',
        description: error.message || 'Não foi possível validar o backend.',
        variant: 'destructive',
      })
    }
  }

  // Função para validação POST de tipo de transação
  const validatePostTransactionType = async () => {
    try {
      const payload = {
        id: 0,
        transactionType: "string"
      }
      const response = await AuthService.authenticatedRequest('/transaction-type', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        throw new Error('Erro ao validar POST /transaction-type com JSON')
      }
      toast({
        title: 'Validação POST /transaction-type',
        description: 'Validação realizada com sucesso!',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Erro na validação POST /transaction-type',
        description: error.message || 'Não foi possível validar o backend.',
        variant: 'destructive',
      })
    }
  }

  // Função para validação e requisição POST em /transactions
  // Esta função não parece ser usada na UI, mantida para referência/debug se necessário
  const validateAndPostTransaction = async () => {
    try {
      // Validação (pode ser um POST de teste ou fetch simples)
      const validationPayload = {
        description: "string",
        amount: 0,
        date: new Date().toISOString(),
        categoryId: 0,
        transactionTypeId: 0,
        userId: 0
      }
      const validationResponse = await AuthService.authenticatedRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(validationPayload),
      })
      if (!validationResponse.ok) {
        throw new Error('Erro na validação POST /transactions')
      }
      // Requisição POST com o JSON completo (Este payload está incorreto para POST de transação real)
      const postPayload = {
        id: 0,
        description: "string",
        amount: 0,
        date: new Date().toISOString(),
        category: {
          id: 0,
          categoryName: "string"
        },
        transactionType: {
          id: 0,
          transactionType: "string"
        },
        user: {
          id: 0,
          name: "string",
          dateOfBirth: "2025-06-04",
          cpf: "string",
          email: "string",
          password: "string"
        }
      }
      const postResponse = await AuthService.authenticatedRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify(postPayload),
      })
      if (!postResponse.ok) {
        throw new Error('Erro ao fazer POST /transactions')
      }
      toast({
        title: 'Validação e POST /transactions',
        description: 'Validação e requisição realizadas com sucesso!',
        variant: 'default',
      })
    } catch (error: any) {
      toast({
        title: 'Erro na validação ou POST /transactions',
        description: error.message || 'Não foi possível validar ou enviar para o backend.',
        variant: 'destructive',
      })
    }
  }

  // Função para abrir o diálogo de adicionar transação (apenas verifica autenticação)
  const handleOpenAddDialog = (open: boolean) => {
    if (open) {
      if (!AuthService.isAuthenticated()) {
        toast({
          title: 'Sessão expirada',
          description: 'Faça login novamente para adicionar uma transação.',
          variant: 'destructive',
        })
        return
      }
      setIsAddDialogOpen(true)
    } else {
      setIsAddDialogOpen(false)
    }
  }

  // Função para editar tipo de transação
  const handleEditTransactionType = async (id: number, newType: string) => {
    try {
      await TransactionTypeService.updateTransactionType(id, {
        id,
        transactionType: newType
      });

      // Atualizar a lista de tipos de transação
      await fetchTransactionTypes();
      
      toast({
        title: "Sucesso",
        description: "Tipo de transação atualizado com sucesso!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o tipo de transação.",
        variant: "destructive",
      });
    }
  };

  // Função para excluir tipo de transação
  const handleDeleteTransactionType = async (id: number) => {
    try {
      await TransactionTypeService.deleteTransactionType(id);

      // Atualizar a lista de tipos de transação
      await fetchTransactionTypes();
      
      toast({
        title: "Sucesso",
        description: "Tipo de transação excluído com sucesso!",
        variant: "default",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o tipo de transação.",
        variant: "destructive",
      });
    }
  };

  // Função para buscar detalhes de um tipo de transação
  const handleGetTransactionType = async (id: number) => {
    try {
      const transactionType = await TransactionTypeService.getTransactionType(id);
      return transactionType;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível buscar o tipo de transação.",
        variant: "destructive",
      });
      return null;
    }
  };

  return (
    <div className="flex min-h-screen flex-col cement-gradient">
      {/* Cabeçalho da página */}
      <header className="border-b border-zinc-700">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/dolar.png" alt="CashFlow Logo" width={40} height={40} className="rounded-md" />
            <span className="text-xl font-bold text-zinc-100">CashFlow</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <Link
              href="/financial-tips"
              className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Dicas Financeiras
            </Link>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-sm font-medium flex items-center gap-1 text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Barra lateral de navegação */}
        <aside className="hidden w-64 flex-col border-r border-zinc-700 md:flex">
          <div className="flex h-14 items-center border-b border-zinc-700 px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-zinc-100">
              <Wallet className="h-5 w-5" />
              <span>Gestão Financeira</span>
            </Link>
          </div>
          <nav className="grid gap-1 p-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <Home className="h-5 w-5" />
              <span>Visão Geral</span>
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-2 rounded-lg bg-zinc-700 px-3 py-2 text-zinc-100"
            >
              <DollarSign className="h-5 w-5" />
              <span>Transações</span>
            </Link>
            <Link
              href="/accounts"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <CreditCard className="h-5 w-5" />
              <span>Contas</span>
            </Link>
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-8 max-w-7xl mx-auto">
            {/* Cabeçalho da seção principal com botões de ação */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-zinc-100">Transações</h1>
              <div className="flex flex-col sm:flex-row gap-2">
                {/* Botão para adicionar nova transação */}
                <Dialog open={isAddDialogOpen} onOpenChange={handleOpenAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="cement-button text-white border-0 shadow-md">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="cement-card border-zinc-700">
                    {/* Conteúdo do diálogo de adicionar transação */}
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Adicionar Transação</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Preencha os detalhes da transação abaixo.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      {/* Formulário de nova transação */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="transaction-type" className="text-zinc-300">
                            Tipo
                          </Label>
                          <Select
                            value={newTransaction.transactionTypeId}
                            onValueChange={(value) => {
                              const selectedType = transactionTypesBackend.find(tt => tt.id.toString() === value);
                              setNewTransaction({
                                ...newTransaction,
                                transactionTypeId: value,
                                type: selectedType ? (selectedType.transactionType.toLowerCase() as TransactionType) : 'expense',
                              });
                            }}
                          >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                              <SelectValue placeholder="Selecione o tipo">
                                {newTransaction.transactionTypeId ? (
                                  (() => {
                                    const selectedType = transactionTypesBackend.find(
                                      (type) => type.id.toString() === newTransaction.transactionTypeId
                                    );
                                    return selectedType ? selectedType.transactionType : "Selecione o tipo";
                                  })()
                                ) : (
                                  "Selecione o tipo"
                                )}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              {transactionTypesBackend.map((type) => (
                                <SelectItem key={type.id} value={type.id.toString()} className="text-zinc-200">
                                  {type.transactionType}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transaction-date" className="text-zinc-300">
                            Data
                          </Label>
                          <Input
                            id="transaction-date"
                            type="date"
                            value={newTransaction.date}
                            onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                            className="bg-zinc-800 border-zinc-700 text-zinc-200"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-description" className="text-zinc-300">
                          Descrição
                        </Label>
                        <Input
                          id="transaction-description"
                          value={newTransaction.description}
                          onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                          placeholder="Ex: Supermercado, Salário, etc."
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-amount" className="text-zinc-300">
                          Valor (R$)
                        </Label>
                        <Input
                          id="transaction-amount"
                          type="number"
                          step="0.01"
                          value={newTransaction.amount}
                          onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                          placeholder="0,00"
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                        />
                      </div>
                      {/* Campo de seleção de conta */}
                      <div className="space-y-2">
                        <Label htmlFor="transaction-account" className="text-zinc-300">
                          Conta
                        </Label>
                        <Select
                          value={newTransaction.accountId}
                          onValueChange={(value) => setNewTransaction({ ...newTransaction, accountId: value })}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione a conta" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            <SelectItem value="cash" className="text-zinc-200">
                              Dinheiro em Espécie
                            </SelectItem>
                            {accounts.length === 0 ? (
                              <SelectItem value="no-account" disabled className="text-zinc-400">
                                Nenhuma conta bancária cadastrada
                              </SelectItem>
                            ) : (
                              accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id} className="text-zinc-200">
                                  {account.name} - {getBankLabel(account.bank)}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {accounts.length === 0 && (
                          <p className="text-amber-400 text-xs mt-1">
                            Você não tem contas bancárias cadastradas.{" "}
                            <Link href="/accounts" className="underline">
                              Adicionar conta
                            </Link>
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction-category" className="text-zinc-300">
                          Categoria
                        </Label>
                        <Select
                          value={newTransaction.category}
                          onValueChange={(value) =>
                            setNewTransaction({ ...newTransaction, category: value })
                          }
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id.toString()} className="text-zinc-200">
                                {cat.categoryName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddDialogOpen(false)}
                        className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddTransaction} className="cement-button text-white border-0">
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Botão para excluir todas as transações */}
                <AlertDialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteAllDialogOpen(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={transactions.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Todas
                  </Button>
                  <AlertDialogContent className="cement-card border-zinc-700">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-zinc-100">Excluir todas as transações</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        Tem certeza que deseja excluir todas as transações? Esta ação não pode ser desfeita e os saldos
                        das contas serão ajustados.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700">
                        Cancelar
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAllTransactions}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Excluir Todas
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Filtros de transações */}
            <Card className="cement-card border-zinc-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Filtro de busca */}
                  <div className="space-y-2">
                    <Label htmlFor="search" className="text-zinc-300">
                      Buscar
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                      <Input
                        id="search"
                        placeholder="Buscar transação..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-200 pl-8 placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                  {/* Filtro de tipo */}
                  <div className="space-y-2">
                    <Label htmlFor="filter-type" className="text-zinc-300">
                      Tipo
                    </Label>
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="all" className="text-zinc-200">
                          Todos os tipos
                        </SelectItem>
                        <SelectItem value="income" className="text-zinc-200">
                          Receitas
                        </SelectItem>
                        <SelectItem value="expense" className="text-zinc-200">
                          Despesas
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Filtro de categoria */}
                  <div className="space-y-2">
                    <Label htmlFor="filter-category" className="text-zinc-300">
                      Categoria
                    </Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                        <SelectValue placeholder="Todas as categorias" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        <SelectItem value="all" className="text-zinc-200">
                          Todas as categorias
                        </SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()} className="text-zinc-200">
                            {cat.categoryName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Filtro de mês */}
                  <div className="space-y-2">
                    <Label htmlFor="filter-month" className="text-zinc-300">
                      Mês
                    </Label>
                    <Input
                      id="filter-month"
                      type="month"
                      value={filterMonth}
                      onChange={(e) => setFilterMonth(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-zinc-200"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Transações */}
            <Card className="cement-card border-zinc-700 shadow-lg">
              <CardHeader className="pb-0">
                <CardTitle className="text-zinc-100">{filteredTransactions.length} transações encontradas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 space-y-4">
                  {filteredTransactions.length === 0 ? (
                    // Mensagem quando não há transações
                    <div className="text-center py-8">
                      <p className="text-zinc-400">Nenhuma transação encontrada com os filtros atuais.</p>
                    </div>
                  ) : (
                    // Tabela de transações
                    <div className="rounded-md border border-zinc-700 overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-zinc-800 border-b border-zinc-700">
                              <th className="px-4 py-3 text-left font-medium text-zinc-300">
                                <div className="flex items-center gap-1 cursor-pointer">
                                  Data <ArrowUpDown className="h-3 w-3" />
                                </div>
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-zinc-300">
                                <div className="flex items-center gap-1 cursor-pointer">
                                  Descrição <ArrowUpDown className="h-3 w-3" />
                                </div>
                              </th>
                              <th className="px-4 py-3 text-left font-medium text-zinc-300">
                                <div className="flex items-center gap-1 cursor-pointer">
                                  Categoria <ArrowUpDown className="h-3 w-3" />
                                </div>
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-zinc-300">
                                <div className="flex items-center justify-end gap-1 cursor-pointer">
                                  Valor <ArrowUpDown className="h-3 w-3" />
                                </div>
                              </th>
                              <th className="px-4 py-3 text-center font-medium text-zinc-300">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((transaction) => {
                              const CategoryIcon = getCategoryIcon(transaction.category, categories, transaction.type === "expense")
                              return (
                                <tr
                                  key={transaction.id}
                                  className="border-b border-zinc-700 last:border-0 hover:bg-zinc-800/50"
                                >
                                  <td className="px-4 py-3 text-zinc-300">{formatDate(transaction.date)}</td>
                                  <td className="px-4 py-3 text-zinc-200 font-medium">{transaction.description}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <div className="rounded-full bg-zinc-800 p-1">
                                        <CategoryIcon className="h-3 w-3 text-zinc-300" />
                                      </div>
                                      <span className="text-zinc-300">{getCategoryDisplayName(transaction.category, categories)}</span>
                                    </div>
                                  </td>
                                  <td
                                    className={`px-4 py-3 text-right font-medium ${
                                      transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                                    }`}
                                  >
                                    {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <div className="flex justify-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => prepareEditTransaction(transaction)}
                                        className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => prepareDeleteTransaction(transaction)}
                                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Diálogos para editar e excluir transações */}

      {/* Diálogo para editar transação */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="cement-card border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Editar Transação</DialogTitle>
            <DialogDescription className="text-zinc-400">Atualize os detalhes da transação abaixo.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-transaction-type" className="text-zinc-300">
                  Tipo
                </Label>
                <Select
                  value={newTransaction.transactionTypeId}
                  onValueChange={(value) => {
                    const selectedType = transactionTypesBackend.find(tt => tt.id.toString() === value);
                    setNewTransaction({
                      ...newTransaction,
                      transactionTypeId: value,
                      type: selectedType ? (selectedType.transactionType.toLowerCase() as TransactionType) : 'expense',
                    });
                  }}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectValue placeholder="Selecione o tipo">
                      {newTransaction.transactionTypeId ? (
                        (() => {
                          const selectedType = transactionTypesBackend.find(
                            (type) => type.id.toString() === newTransaction.transactionTypeId
                          );
                          return selectedType ? selectedType.transactionType : "Selecione o tipo";
                        })()
                      ) : (
                        "Selecione o tipo"
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {transactionTypesBackend.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()} className="text-zinc-200">
                        {type.transactionType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-transaction-date" className="text-zinc-300">
                  Data
                </Label>
                <Input
                  id="edit-transaction-date"
                  type="date"
                  value={newTransaction.date}
                  onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-200"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-transaction-description" className="text-zinc-300">
                Descrição
              </Label>
              <Input
                id="edit-transaction-description"
                value={newTransaction.description}
                onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
                placeholder="Ex: Supermercado, Salário, etc."
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-transaction-amount" className="text-zinc-300">
                Valor (R$)
              </Label>
              <Input
                id="edit-transaction-amount"
                type="number"
                step="0.01"
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                placeholder="0,00"
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-transaction-account" className="text-zinc-300">
                Conta
              </Label>
              <Select
                value={newTransaction.accountId}
                onValueChange={(value) => setNewTransaction({ ...newTransaction, accountId: value })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Selecione a conta" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="cash" className="text-zinc-200">
                    Dinheiro em Espécie
                  </SelectItem>
                  {accounts.length === 0 ? (
                    <SelectItem value="no-account" disabled className="text-zinc-400">
                      Nenhuma conta bancária cadastrada
                    </SelectItem>
                  ) : (
                    accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id} className="text-zinc-200">
                        {account.name} - {getBankLabel(account.bank)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-transaction-category" className="text-zinc-300">
                Categoria
              </Label>
              <Select
                value={newTransaction.category}
                onValueChange={(value) =>
                  setNewTransaction({ ...newTransaction, category: value })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()} className="text-zinc-200">
                      {cat.categoryName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleEditTransaction} className="cement-button text-white border-0">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo para confirmar exclusão de uma transação */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="cement-card border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Excluir Transação</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita e o saldo da conta será
              ajustado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTransaction} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
