"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast, dismiss } from "@/components/ui/use-toast"
import api from "@/services/api"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const toastIdRef = useRef<string | null>(null)

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      router.push("/dashboard")
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password
      });

      // Se o login foi bem sucedido, armazena o token
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        // Salva userData corretamente, mesmo que o backend não retorne o objeto user
        if (response.data.user) {
          localStorage.setItem('userData', JSON.stringify(response.data.user));
        } else {
          // Garante que userData seja salvo com nome e email
          localStorage.setItem('userData', JSON.stringify({
            id: response.data.id || "",
            name: response.data.name || "",
            email: formData.email
          }));
        }
        const { id } = toast({
          title: "Login realizado com sucesso",
          description: "Você será redirecionado para as dicas financeiras.",
          variant: "success",
        });
        toastIdRef.current = id;
        // Pequeno atraso para garantir que o toast seja exibido
        setTimeout(() => {
          if (toastIdRef.current) {
            dismiss(toastIdRef.current);
          }
          router.push("/financial-tips");
        }, 1000);
      } else {
        toast({
          title: "Erro ao fazer login",
          description: "Resposta inesperada do servidor.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Erro ao fazer login:", error);
      
      let errorMessage = "Email ou senha incorretos.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Email ou senha incorretos.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = "Erro ao conectar com o servidor. Tente novamente.";
      }

      toast({
        title: "Erro ao fazer login",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col cement-gradient">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <Link
          href="/"
          className="absolute left-4 top-4 flex items-center text-sm font-medium md:left-8 md:top-8 text-zinc-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Link>
        <div className="mx-auto grid w-full max-w-md gap-6 cement-card p-8 rounded-lg shadow-xl border border-zinc-700">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold text-zinc-100">Login</h1>
            <p className="text-zinc-400">Entre com suas credenciais para acessar sua conta</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Digite seu email"
                required
                value={formData.email}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                required
                value={formData.password}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
            </div>
            <Button type="submit" className="w-full cement-button text-white border-0 shadow-md" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <div className="text-center text-sm text-zinc-400">
            Não tem uma conta?{" "}
            <Link href="/signup" className="text-zinc-300 hover:text-white transition-colors">
              Cadastre-se
            </Link>
          </div>
          <div className="text-center text-sm">
            <Link href="#" className="text-sm text-zinc-400 hover:text-zinc-300 transition-colors">
              Esqueceu sua senha?
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
