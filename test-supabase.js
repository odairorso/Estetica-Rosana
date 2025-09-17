// Script de teste para verificar conectividade com Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

console.log('🔍 Testando conectividade com Supabase...\n')

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('📋 Verificando variáveis de ambiente:')
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Definida' : '❌ Não definida'}`)
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ Definida' : '❌ Não definida'}`)

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Erro: Variáveis de ambiente do Supabase não estão configuradas!')
  console.log('📝 Crie um arquivo .env com:')
  console.log('VITE_SUPABASE_URL="sua_url_aqui"')
  console.log('VITE_SUPABASE_ANON_KEY="sua_chave_aqui"')
  process.exit(1)
}

// Criar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

console.log('\n🔗 Testando conexão com Supabase...')

try {
  // Teste 1: Verificar se consegue conectar
  const { data, error } = await supabase.from('services').select('count', { count: 'exact', head: true })
  
  if (error) {
    console.log('❌ Erro na conexão:', error.message)
    console.log('🔍 Detalhes do erro:', error)
  } else {
    console.log('✅ Conexão com Supabase estabelecida com sucesso!')
    console.log(`📊 Tabela 'services' encontrada`)
  }

  // Teste 2: Verificar outras tabelas principais
  const tables = ['clients', 'appointments', 'packages', 'inventory']
  
  console.log('\n📋 Verificando tabelas do banco:')
  for (const table of tables) {
    try {
      const { error: tableError } = await supabase.from(table).select('count', { count: 'exact', head: true })
      if (tableError) {
        console.log(`❌ Tabela '${table}': ${tableError.message}`)
      } else {
        console.log(`✅ Tabela '${table}': OK`)
      }
    } catch (err) {
      console.log(`❌ Tabela '${table}': Erro de conexão`)
    }
  }

  // Teste 3: Verificar autenticação
  console.log('\n🔐 Testando autenticação...')
  const { data: authData, error: authError } = await supabase.auth.getSession()
  
  if (authError) {
    console.log('❌ Erro na autenticação:', authError.message)
  } else {
    console.log('✅ Sistema de autenticação funcionando')
    console.log(`👤 Sessão atual: ${authData.session ? 'Ativa' : 'Não ativa'}`)
  }

} catch (error) {
  console.log('❌ Erro geral:', error.message)
  console.log('🔍 Stack trace:', error.stack)
}

console.log('\n🏁 Teste concluído!')