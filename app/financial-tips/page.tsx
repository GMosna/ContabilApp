"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, CheckCircle, PiggyBank, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FinancialTipsPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true"

    // Se não estiver logado, redirecionar para a página de login
    if (!isLoggedIn) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex min-h-screen flex-col cement-gradient">
      <header className="border-b border-zinc-700">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/dolar.png" alt="CashFlow Logo" width={40} height={40} className="rounded-md" />
            <span className="text-xl font-bold text-zinc-100">CashFlow</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
              Ir para Dashboard
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 py-12 md:py-16">
        <div className="container mx-auto max-w-5xl px-4 md:px-6">
          <div className="mb-16 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-zinc-100 mb-3">
              Bem-vindo ao CashFlow!
            </h1>
            <div className="w-24 h-1 bg-zinc-600 mx-auto mb-6"></div>
            <p className="mt-4 text-xl text-zinc-300 max-w-2xl mx-auto">
              Estamos felizes em ter você conosco nessa jornada para uma vida financeira mais organizada
            </p>
          </div>

          <div className="mb-16">
            <Card className="cement-card border-zinc-700 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="grid gap-0 md:grid-cols-[1fr_300px]">
                  <div className="p-8">
                    <h2 className="text-2xl font-bold mb-6 text-zinc-100">Por que organizar suas finanças?</h2>
                    <p className="mb-4 text-zinc-300 leading-relaxed">
                      A organização financeira não é apenas sobre controlar gastos – é sobre criar liberdade e
                      tranquilidade para sua vida. Quando você tem clareza sobre sua situação financeira, toma decisões
                      melhores, reduz o estresse e abre caminho para realizar seus sonhos.
                    </p>
                    <p className="text-zinc-300 leading-relaxed">
                      Estudos mostram que pessoas com hábitos financeiros organizados têm 78% mais chances de atingir
                      suas metas de longo prazo e relatam níveis significativamente menores de ansiedade relacionada a
                      dinheiro.
                    </p>
                  </div>
                  <div className="bg-zinc-800/50 flex items-center justify-center h-full w-full">
                    <Image
                      src="/img/controle2.webp"
                      width={400}
                      height={400}
                      alt="Ilustração de organização financeira"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-16">
            <Card className="cement-card border-zinc-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
              <CardHeader className="pb-2">
                <Wallet className="h-8 w-8 text-zinc-300 mb-2" />
                <CardTitle className="text-zinc-100">Consciência Financeira</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 leading-relaxed">
                  O primeiro passo para uma vida financeira saudável é a consciência. Saber exatamente quanto você
                  ganha, quanto gasta e em quê está gastando é fundamental para tomar o controle.
                </p>
                <p className="mt-4 text-zinc-400 leading-relaxed">
                  Com o CashFlow, você terá uma visão clara e intuitiva de todos os seus movimentos financeiros.
                </p>
              </CardContent>
            </Card>
            <Card className="cement-card border-zinc-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
              <CardHeader className="pb-2">
                <PiggyBank className="h-8 w-8 text-zinc-300 mb-2" />
                <CardTitle className="text-zinc-100">Planejamento Eficiente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 leading-relaxed">
                  Um bom planejamento financeiro não significa abrir mão do que você gosta, mas sim gastar de forma
                  inteligente e alinhada com seus valores e objetivos de vida.
                </p>
                <p className="mt-4 text-zinc-400 leading-relaxed">
                  Nossa plataforma oferece ferramentas para criar orçamentos realistas e adaptados ao seu estilo de
                  vida.
                </p>
              </CardContent>
            </Card>
            <Card className="cement-card border-zinc-700 shadow-lg transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px]">
              <CardHeader className="pb-2">
                <BarChart3 className="h-8 w-8 text-zinc-300 mb-2" />
                <CardTitle className="text-zinc-100">Crescimento Contínuo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-400 leading-relaxed">
                  Organizar suas finanças não é apenas sobre o presente, mas também sobre construir um futuro mais
                  próspero através de economias estratégicas e investimentos inteligentes.
                </p>
                <p className="mt-4 text-zinc-400 leading-relaxed">
                  Com o CashFlow, você poderá acompanhar seu progresso e ver seu patrimônio crescer com o tempo.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-8 text-zinc-100 text-center">Como o CashFlow vai te ajudar</h2>

            <div className="cement-highlight p-8 rounded-xl border border-zinc-700 shadow-lg">
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h3 className="text-xl font-bold mb-6 text-zinc-100">Nossa abordagem é simples:</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">
                        Visualização clara e intuitiva de todas as suas finanças em um só lugar
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">
                        Categorização automática de despesas para identificar padrões de gastos
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">
                        Ferramentas de orçamento personalizáveis para suas necessidades específicas
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">
                        Relatórios detalhados que mostram seu progresso ao longo do tempo
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 mr-3 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-zinc-300">Dicas personalizadas baseadas no seu perfil financeiro</span>
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-zinc-700 blur-md transform translate-x-2 translate-y-2 rounded-lg"></div>
                    <Image
                      src="/img/controle3.avif"
                      width={350}
                      height={250}
                      alt="Dashboard do CashFlow"
                      className="rounded-lg relative z-10 border border-zinc-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="w-24 h-1 bg-zinc-700 mx-auto mb-8"></div>
            <p className="mb-8 text-lg font-medium text-zinc-200">Pronto para começar sua jornada financeira?</p>
            <Link href="/dashboard">
              <Button
                size="lg"
                className="cement-button text-white border-0 px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Acessar Meu Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-zinc-800 py-8">
        <div className="container mx-auto flex flex-col gap-2 sm:flex-row items-center justify-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/img/dolar.png" alt="CashFlow Logo" width={24} height={24} className="rounded-md" />
            <p className="text-xs text-zinc-500">
              &copy; {new Date().getFullYear()} CashFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
