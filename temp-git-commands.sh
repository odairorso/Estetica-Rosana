#!/bin/bash
# Adicionar todas as mudanças
git add .

# Verificar o que será commitado
git status

# Fazer commit com mensagem descritiva
git commit -m "fix: corrige erro 404 na aba agendamentos e adiciona fallback robusto para Supabase

- Adiciona export default explícito em Appointments.tsx
- Corrige importação no App.tsx
- Adiciona tratamento de erro robusto em useAppointments com fallback para dados mock
- Adiciona arquivo _redirects para SPA funcionar na Vercel
- Garante que todas as abas funcionem offline quando Supabase falhar"

# Enviar para o GitHub
git push origin main

# Verificar se foi enviado
git log --oneline -5