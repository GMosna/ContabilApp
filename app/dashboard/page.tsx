/**
 * Dashboard / Visão Geral
 *
 * Esta página mostra um resumo das finanças do usuário, incluindo:
 * - Saldo total, receitas e despesas
 * - Lista de contas bancárias
 * - Resumo de transações por categoria
 * - Transações recentes
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CreditCard, DollarSign, Home, LogOut, Plus, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AuthService from "@/services/authService"
import { toast } from "@/components/ui/use-toast"

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

/**
 * Componente principal do Dashboard
 * Gerencia o estado e exibe os dados financeiros do usuário
 */
export default function DashboardPage() {
  // Estados para armazenar dados e cálculos
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalExpense, setTotalExpense] = useState(0)
  const [balance, setBalance] = useState(0)

  /**
   * Efeito para carregar dados do backend
   * Verifica se o usuário está logado e carrega transações e contas
   */
  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    // Se não estiver logado, redirecionar para a página de login
    if (!isLoggedIn) {
      router.push("/login")
      return;
    }

    // Buscar contas do backend
    const fetchAccounts = async () => {
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
    };

    // Buscar transações do backend
    const fetchTransactions = async () => {
      try {
        const response = await AuthService.authenticatedRequest('/transactions', {
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error('Erro ao buscar transações');
        }

        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas transações.",
          variant: "destructive",
        });
      }
    };

    fetchAccounts();
    fetchTransactions();
  }, [router])

  /**
   * Efeito para calcular totais quando os dados mudam
   * Calcula receitas, despesas e saldo total
   */
  useEffect(() => {
    // Calcular totais de receitas e despesas apenas para transações vinculadas a contas existentes
    const accountIds = accounts.map((account) => account.id)
    const validTransactions = transactions.filter((transaction) => accountIds.includes(transaction.accountId))

    let income = 0
    let expense = 0

    // Criar um mapa para armazenar o saldo atualizado de cada conta
    const accountBalances = new Map<string, number>()
    
    // Inicializar o mapa com os saldos atuais das contas
    accounts.forEach(account => {
      accountBalances.set(account.id, account.balance)
    })

    // Processar cada transação e atualizar os saldos
    validTransactions.forEach((transaction) => {
      const currentBalance = accountBalances.get(transaction.accountId) || 0
      
      if (transaction.type === "income") {
        income += transaction.amount
        accountBalances.set(transaction.accountId, currentBalance + transaction.amount)
      } else {
        expense += transaction.amount
        accountBalances.set(transaction.accountId, currentBalance - transaction.amount)
      }
    })

    setTotalIncome(income)
    setTotalExpense(expense)

    // Calcular o saldo total considerando as transações
    const totalBalance = Array.from(accountBalances.values()).reduce((total, balance) => total + balance, 0)
    setBalance(totalBalance)
  }, [transactions, accounts])

  /**
   * Funções auxiliares para formatação e navegação
   */
  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  // Função para formatar valores monetários
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

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

  // Função para navegar para a página de transações
  const handleAddTransaction = () => {
    router.push("/transactions")
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
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg bg-zinc-700 px-3 py-2 text-zinc-100">
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
          </nav>
        </aside>

        {/* Conteúdo principal */}
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-4 md:gap-8 max-w-7xl mx-auto">
            {/* Cabeçalho da seção principal */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-zinc-100">Visão Geral</h1>
              <Button size="sm" className="cement-button text-white border-0 shadow-md" onClick={handleAddTransaction}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </div>

            {/* Cards de resumo financeiro (Saldo, Receitas, Despesas) */}
            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Saldo Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-zinc-100">{formatCurrency(balance)}</div>
                  <p className="text-xs text-zinc-400">Saldo total em todas as suas contas</p>
                </CardContent>
              </Card>
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</div>
                  <p className="text-xs text-zinc-400">Total de todas as receitas</p>
                </CardContent>
              </Card>
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">{formatCurrency(totalExpense)}</div>
                  <p className="text-xs text-zinc-400">Total de todas as despesas</p>
                </CardContent>
              </Card>
            </div>

            {/* Resumo de contas bancárias */}
            <Card className="cement-card border-zinc-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-zinc-100">Resumo de Contas</CardTitle>
                <CardDescription className="text-zinc-400">Visão geral das suas contas bancárias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {accounts.length === 0 ? (
                    // Mensagem quando não há contas cadastradas
                    <div className="text-center py-4">
                      <p className="text-zinc-400">Nenhuma conta bancária cadastrada.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="mt-2 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
                      >
                        <Link href="/accounts">Adicionar Conta</Link>
                      </Button>
                    </div>
                  ) : (
                    // Grid de contas bancárias
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {accounts.map((account) => (
                        <div
                          key={account.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-zinc-800/50 border border-zinc-700"
                        >
                          <div className="flex flex-col">
                            <span className="text-zinc-300 font-medium">{account.name}</span>
                            <span className="text-zinc-400 text-sm">{getBankLabel(account.bank)}</span>
                          </div>
                          <span className="text-zinc-100 font-bold">{formatCurrency(account.balance)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Resumo de transações por categoria */}
            <Card className="cement-card border-zinc-700 shadow-lg">
              <CardHeader>
                <CardTitle className="text-zinc-100">Resumo de Transações</CardTitle>
                <CardDescription className="text-zinc-400">
                  Visão geral das suas receitas e despesas por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Receitas por categoria */}
                  <div>
                    <h3 className="text-lg font-medium text-zinc-200 mb-3">Receitas por Categoria</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        // Agrupar transações de receita por categoria
                        transactions
                          .filter((t) => t.type === "income")
                          .reduce(
                            (acc, transaction) => {
                              const category = transaction.category
                              if (!acc[category]) {
                                acc[category] = 0
                              }
                              acc[category] += transaction.amount
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                      )
                        // Ordenar por valor (maior para menor)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount], index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                              <span className="text-zinc-300">
                                {category === "salary"
                                  ? "Salário"
                                  : category === "investment"
                                    ? "Investimentos"
                                    : "Outras Receitas"}
                              </span>
                            </div>
                            <span className="font-medium text-emerald-400">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Despesas por categoria */}
                  <div>
                    <h3 className="text-lg font-medium text-zinc-200 mb-3">Despesas por Categoria</h3>
                    <div className="space-y-2">
                      {Object.entries(
                        // Agrupar transações de despesa por categoria
                        transactions
                          .filter((t) => t.type === "expense")
                          .reduce(
                            (acc, transaction) => {
                              const category = transaction.category
                              if (!acc[category]) {
                                acc[category] = 0
                              }
                              acc[category] += transaction.amount
                              return acc
                            },
                            {} as Record<string, number>,
                          ),
                      )
                        // Ordenar por valor (maior para menor)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount], index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-400"></div>
                              <span className="text-zinc-300">
                                {/* Mapear códigos de categoria para nomes amigáveis */}
                                {category === "food"
                                  ? "Alimentação"
                                  : category === "transport"
                                    ? "Transporte"
                                    : category === "housing"
                                      ? "Moradia"
                                      : category === "utilities"
                                        ? "Contas"
                                        : category === "entertainment"
                                          ? "Entretenimento"
                                          : category === "health"
                                            ? "Saúde"
                                            : category === "education"
                                              ? "Educação"
                                              : "Outras Despesas"}
                              </span>
                            </div>
                            <span className="font-medium text-red-400">{formatCurrency(amount)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de transações recentes */}
            <Card className="max-w-full cement-card border-zinc-700 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-zinc-100">Transações Recentes</CardTitle>
                  <CardDescription className="text-zinc-400">Suas últimas 5 transações</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="border-zinc-700 text-zinc-300">
                  <Link href="/transactions">Ver Todas</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Mostrar as 5 transações mais recentes */}
                  {transactions.slice(0, 5).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between border-b border-zinc-700 pb-4 last:border-0"
                    >
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-zinc-800 p-2">
                          {transaction.type === "income" ? (
                            <DollarSign className="h-4 w-4 text-zinc-300" />
                          ) : (
                            <CreditCard className="h-4 w-4 text-zinc-300" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-200">{transaction.description}</p>
                          <p className="text-sm text-zinc-400">
                            {new Date(transaction.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-medium ${transaction.type === "income" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {transaction.type === "income" ? "+" : "-"} {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
