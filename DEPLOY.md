# Deploy Instructions - Estética Rosana

## 🚀 Deploy na Vercel

### 1. Conectar Repositório
- Acesse [vercel.com](https://vercel.com)
- Faça login com sua conta GitHub
- Clique em "New Project"
- Selecione o repositório: `odairorso/Estetica-Rosana`

### 2. Configurar Framework
- A Vercel deve detectar automaticamente que é um projeto Vite
- Se perguntado, confirme:
  - **Framework Preset:** Vite
  - **Build Command:** `npm run build`
  - **Output Directory:** `dist`
  - **Install Command:** `npm install`

### 3. Configurar Variáveis de Ambiente
⚠️ **CRÍTICO:** Configure as variáveis ANTES de fazer o primeiro deploy!

Na seção "Environment Variables" da Vercel, adicione:

**Nome:** `VITE_SUPABASE_URL`  
**Valor:** `https://zojtuknkuwvkbnaorfqd.supabase.co`

**Nome:** `VITE_SUPABASE_ANON_KEY`  
**Valor:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI`

✅ **IMPORTANTE:** Adicione essas variáveis para todos os ambientes (Production, Preview, Development).

### 4. Deploy
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

## 🔧 Troubleshooting

### Erro: "Missing Supabase environment variables"
**Solução:** Verifique se as variáveis de ambiente estão configuradas corretamente na Vercel:
1. Acesse o dashboard do projeto na Vercel
2. Vá em Settings > Environment Variables
3. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
4. Faça um novo deploy

### Erro de Build: "Module not found"
**Solução:** Limpe o cache e reinstale as dependências:
1. Delete `node_modules` e `package-lock.json`
2. Execute `npm install`
3. Faça commit das mudanças
4. Redeploy na Vercel

### Erro: "Failed to load resource" ou "Network Error"
**Solução:** Verifique a configuração do Supabase:
1. Confirme se a URL do Supabase está correta
2. Verifique se a chave anônima está válida
3. Teste a conexão localmente primeiro

### Deploy falha sem erro específico
**Solução:** 
1. Verifique os logs de build na Vercel
2. Teste o build localmente: `npm run build`
3. Verifique se não há imports de módulos inexistentes

## 🔧 Configurações Técnicas
- **Framework**: Vite + React + TypeScript
- **Banco**: Supabase PostgreSQL
- **Deploy**: Vercel
- **Estilo**: Tailwind CSS + shadcn/ui

---
*Projeto criado em: $(Get-Date)*