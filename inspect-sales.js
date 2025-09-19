import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zojtuknkuwvkbnaorfqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvanR1a25rdXd2a2JuYW9yZnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNTMyNDksImV4cCI6MjA3MzYyOTI0OX0.RpA1fg0EMLK0mBrGBVljgzozi6c6J7tFw_S90LjxaiI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSales() {
  console.log('🔍 Inspecionando dados da tabela sales...');
  
  try {
    const { data: sales, error } = await supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar sales:', error);
      return;
    }

    console.log(`💰 Total de vendas: ${sales.length}\n`);

    sales.forEach((sale, index) => {
      console.log(`📋 Venda ${index + 1}:`);
      console.log(`  ID: ${sale.id}`);
      console.log(`  Cliente: ${sale.client_name}`);
      console.log(`  Total: R$ ${sale.total}`);
      console.log(`  Data: ${sale.sale_date}`);
      console.log(`  Método de pagamento: ${sale.payment_method}`);
      console.log(`  Items (raw):`, JSON.stringify(sale.items, null, 2));
      
      if (Array.isArray(sale.items)) {
        console.log(`  Items processados:`);
        sale.items.forEach((item, itemIndex) => {
          console.log(`    ${itemIndex + 1}. Nome: ${item.name || item.service_name || 'N/A'}`);
          console.log(`       Preço: R$ ${item.price || 'N/A'}`);
          console.log(`       Quantidade: ${item.quantity || 'N/A'}`);
        });
      }
      console.log('  ---\n');
    });

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

inspectSales();