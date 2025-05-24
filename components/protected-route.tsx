"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import authService from "@/services/authService"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está autenticado
    if (!authService.isAuthenticated()) {
      // Redirecionar para a página de login
      router.push("/login")
    }
  }, [router])

  // Se o usuário estiver autenticado, renderiza os filhos
  // Se não estiver, não renderiza nada (o redirecionamento ocorrerá no useEffect)
  return authService.isAuthenticated() ? <>{children}</> : null
}
