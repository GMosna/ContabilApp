"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import api from "@/services/api"

export default function SignupPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    email: "",
    dateOfBirth: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    setFormData({ ...formData, cpf: formattedCPF })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório"
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório"
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = "CPF deve estar no formato 000.000.000-00"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido"
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Data de nascimento é obrigatória"
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória"
    } else if (formData.password.length < 6) {
      newErrors.password = "A senha deve ter pelo menos 6 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      // Formata os dados conforme esperado pelo backend
      const requestData = {
        email: formData.email,
        password: formData.password,
        name: formData.name.trim(),
        cpf: formData.cpf.replace(/[.-]/g, ''), // Remove pontos e traços do CPF
        dateOfBirth: formData.dateOfBirth
      };

      try {
        console.log('Dados a serem enviados:', requestData);
        
        const response = await api.post('/auth/register', requestData);

        console.log('Resposta do servidor:', response.data);

        // Se o cadastro foi bem sucedido, armazena o token
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token);
          // Atualiza o estado global ou contexto se necessário
          // Você pode adicionar aqui qualquer lógica adicional após o login bem-sucedido
        }

        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Sua conta foi criada. Você já pode fazer login.",
        });
        setIsSubmitted(true);
      } catch (error: any) {
        console.error('Erro detalhado:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: error.config,
          data: error.response?.data
        });
        
        let errorMessage = 'Erro ao fazer cadastro. Por favor, tente novamente.';
        
        if (error.response) {
          if (error.response.status === 400) {
            // Tenta extrair a mensagem de erro do backend
            const serverMessage = error.response.data?.message || error.response.data;
            errorMessage = typeof serverMessage === 'string' ? serverMessage : 'Dados inválidos. Verifique as informações.';
            console.log('Dados que causaram erro:', requestData);
          } else if (error.response.status === 403) {
            // Mensagem aprimorada para erros de dados duplicados ou inválidos (sem mensagem específica do backend)
            if (error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            } else {
              errorMessage = 'Um usuário com este CPF ou email já pode estar cadastrado. Por favor, verifique os dados ou tente fazer login.';
            }
            console.log('Erro de CORS ou configuração:', error.response);
          } else if (error.response.data?.message) {
            errorMessage = error.response.data.message;
          }
        } else if (error.request) {
          errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
        }

        toast({
          title: "Erro ao fazer cadastro",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 cement-gradient">
        <Card className="w-full max-w-md p-8 shadow-xl cement-card border border-zinc-700">
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-emerald-400" />
            <h1 className="text-2xl font-bold text-zinc-100">Cadastro concluído!</h1>
            <p className="text-zinc-400">Sua conta foi criada com sucesso. O que deseja fazer agora?</p>
            <div className="flex flex-col sm:flex-row w-full gap-3 mt-4">
              <Button asChild className="flex-1 cement-button text-white border-0 shadow-md">
                <Link href="/login">Fazer Login</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700"
              >
                <Link href="/">Voltar para Home</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
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
            <h1 className="text-3xl font-bold text-zinc-100">Criar Conta</h1>
            <p className="text-zinc-400">Preencha os campos abaixo para criar sua conta</p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-300">
                Nome Completo
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Digite seu nome completo"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="cpf" className="text-zinc-300">
                CPF
              </Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleCPFChange}
                placeholder="000.000.000-00"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
              {errors.cpf && <p className="text-red-400 text-xs mt-1">{errors.cpf}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-zinc-300">
                Data de Nascimento
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
              {errors.dateOfBirth && <p className="text-red-400 text-xs mt-1">{errors.dateOfBirth}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Crie uma senha"
                required
                className="bg-zinc-800 border-zinc-700 text-zinc-200 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-zinc-600"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
            </div>
            <Button type="submit" className="w-full cement-button text-white border-0 shadow-md">
              Criar Conta
            </Button>
          </form>
          <div className="text-center text-sm text-zinc-400">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-zinc-300 hover:text-white transition-colors">
              Faça login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
