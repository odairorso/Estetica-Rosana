# Deploy Instructions - Estética Rosana

## 🚀 Deploy na Vercel

### 1. Conectar Repositório
- Acesse [vercel.com](https://vercel.com)
- Faça login com sua conta GitHub
- Clique em "New Project"
- Selecione o repositório: `odairorso/Estetica-Rosana`

### 2. Configurar Variáveis de Ambiente
Na seção "Environment Variables" da Vercel, adicione:

```
VITE_SUPABASE_URL=https://zojtuknkuwvkbnaorfqd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI
```

### 3. Deploy
- Clique em "Deploy"
- Aguarde o build completar
- Acesse sua aplicação no link fornecido

## 📋 Checklist Pré-Deploy
- ✅ Banco Supabase configurado
- ✅ Tabelas criadas (clients, services, appointments, packages, session_history)
- ✅ RLS habilitado
- ✅ Dados de exemplo inseridos
- ✅ Projeto commitado no GitHub
- ✅ Configuração Vercel pronta

## 🔧 Configurações Técnicas
- **Framework**: Vite + React + TypeScript
- **Banco**: Supabase PostgreSQL
- **Deploy**: Vercel
- **Estilo**: Tailwind CSS + shadcn/ui

---
*Projeto criado em: $(Get-Date)*