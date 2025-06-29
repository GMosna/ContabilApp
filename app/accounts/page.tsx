"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  DollarSign,
  Home,
  LogOut,
  Plus,
  Wallet,
  Building,
  User,
  CreditCardIcon as CardIcon,
  Trash2,
  Search,
  ArrowUpDown,
  Pencil,
  BarChart3,
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
} from "@/components/ui/dialog"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
import { toast } from "@/components/ui/use-toast"
import AuthService from "@/services/authService"
import movementRepository, { Movement } from "@/services/movementRepository"
import { Bar, Pie, Line } from 'react-chartjs-2'
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend)

// Interface para as contas bancárias
interface BankAccount {
  id: number
  name: string
  cpf: string
  dateOfBirth: string
  bank: string
  balance: number
}

// Tipos para as transações
type TransactionType = "income" | "expense"
type TransactionCategory =
  | "salary"
  | "investment"
  | "other_income"
  | "food"
  | "transport"
  | "housing"
  | "utilities"
  | "entertainment"
  | "health"
  | "education"
  | "other_expense"

// Interface para transações
interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string
  accountId: string
}

// Lista de bancos brasileiros
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

// Adicionar estado para transações
export default function AccountsPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false)
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false)
  const [newAccount, setNewAccount] = useState({
    name: "",
    cpf: "",
    dateOfBirth: "",
    bank: "",
    balance: "",
  })
  const [bankMovement, setBankMovement] = useState<{
    accountId: number | null
    amount: string
    movementDate: string
  }>({
    accountId: null,
    amount: "",
    movementDate: new Date().toISOString().slice(0, 10),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [movementErrors, setMovementErrors] = useState<Record<string, string>>({})
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Estados para a seção de movimentos
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null)
  const [movementType, setMovementType] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [dateFilter, setDateFilter] = useState<string>("")
  const [monthFilter, setMonthFilter] = useState<string>("")
  const [dateMode, setDateMode] = useState<'date' | 'month'>("date")

  // Adicionar estado para edição
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null)

  // Função para buscar as contas do backend
  const fetchAccounts = async () => {
    try {
      const response = await AuthService.authenticatedRequest('/account', {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar contas bancárias');
      }

      const data = await response.json();
      console.log('Contas recebidas:', data);
      setAccounts(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao buscar contas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas contas bancárias.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    // Se não estiver logado, redirecionar para a página de login
    if (!isLoggedIn) {
      router.push("/login")
      return;
    }

    // Buscar as contas do backend
    fetchAccounts();
  }, [router]);

  // Filtrar transações quando os filtros ou a conta selecionada mudar
  useEffect(() => {
    if (!selectedAccountId) {
      setFilteredTransactions([])
      return
    }

    let filtered = transactions.filter((t) => Number(t.accountId) === selectedAccountId)

    // Filtrar por tipo (depósito/saque)
    if (movementType === "deposit") {
      filtered = filtered.filter((t) => t.type === "income")
    } else if (movementType === "withdraw") {
      filtered = filtered.filter((t) => t.type === "expense")
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter((t) => t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filtrar por data específica ou mês
    if (dateMode === 'date' && dateFilter) {
      filtered = filtered.filter((t) => t.date.slice(0, 10) === dateFilter)
    } else if (dateMode === 'month' && monthFilter) {
      filtered = filtered.filter((t) => t.date.startsWith(monthFilter))
    }

    // Ordenar por data (mais recente primeiro)
    filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }, [selectedAccountId, transactions, movementType, searchTerm, dateFilter, monthFilter, dateMode])

  // Buscar movimentos reais ao selecionar uma conta
  useEffect(() => {
    fetchMovements()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId])

  // Função para buscar movimentos bancários
  const fetchMovements = async () => {
    if (!selectedAccountId) {
      setTransactions([])
      return
    }
    try {
      const movements = await movementRepository.getByAccount(selectedAccountId.toString())
      // Converter os movimentos para o formato Transaction
      const transactions: Transaction[] = movements.map((m) => ({
        id: m.id,
        description: m.description || (m.type === "deposit" ? "Depósito" : "Saque"),
        amount: m.amount,
        type: m.type === "deposit" ? "income" : "expense",
        category: m.type === "deposit" ? "other_income" : "other_expense",
        date: m.date,
        accountId: m.accountId,
      }))
      setTransactions(transactions)
    } catch (error) {
      setTransactions([])
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!newAccount.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!newAccount.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(newAccount.cpf)) {
      newErrors.cpf = "CPF deve estar no formato 000.000.000-00"
    }

    if (!newAccount.dateOfBirth) {
      newErrors.dateOfBirth = "Data de nascimento é obrigatória"
    }

    if (!newAccount.bank) {
      newErrors.bank = "Banco é obrigatório"
    }

    if (!newAccount.balance.trim()) {
      newErrors.balance = "Saldo é obrigatório"
    } else if (isNaN(Number(newAccount.balance))) {
      newErrors.balance = "Saldo deve ser um número válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateMovementForm = () => {
    const newErrors: Record<string, string> = {}

    if (bankMovement.accountId === null) {
      newErrors.accountId = "Selecione uma conta"
    }

    if (!bankMovement.amount.trim()) {
      newErrors.amount = "Valor é obrigatório"
    } else if (isNaN(Number(bankMovement.amount)) || Number(bankMovement.amount) <= 0) {
      newErrors.amount = "Valor deve ser um número positivo"
    }

    if (!bankMovement.movementDate) {
      newErrors.movementDate = "Data é obrigatória"
    }

    setMovementErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddAccount = async () => {
    if (!validateForm()) return;

    try {
      // Verificar se está autenticado
      if (!AuthService.isAuthenticated()) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para adicionar uma conta.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Criar o objeto da nova conta
      const newAccountData = {
        name: newAccount.name,
        cpf: newAccount.cpf.replace(/[.-]/g, ''), // Remove pontos e traço do CPF
        dateOfBirth: newAccount.dateOfBirth,
        bank: newAccount.bank,
        balance: newAccount.balance ? Number(newAccount.balance) : 0.00
      };

      // Fazer a requisição autenticada
      const createResponse = await AuthService.authenticatedRequest('/account', {
        method: 'POST',
        body: JSON.stringify(newAccountData)
      });

      if (!createResponse.ok) {
        if (createResponse.status === 403) {
          throw new Error('Acesso negado. Verifique suas permissões.');
        }
        throw new Error('Erro ao adicionar conta bancária');
      }

      const createdAccount = await createResponse.json();

      // Atualizar a lista de contas
      const updatedAccounts = [...accounts, createdAccount];
      setAccounts(updatedAccounts);

      // Salvar no localStorage
      localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts));

      // Fechar o diálogo e resetar o formulário
      setIsAddDialogOpen(false);
      setNewAccount({
        name: "",
        cpf: "",
        dateOfBirth: "",
        bank: "",
        balance: "",
      });
      setErrors({});

      // Mostrar mensagem de sucesso
      toast({
        title: "Sucesso",
        description: "Conta bancária adicionada com sucesso!",
        variant: "default",
      });

    } catch (error) {
      console.error('Erro:', error);
      // Mostrar mensagem de erro específica
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível adicionar a conta bancária. Tente novamente.",
        variant: "destructive",
      });

      // Se for erro de autenticação, redirecionar para o login
      if (error instanceof Error && error.message.includes('Token não encontrado')) {
        router.push("/login");
      }
    }
  };

  // Função para processar depósito
  const handleDeposit = async () => {
    if (!validateMovementForm() || bankMovement.accountId === null) return
    const accountIndex = accounts.findIndex((account) => account.id === bankMovement.accountId)
    if (accountIndex === -1) return
    try {
      // Requisição PATCH para depósito (atualiza saldo e cria movimento no backend)
      const response = await AuthService.authenticatedRequest(
        `/account/${bankMovement.accountId}/deposito`,
        {
          method: 'PATCH',
          body: JSON.stringify({ value: Number(bankMovement.amount) }),
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erro ao realizar depósito')
      }
      // Conta atualizada após o depósito
      const updatedAccount = await response.json()
      // Atualizar o estado das contas
      const updatedAccounts = [...accounts]
      updatedAccounts[accountIndex] = updatedAccount
      setAccounts(updatedAccounts)
      // Fechar o diálogo e resetar o formulário
      setIsDepositDialogOpen(false)
      setBankMovement({
        accountId: null,
        amount: "",
        movementDate: new Date().toISOString().slice(0, 10),
      })
      setMovementErrors({})
      toast({
        title: "Sucesso",
        description: "Depósito realizado com sucesso!",
        variant: "default",
      })
      await fetchMovements()
    } catch (error: any) {
      toast({
        title: "Erro ao depositar",
        description: error.message || "Não foi possível realizar o depósito.",
        variant: "destructive",
      })
    }
  }

  // Função para processar saque
  const handleWithdraw = async () => {
    if (!validateMovementForm() || bankMovement.accountId === null) return
    const accountIndex = accounts.findIndex((account) => account.id === bankMovement.accountId)
    if (accountIndex === -1) return
    try {
      // Requisição PATCH para saque (atualiza saldo e cria movimento no backend)
      const response = await AuthService.authenticatedRequest(
        `/account/${bankMovement.accountId}/saque`,
        {
          method: 'PATCH',
          body: JSON.stringify({ value: Number(bankMovement.amount) }),
        }
      )
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Erro ao realizar saque')
      }
      // Conta atualizada após o saque
      const updatedAccount = await response.json()
      // Atualizar o estado das contas
      const updatedAccounts = [...accounts]
      updatedAccounts[accountIndex] = updatedAccount
      setAccounts(updatedAccounts)
      // Fechar o diálogo e resetar o formulário
      setIsWithdrawDialogOpen(false)
      setBankMovement({
        accountId: null,
        amount: "",
        movementDate: new Date().toISOString().slice(0, 10),
      })
      setMovementErrors({})
      toast({
        title: "Sucesso",
        description: "Saque realizado com sucesso!",
        variant: "default",
      })
      await fetchMovements()
    } catch (error: any) {
      toast({
        title: "Erro ao sacar",
        description: error.message || "Não foi possível realizar o saque.",
        variant: "destructive",
      })
    }
  }

  // Função para excluir uma conta
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      // Verificar se está autenticado
      if (!AuthService.isAuthenticated()) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para excluir uma conta.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Fazer a requisição DELETE
      const deleteResponse = await AuthService.authenticatedRequest(`/account/${accountToDelete}`, {
        method: 'DELETE'
      });

      if (!deleteResponse.ok) {
        throw new Error('Erro ao excluir conta bancária');
      }

      // Atualizar o estado local removendo a conta excluída
      const updatedAccounts = accounts.filter((account) => account.id !== accountToDelete);
      setAccounts(updatedAccounts);

      // Fechar o diálogo e limpar a conta selecionada
      setIsDeleteAccountDialogOpen(false);
      setAccountToDelete(null);

      // Se a conta excluída for a selecionada na seção de movimentos, limpar a seleção
      if (accountToDelete === selectedAccountId) {
        setSelectedAccountId(null);
      }

      // Mostrar mensagem de sucesso
      toast({
        title: "Sucesso",
        description: "Conta bancária excluída com sucesso!",
        variant: "default",
      });

    } catch (error) {
      console.error('Erro ao excluir conta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível excluir a conta bancária.",
        variant: "destructive",
      });

      // Se for erro de autenticação, redirecionar para o login
      if (error instanceof Error && error.message.includes('Token não encontrado')) {
        router.push("/login");
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCPF = formatCPF(e.target.value)
    setNewAccount({ ...newAccount, cpf: formattedCPF })
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    } catch (error) {
      return dateString
    }
  }

  const getBankLabel = (value: string) => {
    const bank = bankOptions.find((bank) => bank.value === value)
    return bank ? bank.label : value
  }

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + account.balance, 0)
  }

  const getAccountName = (accountId: string) => {
    const account = accounts.find((acc) => acc.id.toString() === accountId)
    return account ? account.name : "Conta desconhecida"
  }

  const handleEditAccount = async () => {
    if (!accountToEdit) return;

    try {
      // Verificar se está autenticado
      if (!AuthService.isAuthenticated()) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para editar uma conta.",
          variant: "destructive",
        });
        router.push("/login");
        return;
      }

      // Criar o objeto com os dados atualizados
      const updateData = {
        name: accountToEdit.name,
        cpf: accountToEdit.cpf.replace(/[.-]/g, ''), // Remove pontos e traço do CPF
        dateOfBirth: accountToEdit.dateOfBirth,
        bank: accountToEdit.bank,
        balance: accountToEdit.balance
      };

      // Fazer a requisição PUT
      const updateResponse = await AuthService.authenticatedRequest(`/account/${accountToEdit.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        throw new Error('Erro ao atualizar conta bancária');
      }

      const updatedAccount = await updateResponse.json();

      // Atualizar o estado local
      const updatedAccounts = accounts.map(account => 
        account.id === accountToEdit.id ? updatedAccount : account
      );
      setAccounts(updatedAccounts);

      // Fechar o diálogo e limpar a conta selecionada
      setIsEditDialogOpen(false);
      setAccountToEdit(null);

      // Mostrar mensagem de sucesso
      toast({
        title: "Sucesso",
        description: "Conta bancária atualizada com sucesso!",
        variant: "default",
      });

    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível atualizar a conta bancária.",
        variant: "destructive",
      });

      // Se for erro de autenticação, redirecionar para o login
      if (error instanceof Error && error.message.includes('Token não encontrado')) {
        router.push("/login");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col cement-gradient">
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
              Visão Geral
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
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
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
            <Link
              href="/dashboard?tab=dashboard"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <h1 className="text-2xl font-bold text-zinc-100">Contas Bancárias</h1>
              <div className="flex flex-col sm:flex-row gap-2">
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="cement-button text-white border-0 shadow-md">
                      <Plus className="mr-2 h-4 w-4" />
                      Nova Conta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="cement-card border-zinc-700">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Adicionar Conta Bancária</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Preencha os detalhes da sua conta bancária abaixo.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="account-name" className="text-zinc-300">
                          Nome Completo
                        </Label>
                        <Input
                          id="account-name"
                          value={newAccount.name}
                          onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                          placeholder="Ex: João da Silva"
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                        />
                        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-cpf" className="text-zinc-300">
                          CPF
                        </Label>
                        <Input
                          id="account-cpf"
                          value={newAccount.cpf}
                          onChange={handleCPFChange}
                          placeholder="000.000.000-00"
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                        />
                        {errors.cpf && <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-date" className="text-zinc-300">
                          Data de Nascimento
                        </Label>
                        <Input
                          id="account-date"
                          type="date"
                          value={newAccount.dateOfBirth}
                          onChange={(e) => setNewAccount({ ...newAccount, dateOfBirth: e.target.value })}
                          className="bg-zinc-800 border-zinc-700 text-zinc-200"
                        />
                        {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-bank" className="text-zinc-300">
                          Banco
                        </Label>
                        <Select
                          value={newAccount.bank}
                          onValueChange={(value) => setNewAccount({ ...newAccount, bank: value })}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione o banco" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {bankOptions.map((bank) => (
                              <SelectItem key={bank.value} value={bank.value} className="text-zinc-200">
                                {bank.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.bank && <p className="text-red-400 text-xs mt-1">{errors.bank}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="account-balance" className="text-zinc-300">
                          Saldo Inicial (R$)
                        </Label>
                        <Input
                          id="account-balance"
                          type="number"
                          step="0.01"
                          value={newAccount.balance}
                          onChange={(e) => setNewAccount({ ...newAccount, balance: e.target.value })}
                          placeholder="0,00"
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                        />
                        {errors.balance && <p className="text-red-400 text-xs mt-1">{errors.balance}</p>}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddDialogOpen(false)
                          setErrors({})
                        }}
                        className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleAddAccount} className="cement-button text-white border-0">
                        Adicionar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Botão de Depósito */}
                <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                      disabled={accounts.length === 0}
                    >
                      <ArrowDownCircle className="mr-2 h-4 w-4" />
                      Depósito
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="cement-card border-zinc-700">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Realizar Depósito</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Informe os detalhes do depósito abaixo.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="deposit-account" className="text-zinc-300">
                          Conta
                        </Label>
                        <Select
                          value={bankMovement.accountId?.toString() || ""}
                          onValueChange={(value) => setBankMovement({ ...bankMovement, accountId: Number(value) })}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione a conta" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()} className="text-zinc-200">
                                {account.name} - {getBankLabel(account.bank)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {movementErrors.accountId && (
                          <p className="text-red-400 text-xs mt-1">{movementErrors.accountId}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deposit-amount" className="text-zinc-300">
                          Valor (R$)
                        </Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          step="0.01"
                          value={bankMovement.amount}
                          onChange={(e) => setBankMovement({ ...bankMovement, amount: e.target.value })}
                          placeholder="0,00"
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                        />
                        {movementErrors.amount && <p className="text-red-400 text-xs mt-1">{movementErrors.amount}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deposit-date" className="text-zinc-300">
                          Data
                        </Label>
                        <Input
                          id="deposit-date"
                          type="date"
                          value={bankMovement.movementDate}
                          onChange={(e) => setBankMovement({ ...bankMovement, movementDate: e.target.value })}
                          className="bg-zinc-800 border-zinc-700 text-zinc-200"
                        />
                        {movementErrors.movementDate && (
                          <p className="text-red-400 text-xs mt-1">{movementErrors.movementDate}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDepositDialogOpen(false)
                          setMovementErrors({})
                        }}
                        className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleDeposit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Depositar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Botão de Saque */}
                <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="bg-amber-600 hover:bg-amber-700 text-white shadow-md"
                      disabled={accounts.length === 0}
                    >
                      <ArrowUpCircle className="mr-2 h-4 w-4" />
                      Saque
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="cement-card border-zinc-700">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Realizar Saque</DialogTitle>
                      <DialogDescription className="text-zinc-400">
                        Informe os detalhes do saque abaixo.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-account" className="text-zinc-300">
                          Conta
                        </Label>
                        <Select
                          value={bankMovement.accountId?.toString() || ""}
                          onValueChange={(value) => setBankMovement({ ...bankMovement, accountId: Number(value) })}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione a conta" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id.toString()} className="text-zinc-200">
                                {account.name} - {getBankLabel(account.bank)} ({formatCurrency(account.balance)})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {movementErrors.accountId && (
                          <p className="text-red-400 text-xs mt-1">{movementErrors.accountId}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-amount" className="text-zinc-300">
                          Valor (R$)
                        </Label>
                        <Input
                          id="withdraw-amount"
                          type="number"
                          step="0.01"
                          value={bankMovement.amount}
                          onChange={(e) => setBankMovement({ ...bankMovement, amount: e.target.value })}
                          placeholder="0,00"
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
                        />
                        {movementErrors.amount && <p className="text-red-400 text-xs mt-1">{movementErrors.amount}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdraw-date" className="text-zinc-300">
                          Data
                        </Label>
                        <Input
                          id="withdraw-date"
                          type="date"
                          value={bankMovement.movementDate}
                          onChange={(e) => setBankMovement({ ...bankMovement, movementDate: e.target.value })}
                          className="bg-zinc-800 border-zinc-700 text-zinc-200"
                        />
                        {movementErrors.movementDate && (
                          <p className="text-red-400 text-xs mt-1">{movementErrors.movementDate}</p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsWithdrawDialogOpen(false)
                          setMovementErrors({})
                        }}
                        className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                      >
                        Cancelar
                      </Button>
                      <Button onClick={handleWithdraw} className="bg-amber-600 hover:bg-amber-700 text-white">
                        Sacar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Resumo das Contas */}
            <Card className="cement-card border-zinc-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-zinc-100">Resumo das Contas</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-4">
                    <div className="text-zinc-400">Carregando contas...</div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <div className="text-sm text-zinc-400">Total em Contas</div>
                      <div className="text-2xl font-bold text-zinc-100">{formatCurrency(getTotalBalance())}</div>
                    </div>
                    <div className="flex flex-col gap-2 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                      <div className="text-sm text-zinc-400">Número de Contas</div>
                      <div className="text-2xl font-bold text-zinc-100">{accounts.length}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lista de Contas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoading ? (
                <Card className="cement-card border-zinc-700 shadow-lg md:col-span-2 lg:col-span-3">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="text-zinc-400">Carregando suas contas bancárias...</div>
                  </CardContent>
                </Card>
              ) : accounts.length === 0 ? (
                <Card className="cement-card border-zinc-700 shadow-lg md:col-span-2 lg:col-span-3">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-zinc-800 p-4 mb-4">
                      <CreditCard className="h-8 w-8 text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-medium text-zinc-200 mb-2">Nenhuma conta cadastrada</h3>
                    <p className="text-zinc-400 text-center mb-4">
                      Você ainda não possui contas bancárias cadastradas. Adicione sua primeira conta para começar.
                    </p>
                    <Button
                      onClick={() => setIsAddDialogOpen(true)}
                      className="cement-button text-white border-0 shadow-md"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Adicionar Conta
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                accounts.map((account) => (
                  <Card key={account.id} className="cement-card border-zinc-700 shadow-lg overflow-hidden">
                    <CardHeader className="pb-2 border-b border-zinc-700 flex justify-between items-center">
                      <CardTitle className="text-zinc-100 flex items-center gap-2">
                        <Building className="h-5 w-5 text-zinc-300" />
                        {getBankLabel(account.bank)}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-400 hover:text-white hover:bg-red-600"
                        onClick={() => {
                          setAccountToDelete(account.id)
                          setIsDeleteAccountDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-zinc-400">Saldo</div>
                          <div className="text-xl font-bold text-zinc-100">{formatCurrency(account.balance)}</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-zinc-400" />
                            <span className="text-zinc-300">{account.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CardIcon className="h-4 w-4 text-zinc-400" />
                            <span className="text-zinc-300">{account.cpf}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-zinc-400" />
                            <span className="text-zinc-300">{transactions.filter((t) => t.accountId === account.id.toString()).length} transações</span>
                          </div>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                            onClick={() => {
                              setBankMovement({
                                ...bankMovement,
                                accountId: account.id,
                              })
                              setIsDepositDialogOpen(true)
                            }}
                          >
                            <ArrowDownCircle className="mr-1 h-3 w-3" />
                            Depositar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                            onClick={() => {
                              setBankMovement({
                                ...bankMovement,
                                accountId: account.id,
                              })
                              setIsWithdrawDialogOpen(true)
                            }}
                          >
                            <ArrowUpCircle className="mr-1 h-3 w-3" />
                            Sacar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                            onClick={() => {
                              setAccountToEdit(account)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="mr-1 h-3 w-3" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
      {/* Diálogo de confirmação para excluir conta */}
      <AlertDialog open={isDeleteAccountDialogOpen} onOpenChange={setIsDeleteAccountDialogOpen}>
        <AlertDialogContent className="cement-card border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Excluir Conta</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita e todas as transações
              associadas a esta conta serão excluídas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Diálogo de Edição de Conta */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="cement-card border-zinc-700">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Editar Conta Bancária</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Atualize os detalhes da sua conta bancária abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-account-name" className="text-zinc-300">
                Nome Completo
              </Label>
              <Input
                id="edit-account-name"
                value={accountToEdit?.name || ""}
                onChange={(e) => setAccountToEdit(accountToEdit ? { ...accountToEdit, name: e.target.value } : null)}
                placeholder="Ex: João da Silva"
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-cpf" className="text-zinc-300">
                CPF
              </Label>
              <Input
                id="edit-account-cpf"
                value={accountToEdit?.cpf || ""}
                onChange={(e) => {
                  const formattedCPF = formatCPF(e.target.value)
                  setAccountToEdit(accountToEdit ? { ...accountToEdit, cpf: formattedCPF } : null)
                }}
                placeholder="000.000.000-00"
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-date" className="text-zinc-300">
                Data de Nascimento
              </Label>
              <Input
                id="edit-account-date"
                type="date"
                value={accountToEdit?.dateOfBirth || ""}
                onChange={(e) => setAccountToEdit(accountToEdit ? { ...accountToEdit, dateOfBirth: e.target.value } : null)}
                className="bg-zinc-800 border-zinc-700 text-zinc-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-bank" className="text-zinc-300">
                Banco
              </Label>
              <Select
                value={accountToEdit?.bank || ""}
                onValueChange={(value) => setAccountToEdit(accountToEdit ? { ...accountToEdit, bank: value } : null)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank.value} value={bank.value} className="text-zinc-200">
                      {bank.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-account-balance" className="text-zinc-300">
                Saldo (R$)
              </Label>
              <Input
                id="edit-account-balance"
                type="number"
                step="0.01"
                value={accountToEdit?.balance || ""}
                onChange={(e) => setAccountToEdit(accountToEdit ? { ...accountToEdit, balance: Number(e.target.value) } : null)}
                placeholder="0,00"
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false)
                setAccountToEdit(null)
              }}
              className="border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
            >
              Cancelar
            </Button>
            <Button onClick={handleEditAccount} className="cement-button text-white border-0">
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
