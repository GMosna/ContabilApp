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

// Interface para as contas bancárias
interface BankAccount {
  id: string
  name: string
  cpf: string
  dateOfBirth: string
  bank: string
  balance: number
}

// Modificar a interface Transaction para incluir accountId
interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string
  accountId?: string
}

// Define TransactionType and TransactionCategory enums
enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
}

enum TransactionCategory {
  FOOD = "food",
  TRANSPORT = "transport",
  HOUSING = "housing",
  ENTERTAINMENT = "entertainment",
  OTHER = "other",
}

// Interface para movimentos bancários (saque/depósito)
interface BankMovement {
  id: string
  accountId: string
  type: "deposit" | "withdraw"
  amount: number
  movementDate: string
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
    accountId: string
    amount: string
    movementDate: string
  }>({
    accountId: "",
    amount: "",
    movementDate: new Date().toISOString().slice(0, 10),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [movementErrors, setMovementErrors] = useState<Record<string, string>>({})
  const [isDeleteAccountDialogOpen, setIsDeleteAccountDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null)

  // Estados para a seção de movimentos
  const [selectedAccountId, setSelectedAccountId] = useState<string>("")
  const [movementType, setMovementType] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().slice(0, 7))

  // Mock transactions data (replace with actual data fetching)
  // This is added to resolve the "transactions is not defined" error
  // In a real application, you would fetch this data from an API or database
  const [mockTransactions, setMockTransactions] = useState<Transaction[]>([
    {
      id: "1",
      description: "Aluguel",
      amount: 1200,
      type: TransactionType.EXPENSE,
      category: TransactionCategory.HOUSING,
      date: "2024-01-15",
      accountId: "123",
    },
    {
      id: "2",
      description: "Salário",
      amount: 5000,
      type: TransactionType.INCOME,
      category: TransactionCategory.OTHER,
      date: "2024-01-30",
      accountId: "123",
    },
  ])

  // Adicionar função para calcular o saldo de transações por conta
  const getAccountTransactionBalance = (accountId: string) => {
    return mockTransactions
      .filter((t) => t.accountId === accountId)
      .reduce((total, t) => {
        if (t.type === "income") {
          return total + t.amount
        } else {
          return total - t.amount
        }
      }, 0)
  }

  // Adicionar função para contar transações por conta
  const getAccountTransactionCount = (accountId: string) => {
    return mockTransactions.filter((t) => t.accountId === accountId).length
  }

  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    // Se não estiver logado, redirecionar para a página de login
    if (!isLoggedIn) {
      router.push("/login")
    }

    // Carregar contas do localStorage
    const storedAccounts = localStorage.getItem("bankAccounts")
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts))
    }

    // Carregar transações do localStorage
    const storedTransactions = localStorage.getItem("transactions")
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions))
    }
  }, [router])

  // Filtrar transações quando os filtros ou a conta selecionada mudar
  useEffect(() => {
    if (!selectedAccountId) {
      setFilteredTransactions([])
      return
    }

    let filtered = transactions.filter((t) => t.accountId === selectedAccountId)

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

    // Filtrar por data
    if (dateFilter) {
      filtered = filtered.filter((t) => t.date.startsWith(dateFilter))
    }

    // Ordenar por data (mais recente primeiro)
    filtered = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredTransactions(filtered)
  }, [selectedAccountId, transactions, movementType, searchTerm, dateFilter])

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

    if (!bankMovement.accountId) {
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

  const handleAddAccount = () => {
    if (!validateForm()) return

    const account: BankAccount = {
      id: Date.now().toString(),
      name: newAccount.name,
      cpf: newAccount.cpf,
      dateOfBirth: newAccount.dateOfBirth,
      bank: newAccount.bank,
      balance: Number(newAccount.balance),
    }

    const updatedAccounts = [...accounts, account]
    setAccounts(updatedAccounts)

    // Salvar no localStorage
    localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))

    setIsAddDialogOpen(false)

    // Resetar o formulário
    setNewAccount({
      name: "",
      cpf: "",
      dateOfBirth: "",
      bank: "",
      balance: "",
    })
    setErrors({})
  }

  // Função para processar depósito
  const handleDeposit = () => {
    if (!validateMovementForm()) return

    // Encontrar a conta selecionada
    const accountIndex = accounts.findIndex((account) => account.id === bankMovement.accountId)
    if (accountIndex === -1) return

    // Criar uma cópia das contas
    const updatedAccounts = [...accounts]

    // Atualizar o saldo da conta
    updatedAccounts[accountIndex] = {
      ...updatedAccounts[accountIndex],
      balance: updatedAccounts[accountIndex].balance + Number(bankMovement.amount),
    }

    // Criar uma nova transação para o depósito
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: `Depósito em ${getBankLabel(updatedAccounts[accountIndex].bank)}`,
      amount: Number(bankMovement.amount),
      type: "income",
      category: "other_income",
      date: bankMovement.movementDate,
      accountId: bankMovement.accountId,
    }

    // Atualizar o estado
    setAccounts(updatedAccounts)
    const updatedTransactions = [newTransaction, ...transactions]
    setTransactions(updatedTransactions)

    // Salvar no localStorage
    localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    // Fechar o diálogo e resetar o formulário
    setIsDepositDialogOpen(false)
    setBankMovement({
      accountId: "",
      amount: "",
      movementDate: new Date().toISOString().slice(0, 10),
    })
    setMovementErrors({})
  }

  // Função para processar saque
  const handleWithdraw = () => {
    if (!validateMovementForm()) return

    // Encontrar a conta selecionada
    const accountIndex = accounts.findIndex((account) => account.id === bankMovement.accountId)
    if (accountIndex === -1) return

    // Verificar se há saldo suficiente
    if (accounts[accountIndex].balance < Number(bankMovement.amount)) {
      setMovementErrors({
        ...movementErrors,
        amount: "Saldo insuficiente para esta operação",
      })
      return
    }

    // Criar uma cópia das contas
    const updatedAccounts = [...accounts]

    // Atualizar o saldo da conta
    updatedAccounts[accountIndex] = {
      ...updatedAccounts[accountIndex],
      balance: updatedAccounts[accountIndex].balance - Number(bankMovement.amount),
    }

    // Criar uma nova transação para o saque
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      description: `Saque em ${getBankLabel(updatedAccounts[accountIndex].bank)}`,
      amount: Number(bankMovement.amount),
      type: "expense",
      category: "other_expense",
      date: bankMovement.movementDate,
      accountId: bankMovement.accountId,
    }

    // Atualizar o estado
    setAccounts(updatedAccounts)
    const updatedTransactions = [newTransaction, ...transactions]
    setTransactions(updatedTransactions)

    // Salvar no localStorage
    localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    // Fechar o diálogo e resetar o formulário
    setIsWithdrawDialogOpen(false)
    setBankMovement({
      accountId: "",
      amount: "",
      movementDate: new Date().toISOString().slice(0, 10),
    })
    setMovementErrors({})
  }

  // Função para excluir uma conta
  const handleDeleteAccount = () => {
    if (!accountToDelete) return

    // Filtrar a conta a ser excluída
    const updatedAccounts = accounts.filter((account) => account.id !== accountToDelete)

    // Filtrar as transações associadas à conta
    const updatedTransactions = transactions.filter((transaction) => transaction.accountId !== accountToDelete)

    // Atualizar o estado
    setAccounts(updatedAccounts)
    setTransactions(updatedTransactions)

    // Salvar no localStorage
    localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    // Fechar o diálogo e limpar a conta selecionada
    setIsDeleteAccountDialogOpen(false)
    setAccountToDelete(null)

    // Se a conta excluída for a selecionada na seção de movimentos, limpar a seleção
    if (accountToDelete === selectedAccountId) {
      setSelectedAccountId("")
    }
  }

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
    const account = accounts.find((acc) => acc.id === accountId)
    return account ? account.name : "Conta desconhecida"
  }

  return (
    <div className="flex min-h-screen flex-col cement-gradient">
      <header className="border-b border-zinc-700">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo-cashflow.jpg" alt="CashFlow Logo" width={40} height={40} className="rounded-md" />
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
            <Link href="/accounts" className="flex items-center gap-2 rounded-lg bg-zinc-700 px-3 py-2 text-zinc-100">
              <CreditCard className="h-5 w-5" />
              <span>Contas</span>
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
                          value={bankMovement.accountId}
                          onValueChange={(value) => setBankMovement({ ...bankMovement, accountId: value })}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione a conta" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id} className="text-zinc-200">
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
                          value={bankMovement.accountId}
                          onValueChange={(value) => setBankMovement({ ...bankMovement, accountId: value })}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione a conta" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {accounts.map((account) => (
                              <SelectItem key={account.id} value={account.id} className="text-zinc-200">
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
              </CardContent>
            </Card>

            {/* Lista de Contas */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {accounts.length === 0 ? (
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
                            <span className="text-zinc-300">{getAccountTransactionCount(account.id)} transações</span>
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
                            onClick={() => setSelectedAccountId(account.id)}
                          >
                            <DollarSign className="mr-1 h-3 w-3" />
                            Movimentos
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Seção de Movimentos Bancários */}
            <Card className="cement-card border-zinc-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-zinc-100">Movimentos Bancários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="account-filter" className="text-zinc-300">
                        Conta
                      </Label>
                      <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          <SelectValue placeholder="Selecione uma conta" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={account.id} className="text-zinc-200">
                              {account.name} - {getBankLabel(account.bank)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="movement-type" className="text-zinc-300">
                        Tipo
                      </Label>
                      <Select value={movementType} onValueChange={setMovementType}>
                        <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                          <SelectValue placeholder="Todos os tipos" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          <SelectItem value="all" className="text-zinc-200">
                            Todos os tipos
                          </SelectItem>
                          <SelectItem value="deposit" className="text-zinc-200">
                            Depósitos
                          </SelectItem>
                          <SelectItem value="withdraw" className="text-zinc-200">
                            Saques
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-filter" className="text-zinc-300">
                        Mês
                      </Label>
                      <Input
                        id="date-filter"
                        type="month"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-zinc-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="search-movement" className="text-zinc-300">
                        Buscar
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                        <Input
                          id="search-movement"
                          placeholder="Buscar movimento..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-200 pl-8 placeholder:text-zinc-500"
                        />
                      </div>
                    </div>
                  </div>

                  {!selectedAccountId ? (
                    <div className="text-center py-8">
                      <p className="text-zinc-400">Selecione uma conta para visualizar os movimentos.</p>
                    </div>
                  ) : filteredTransactions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-zinc-400">
                        Nenhum movimento encontrado para esta conta com os filtros atuais.
                      </p>
                    </div>
                  ) : (
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
                                  Tipo <ArrowUpDown className="h-3 w-3" />
                                </div>
                              </th>
                              <th className="px-4 py-3 text-right font-medium text-zinc-300">
                                <div className="flex items-center justify-end gap-1 cursor-pointer">
                                  Valor <ArrowUpDown className="h-3 w-3" />
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredTransactions.map((transaction) => (
                              <tr
                                key={transaction.id}
                                className="border-b border-zinc-700 last:border-0 hover:bg-zinc-800/50"
                              >
                                <td className="px-4 py-3 text-zinc-300">{formatDate(transaction.date)}</td>
                                <td className="px-4 py-3 text-zinc-200 font-medium">{transaction.description}</td>
                                <td className="px-4 py-3 text-zinc-300">
                                  {transaction.type === "income" ? "Depósito" : "Saque"}
                                </td>
                                <td
                                  className={`px-4 py-3 text-right font-medium ${
                                    transaction.type === "income" ? "text-emerald-400" : "text-red-400"
                                  }`}
                                >
                                  {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                                </td>
                              </tr>
                            ))}
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
    </div>
  )
}
