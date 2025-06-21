"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { CreditCard, DollarSign, Home, LogOut, Wallet, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartLegendContent, ChartTooltipContent } from "@/components/ui/chart"
import AuthService from "@/services/authService"
import { toast } from "@/components/ui/use-toast"
import {
  BarChart as ReBarChart,
  XAxis,
  YAxis,
  Bar,
  CartesianGrid,
  Tooltip as ReTooltip,
  Legend as ReLegend,
  PieChart as RePieChart,
  Pie,
  Cell
} from "recharts"

// Types
interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  date: string
  accountId: string
}

interface BankAccount {
  id: string
  name: string
  cpf: string
  dateOfBirth: string
  bank: string
  balance: number
}

export default function ChartsDashboardPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<BankAccount[]>([])

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"
    if (!isLoggedIn) {
      router.push("/login")
      return
    }
    // Fetch accounts
    const fetchAccounts = async () => {
      try {
        const response = await AuthService.authenticatedRequest('/account', { method: 'GET' });
        if (!response.ok) throw new Error('Erro ao buscar contas bancárias');
        const data = await response.json();
        setAccounts(data);
      } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar suas contas bancárias.", variant: "destructive" });
      }
    };
    // Fetch transactions
    const fetchTransactions = async () => {
      try {
        const response = await AuthService.authenticatedRequest('/transactions', { method: 'GET' });
        if (!response.ok) throw new Error('Erro ao buscar transações');
        const data = await response.json();
        setTransactions(data);
      } catch (error) {
        toast({ title: "Erro", description: "Não foi possível carregar suas transações.", variant: "destructive" });
      }
    };
    fetchAccounts();
    fetchTransactions();
  }, [router])

  // Chart data preparation
  const incomeByMonth: { [month: string]: number } = {}
  const expenseByMonth: { [month: string]: number } = {}
  transactions.forEach((t) => {
    const month = new Date(t.date).toLocaleString('pt-BR', { month: 'short', year: '2-digit' })
    if (t.type === 'income') incomeByMonth[month] = (incomeByMonth[month] || 0) + t.amount
    if (t.type === 'expense') expenseByMonth[month] = (expenseByMonth[month] || 0) + t.amount
  })
  const months = Array.from(new Set([...Object.keys(incomeByMonth), ...Object.keys(expenseByMonth)])).sort()
  const barChartData = months.map(month => ({
    month,
    Receitas: incomeByMonth[month] || 0,
    Despesas: expenseByMonth[month] || 0
  }))

  // Pie chart data (despesas por categoria)
  const expenseByCategory: { [cat: string]: number } = {}
  transactions.filter(t => t.type === 'expense').forEach(t => {
    expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount
  })
  const pieChartData = Object.entries(expenseByCategory).map(([cat, value]) => ({ name: cat, value }))

  // Pie chart data (receitas por categoria)
  const incomeByCategory: { [cat: string]: number } = {}
  transactions.filter(t => t.type === 'income').forEach(t => {
    incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + t.amount
  })
  const pieIncomeData = Object.entries(incomeByCategory).map(([cat, value]) => ({ name: cat, value }))

  // Helper
  const formatCurrency = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  // Sidebar navigation (copied from dashboard)
  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    router.push("/")
  }

  // Cálculos de resumo
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0)

  // Mês atual
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const isCurrentMonth = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  }
  const totalIncomeCurrentMonth = transactions.filter(t => t.type === 'income' && isCurrentMonth(t.date)).reduce((acc, t) => acc + t.amount, 0)
  const totalExpenseCurrentMonth = transactions.filter(t => t.type === 'expense' && isCurrentMonth(t.date)).reduce((acc, t) => acc + t.amount, 0)

  // Últimos lançamentos
  const lastIncome = transactions.filter(t => t.type === 'income').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
  const lastExpense = transactions.filter(t => t.type === 'expense').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  return (
    <div className="flex min-h-screen flex-col cement-gradient">
      {/* Header */}
      <header className="border-b border-zinc-700">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/dolar.png" alt="CashFlow Logo" width={40} height={40} className="rounded-md" />
            <span className="text-xl font-bold text-zinc-100">CashFlow</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6 items-center">
            <Link href="/financial-tips" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Dicas Financeiras</Link>
            <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Visão Geral</Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-sm font-medium flex items-center gap-1 text-zinc-300 hover:text-white hover:bg-zinc-700">
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </nav>
        </div>
      </header>
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-64 flex-col border-r border-zinc-700 md:flex">
          <div className="flex h-14 items-center border-b border-zinc-700 px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-zinc-100">
              <Wallet className="h-5 w-5" /> <span>Gestão Financeira</span>
            </Link>
          </div>
          <nav className="grid gap-1 p-2">
            <Link href="/dashboard" className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"><Home className="h-5 w-5" /><span>Visão Geral</span></Link>
            <Link href="/transactions" className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"><DollarSign className="h-5 w-5" /><span>Transações</span></Link>
            <Link href="/accounts" className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-white"><CreditCard className="h-5 w-5" /><span>Contas</span></Link>
            <Link href="/dashboard/charts" className="flex items-center gap-2 rounded-lg px-3 py-2 text-zinc-100 bg-zinc-800"><BarChart3 className="h-5 w-5" /><span>Dashboard</span></Link>
          </nav>
        </aside>
        {/* Main content */}
        <main className="flex-1 p-4 md:p-6">
          <div className="grid gap-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-zinc-100 mb-4">Dashboard de Gráficos</h1>
            {/* Cards de resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Total de Receitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-emerald-400">{formatCurrency(totalIncome)}</div>
                  <p className="text-xs text-zinc-400">Todas as receitas cadastradas</p>
                </CardContent>
              </Card>
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Total de Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-red-400">{formatCurrency(totalExpense)}</div>
                  <p className="text-xs text-zinc-400">Todas as despesas cadastradas</p>
                </CardContent>
              </Card>
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Saldo Atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-zinc-100">{formatCurrency(totalIncome - totalExpense)}</div>
                  <p className="text-xs text-zinc-400">Receitas - Despesas</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Receitas no mês atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-emerald-400">{formatCurrency(totalIncomeCurrentMonth)}</div>
                  <p className="text-xs text-zinc-400">{now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </CardContent>
              </Card>
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Despesas no mês atual</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-bold text-red-400">{formatCurrency(totalExpenseCurrentMonth)}</div>
                  <p className="text-xs text-zinc-400">{now.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </CardContent>
              </Card>
              <Card className="cement-card border-zinc-700 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-300">Últimos lançamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-zinc-400 mb-1">Última Receita:</div>
                  <div className="text-sm text-emerald-400 font-bold mb-2">{lastIncome ? `${formatCurrency(lastIncome.amount)} em ${new Date(lastIncome.date).toLocaleDateString('pt-BR')}` : '---'}</div>
                  <div className="text-xs text-zinc-400 mb-1">Último Saque/Despesa:</div>
                  <div className="text-sm text-red-400 font-bold">{lastExpense ? `${formatCurrency(lastExpense.amount)} em ${new Date(lastExpense.date).toLocaleDateString('pt-BR')}` : '---'}</div>
                </CardContent>
              </Card>
            </div>
            {/* Bar Chart: Receitas e Despesas por Mês */}
            <Card className="cement-card border-zinc-700 shadow-lg max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="text-zinc-100">Receitas e Despesas por Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{ Receitas: { color: '#10b981', label: 'Receitas' }, Despesas: { color: '#ef4444', label: 'Despesas' } }}>
                  <ReBarChart data={barChartData} width={500} height={300}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ReTooltip content={<ChartTooltipContent />} />
                    <ReLegend content={<ChartLegendContent />} />
                    <Bar dataKey="Receitas" fill="#10b981" />
                    <Bar dataKey="Despesas" fill="#ef4444" />
                  </ReBarChart>
                </ChartContainer>
              </CardContent>
            </Card>
            {/* Pie Chart: Despesas por Categoria */}
            <Card className="cement-card border-zinc-700 shadow-lg max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="text-zinc-100">Despesas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <RePieChart width={400} height={300}>
                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={["#ef4444", "#f59e42", "#fbbf24", "#10b981", "#3b82f6", "#6366f1", "#a21caf"][index % 7]} />
                      ))}
                    </Pie>
                    <ReTooltip content={<ChartTooltipContent />} />
                    <ReLegend content={<ChartLegendContent />} />
                  </RePieChart>
                </ChartContainer>
              </CardContent>
            </Card>
            {/* Pie Chart: Receitas por Categoria */}
            <Card className="cement-card border-zinc-700 shadow-lg max-w-xl mx-auto">
              <CardHeader>
                <CardTitle className="text-zinc-100">Receitas por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={{}}>
                  <RePieChart width={400} height={300}>
                    <Pie data={pieIncomeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {pieIncomeData.map((entry, index) => (
                        <Cell key={`cell-income-${index}`} fill={["#10b981", "#3b82f6", "#6366f1", "#a21caf", "#f59e42", "#fbbf24", "#ef4444"][index % 7]} />
                      ))}
                    </Pie>
                    <ReTooltip content={<ChartTooltipContent />} />
                    <ReLegend content={<ChartLegendContent />} />
                  </RePieChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
} 