"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BarChart3, LogOut, PiggyBank, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está logado ao carregar a página
    const loggedIn = localStorage.getItem("isLoggedIn") === "true"
    setIsLoggedIn(loggedIn)
    if (loggedIn) {
      router.push("/accounts")
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    setIsLoggedIn(false)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/img/dolar.png" alt="CashFlow Logo" width={30} height={30} className="rounded-md" />
            <span className="text-xl font-bold">CashFlow</span>
          </Link>
          <nav className="flex gap-4 sm:gap-6">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium bg-black text-white px-4 py-2 rounded-md shadow-sm"
                >
                  Gestão Financeira
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-sm font-medium flex items-center gap-1 shadow-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link href="/signup" className="text-sm font-medium px-4 py-2 rounded-md shadow-sm">
                  Cadastro
                </Link>
                <Link href="/login" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-md shadow-sm">
                  Login
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Organize suas finanças com facilidade
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Controle seus gastos, economize mais e alcance seus objetivos financeiros com nossa plataforma
                    intuitiva.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {isLoggedIn ? (
                    <Link href="/dashboard">
                      <Button className="w-full shadow-sm">
                        Acessar Meu Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signup">
                      <Button className="w-full shadow-sm">
                        Comece Agora
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Link href="#como-funciona">
                    <Button variant="outline" className="w-full shadow-sm">
                      Saiba Mais
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src="/img/grafico2.jpg"
                width={550}
                height={550}
                alt="Dashboard da aplicação CashFlow"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        {/* Resto do conteúdo permanece o mesmo */}
        <section id="como-funciona" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Como Funciona</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nossa plataforma simplifica o gerenciamento financeiro pessoal com ferramentas poderosas e fáceis de
                  usar.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <Image
                src="/img/grafico1.jpg"
                width={400}
                height={400}
                alt="Demonstração do aplicativo"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full"
              />
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Acompanhamento em Tempo Real</h3>
                      <p className="text-muted-foreground">
                        Visualize seus gastos e receitas em tempo real com gráficos intuitivos.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <PiggyBank className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Metas de Economia</h3>
                      <p className="text-muted-foreground">
                        Defina metas de economia e acompanhe seu progresso facilmente.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Segurança Total</h3>
                      <p className="text-muted-foreground">
                        Seus dados financeiros são protegidos com a mais alta tecnologia de segurança.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Sobre Nossa Empresa</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  A CashFlow nasceu com a missão de tornar o gerenciamento financeiro acessível a todos.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    width={64}
                    height={64}
                    alt="Ícone de missão"
                    className="h-8 w-8"
                  />
                </div>
                <h3 className="text-xl font-bold">Nossa Missão</h3>
                <p className="text-center text-muted-foreground">
                  Capacitar pessoas a tomarem controle de suas finanças e alcançarem independência financeira.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    width={64}
                    height={64}
                    alt="Ícone de visão"
                    className="h-8 w-8"
                  />
                </div>
                <h3 className="text-xl font-bold">Nossa Visão</h3>
                <p className="text-center text-muted-foreground">
                  Ser a plataforma de finanças pessoais mais confiável e utilizada no Brasil.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Image
                    src="/placeholder.svg?height=64&width=64"
                    width={64}
                    height={64}
                    alt="Ícone de valores"
                    className="h-8 w-8"
                  />
                </div>
                <h3 className="text-xl font-bold">Nossos Valores</h3>
                <p className="text-center text-muted-foreground">
                  Transparência, simplicidade, segurança e foco no cliente guiam todas as nossas decisões.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nossa Equipe</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Conheça os fundadores que estão transformando a maneira como as pessoas gerenciam suas finanças.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4">
                <div className="h-40 w-40 overflow-hidden rounded-full">
                  <Image
                    src="/img/mosna.jpeg"
                    width={160}
                    height={160}
                    alt="Foto do Fundador 1"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Guilherme Henrique Ferreira Mosna</h3>
                  <p className="text-sm text-muted-foreground">CEO & Co-Fundador</p>
                  <p className="mt-2 text-muted-foreground">
                    Especialista em finanças com mais de 10 anos de experiência no mercado financeiro. Apaixonado por
                    ajudar pessoas a conquistarem independência financeira.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="h-40 w-40 overflow-hidden rounded-full">
                  <Image
                    src="/img/morito.jpeg"
                    width={160}
                    height={160}
                    alt="Foto do Fundador 2"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">João Vitor Morito da Silva</h3>
                  <p className="text-sm text-muted-foreground">CEO & Co-Fundador</p>
                  <p className="mt-2 text-muted-foreground">
                    Desenvolvedor e arquiteto de software com experiência em startups de tecnologia financeira. Focado
                    em criar soluções intuitivas e seguras.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="h-40 w-40 overflow-hidden rounded-full">
                  <Image
                    src="/img/vitao.jpg"
                    width={160}
                    height={160}
                    alt="Foto do Fundador 3"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold">Victor Carlos Costa</h3>
                  <p className="text-sm text-muted-foreground">COO & Co-Fundador</p>
                  <p className="mt-2 text-muted-foreground">
                    Especialista em experiência do usuário e estratégias de negócios. Dedicado a tornar o gerenciamento
                    financeiro acessível para todos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container mx-auto max-w-5xl grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Pronto para organizar suas finanças?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Junte-se a milhares de usuários que já transformaram sua vida financeira com a CashFlow.
              </p>
            </div>
            <div className="mx-auto flex flex-col gap-2 min-[400px]:flex-row">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button className="w-full shadow-sm">Acessar Meu Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button className="w-full shadow-sm">Criar Conta Grátis</Button>
                  </Link>
                  <Link href="/login">
                    <Button className="w-full shadow-sm bg-black hover:bg-black/90 text-white">Fazer Login</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t">
        <div className="container mx-auto flex flex-col gap-2 sm:flex-row py-6 w-full items-center justify-center px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/img/dolar.png" alt="CashFlow Logo" width={24} height={24} className="rounded-md" />
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} CashFlow. Todos os direitos reservados.
            </p>
          </div>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="#" className="text-xs">
              Termos de Serviço
            </Link>
            <Link href="#" className="text-xs">
              Privacidade
            </Link>
            <Link href="#" className="text-xs">
              Contato
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
