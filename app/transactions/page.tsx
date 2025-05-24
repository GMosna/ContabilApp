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

import { useEffect, useState } from "react"
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

/**
 * Tipos e interfaces para os dados da aplicação
 */
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

// Interface para contas bancárias
interface BankAccount {
  id: string
  name: string
  cpf: string
  dateOfBirth: string
  bank: string
  balance: number
}

// Mapeamento de categorias para ícones e nomes amigáveis
const categoryInfo = {
  salary: { icon: DollarSign, name: "Salário" },
  investment: { icon: DollarSign, name: "Investimento" },
  other_income: { icon: DollarSign, name: "Outras Receitas" },
  food: { icon: CreditCard, name: "Alimentação" },
  transport: { icon: CreditCard, name: "Transporte" },
  housing: { icon: CreditCard, name: "Moradia" },
  utilities: { icon: CreditCard, name: "Contas" },
  entertainment: { icon: CreditCard, name: "Entretenimento" },
  health: { icon: CreditCard, name: "Saúde" },
  education: { icon: CreditCard, name: "Educação" },
  other_expense: { icon: CreditCard, name: "Outras Despesas" },
}

/**
 * Funções auxiliares para formatação e preparação de dados
 */
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
    type: "expense" as TransactionType,
    category: "food" as TransactionCategory,
    date: new Date().toISOString().slice(0, 10),
    accountId: "",
  })

  // Função para obter o nome da conta, incluindo o caso especial "Dinheiro em Espécie"
  const getAccountName = (accountId: string) => {
    if (accountId === "cash") return "Dinheiro em Espécie"

    const account = accounts.find((acc) => acc.id === accountId)
    return account ? `${account.name} - ${getBankLabel(account.bank)}` : "Conta desconhecida"
  }

  /**
   * Efeito para carregar dados do localStorage
   */
  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    // Se não estiver logado, redirecionar para a página de login
    if (!isLoggedIn) {
      router.push("/login")
    }

    // Carregar transações do localStorage
    const storedTransactions = localStorage.getItem("transactions")
    if (storedTransactions) {
      const parsedTransactions = JSON.parse(storedTransactions)
      setTransactions(parsedTransactions)
    } else {
      // Inicializar com array vazio em vez de dados de exemplo
      localStorage.setItem("transactions", JSON.stringify([]))
    }

    // Carregar contas bancárias do localStorage
    const storedAccounts = localStorage.getItem("bankAccounts")
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts))
    }
  }, [router])

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
      result = result.filter((t) => t.category === filterCategory)
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
  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.accountId) return

    const transaction: Transaction = {
      id: Date.now().toString(),
      description: newTransaction.description,
      amount: Number.parseFloat(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category,
      date: newTransaction.date,
      accountId: newTransaction.accountId,
    }

    const updatedTransactions = [transaction, ...transactions]
    setTransactions(updatedTransactions)

    // Atualizar o saldo da conta apenas se não for "Dinheiro em Espécie"
    if (newTransaction.accountId !== "cash") {
      const updatedAccounts = accounts.map((account) => {
        if (account.id === newTransaction.accountId) {
          const newBalance =
            transaction.type === "income"
              ? account.balance + Number(newTransaction.amount)
              : account.balance - Number(newTransaction.amount)

          return {
            ...account,
            balance: newBalance,
          }
        }
        return account
      })

      setAccounts(updatedAccounts)
      localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    }

    // Salvar no localStorage
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    setIsAddDialogOpen(false)

    // Resetar o formulário
    setNewTransaction({
      description: "",
      amount: "",
      type: "expense" as TransactionType,
      category: "food" as TransactionCategory,
      date: new Date().toISOString().slice(0, 10),
      accountId: "",
    })
  }

  // Editar transação existente
  const handleEditTransaction = () => {
    if (!currentTransaction || !newTransaction.description || !newTransaction.amount) return

    // Verificar se o tipo ou a conta mudou para ajustar os saldos
    const oldTransaction = transactions.find((t) => t.id === currentTransaction.id)
    const typeChanged = oldTransaction?.type !== newTransaction.type
    const accountChanged = oldTransaction?.accountId !== newTransaction.accountId
    const amountChanged = oldTransaction?.amount !== Number(newTransaction.amount)

    // Criar a transação atualizada
    const updatedTransaction: Transaction = {
      ...currentTransaction,
      description: newTransaction.description,
      amount: Number(newTransaction.amount),
      type: newTransaction.type,
      category: newTransaction.category,
      date: newTransaction.date,
      accountId: newTransaction.accountId,
    }

    // Atualizar a lista de transações
    const updatedTransactions = transactions.map((t) => (t.id === currentTransaction.id ? updatedTransaction : t))
    setTransactions(updatedTransactions)

    // Atualizar os saldos das contas se necessário
    if (typeChanged || accountChanged || amountChanged) {
      let updatedAccounts = [...accounts]

      // Se a conta mudou, precisamos atualizar ambas as contas
      if (accountChanged && oldTransaction) {
        // Reverter a transação antiga na conta antiga (apenas se não for "Dinheiro em Espécie")
        if (oldTransaction.accountId !== "cash") {
          updatedAccounts = updatedAccounts.map((account) => {
            if (account.id === oldTransaction.accountId) {
              const adjustedBalance =
                oldTransaction.type === "income"
                  ? account.balance - oldTransaction.amount
                  : account.balance + oldTransaction.amount

              return {
                ...account,
                balance: adjustedBalance,
              }
            }
            return account
          })
        }

        // Aplicar a nova transação na nova conta (apenas se não for "Dinheiro em Espécie")
        if (newTransaction.accountId !== "cash") {
          updatedAccounts = updatedAccounts.map((account) => {
            if (account.id === newTransaction.accountId) {
              const adjustedBalance =
                newTransaction.type === "income"
                  ? account.balance + Number(newTransaction.amount)
                  : account.balance - Number(newTransaction.amount)

              return {
                ...account,
                balance: adjustedBalance,
              }
            }
            return account
          })
        }
      } else if (oldTransaction && oldTransaction.accountId !== "cash") {
        // Se apenas o tipo ou valor mudou, mas a conta é a mesma e não é "Dinheiro em Espécie"
        updatedAccounts = updatedAccounts.map((account) => {
          if (account.id === oldTransaction.accountId) {
            // Reverter a transação antiga
            let adjustedBalance =
              oldTransaction.type === "income"
                ? account.balance - oldTransaction.amount
                : account.balance + oldTransaction.amount

            // Aplicar a nova transação
            adjustedBalance =
              newTransaction.type === "income"
                ? adjustedBalance + Number(newTransaction.amount)
                : adjustedBalance - Number(newTransaction.amount)

            return {
              ...account,
              balance: adjustedBalance,
            }
          }
          return account
        })
      }

      setAccounts(updatedAccounts)
      localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    }

    // Salvar no localStorage
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    setIsEditDialogOpen(false)
    setCurrentTransaction(null)
  }

  // Excluir transação
  const handleDeleteTransaction = () => {
    if (!currentTransaction) return

    // Atualizar o saldo da conta apenas se não for "Dinheiro em Espécie"
    if (currentTransaction.accountId !== "cash") {
      const updatedAccounts = accounts.map((account) => {
        if (account.id === currentTransaction.accountId) {
          const adjustedBalance =
            currentTransaction.type === "income"
              ? account.balance - currentTransaction.amount
              : account.balance + currentTransaction.amount

          return {
            ...account,
            balance: adjustedBalance,
          }
        }
        return account
      })

      setAccounts(updatedAccounts)
      localStorage.setItem("bankAccounts", JSON.stringify(updatedAccounts))
    }

    // Remover a transação da lista
    const updatedTransactions = transactions.filter((t) => t.id !== currentTransaction.id)
    setTransactions(updatedTransactions)

    // Salvar no localStorage
    localStorage.setItem("transactions", JSON.stringify(updatedTransactions))

    setIsDeleteDialogOpen(false)
    setCurrentTransaction(null)
  }

  // Excluir todas as transações
  const handleDeleteAllTransactions = () => {
    // Restaurar os saldos originais das contas (assumindo que o saldo atual inclui todas as transações)
    const restoredAccounts = accounts.map((account) => {
      // Calcular o saldo ajustado removendo o efeito de todas as transações
      const accountTransactions = transactions.filter((t) => t.accountId === account.id)
      let adjustedBalance = account.balance

      accountTransactions.forEach((transaction) => {
        if (transaction.type === "income") {
          adjustedBalance -= transaction.amount
        } else {
          adjustedBalance += transaction.amount
        }
      })

      return {
        ...account,
        balance: adjustedBalance,
      }
    })

    // Limpar todas as transações
    setTransactions([])
    setAccounts(restoredAccounts)

    // Salvar no localStorage
    localStorage.setItem("transactions", JSON.stringify([]))
    localStorage.setItem("bankAccounts", JSON.stringify(restoredAccounts))

    setIsDeleteAllDialogOpen(false)
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
      category: transaction.category,
      date: transaction.date,
      accountId: transaction.accountId,
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

  return (
    <div className="flex min-h-screen flex-col cement-gradient">
      {/* Cabeçalho da página */}
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
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
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
                            value={newTransaction.type}
                            onValueChange={(value) =>
                              setNewTransaction({ ...newTransaction, type: value as TransactionType })
                            }
                          >
                            <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-zinc-700">
                              <SelectItem value="income" className="text-zinc-200">
                                Receita
                              </SelectItem>
                              <SelectItem value="expense" className="text-zinc-200">
                                Despesa
                              </SelectItem>
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
                            setNewTransaction({ ...newTransaction, category: value as TransactionCategory })
                          }
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700">
                            {newTransaction.type === "income" ? (
                              // Categorias de receita
                              <>
                                <SelectItem value="salary" className="text-zinc-200">
                                  Salário
                                </SelectItem>
                                <SelectItem value="investment" className="text-zinc-200">
                                  Investimento
                                </SelectItem>
                                <SelectItem value="other_income" className="text-zinc-200">
                                  Outras Receitas
                                </SelectItem>
                              </>
                            ) : (
                              // Categorias de despesa
                              <>
                                <SelectItem value="food" className="text-zinc-200">
                                  Alimentação
                                </SelectItem>
                                <SelectItem value="transport" className="text-zinc-200">
                                  Transporte
                                </SelectItem>
                                <SelectItem value="housing" className="text-zinc-200">
                                  Moradia
                                </SelectItem>
                                <SelectItem value="utilities" className="text-zinc-200">
                                  Contas
                                </SelectItem>
                                <SelectItem value="entertainment" className="text-zinc-200">
                                  Entretenimento
                                </SelectItem>
                                <SelectItem value="health" className="text-zinc-200">
                                  Saúde
                                </SelectItem>
                                <SelectItem value="education" className="text-zinc-200">
                                  Educação
                                </SelectItem>
                                <SelectItem value="other_expense" className="text-zinc-200">
                                  Outras Despesas
                                </SelectItem>
                              </>
                            )}
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
                        {/* Categorias de receita */}
                        <SelectItem value="salary" className="text-zinc-200">
                          Salário
                        </SelectItem>
                        <SelectItem value="investment" className="text-zinc-200">
                          Investimento
                        </SelectItem>
                        <SelectItem value="other_income" className="text-zinc-200">
                          Outras Receitas
                        </SelectItem>
                        {/* Categorias de despesa */}
                        <SelectItem value="food" className="text-zinc-200">
                          Alimentação
                        </SelectItem>
                        <SelectItem value="transport" className="text-zinc-200">
                          Transporte
                        </SelectItem>
                        <SelectItem value="housing" className="text-zinc-200">
                          Moradia
                        </SelectItem>
                        <SelectItem value="utilities" className="text-zinc-200">
                          Contas
                        </SelectItem>
                        <SelectItem value="entertainment" className="text-zinc-200">
                          Entretenimento
                        </SelectItem>
                        <SelectItem value="health" className="text-zinc-200">
                          Saúde
                        </SelectItem>
                        <SelectItem value="education" className="text-zinc-200">
                          Educação
                        </SelectItem>
                        <SelectItem value="other_expense" className="text-zinc-200">
                          Outras Despesas
                        </SelectItem>
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
                              const CategoryIcon = categoryInfo[transaction.category].icon
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
                                      <span className="text-zinc-300">{categoryInfo[transaction.category].name}</span>
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
                  value={newTransaction.type}
                  onValueChange={(value) => setNewTransaction({ ...newTransaction, type: value as TransactionType })}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="income" className="text-zinc-200">
                      Receita
                    </SelectItem>
                    <SelectItem value="expense" className="text-zinc-200">
                      Despesa
                    </SelectItem>
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
                  setNewTransaction({ ...newTransaction, category: value as TransactionCategory })
                }
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-200">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {newTransaction.type === "income" ? (
                    <>
                      <SelectItem value="salary" className="text-zinc-200">
                        Salário
                      </SelectItem>
                      <SelectItem value="investment" className="text-zinc-200">
                        Investimento
                      </SelectItem>
                      <SelectItem value="other_income" className="text-zinc-200">
                        Outras Receitas
                      </SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="food" className="text-zinc-200">
                        Alimentação
                      </SelectItem>
                      <SelectItem value="transport" className="text-zinc-200">
                        Transporte
                      </SelectItem>
                      <SelectItem value="housing" className="text-zinc-200">
                        Moradia
                      </SelectItem>
                      <SelectItem value="utilities" className="text-zinc-200">
                        Contas
                      </SelectItem>
                      <SelectItem value="entertainment" className="text-zinc-200">
                        Entretenimento
                      </SelectItem>
                      <SelectItem value="health" className="text-zinc-200">
                        Saúde
                      </SelectItem>
                      <SelectItem value="education" className="text-zinc-200">
                        Educação
                      </SelectItem>
                      <SelectItem value="other_expense" className="text-zinc-200">
                        Outras Despesas
                      </SelectItem>
                    </>
                  )}
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
