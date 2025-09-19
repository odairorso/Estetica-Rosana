import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { TrendingUp, DollarSign, CreditCard, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, Search, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";
import { useFinance, Transaction } from "@/hooks/useFinance";
import { TransactionModal } from "@/components/finance/TransactionModal";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function Finance() {
  const { allTransactions, addTransaction, deleteTransaction, getMetrics } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();
  const metrics = getMetrics();

  // Função de debug para verificar dados
  const debugFinance = () => {
    console.log("💰 DEBUG FINANCEIRO:");
    console.log("Transações:", allTransactions);
    console.log("Métricas:", metrics);
    
    const reportLines = [
      '💰 RELATÓRIO FINANCEIRO DEBUG:',
      '',
      `📅 HOJE (${new Date().toLocaleDateString('pt-BR')}):`,
      `  - Faturamento: R$ ${metrics.todayIncome.toFixed(2).replace('.', ',')}`,
      '',
      `📆 MÊS ATUAL:`,
      `  - Receita: R$ ${metrics.monthIncome.toFixed(2).replace('.', ',')}`,
      `  - Despesas: R$ ${metrics.monthExpense.toFixed(2).replace('.', ',')}`,
      `  - Lucro Líquido: R$ ${metrics.monthNetProfit.toFixed(2).replace('.', ',')}`,
      '',
      `📋 TOTAL DE TRANSAÇÕES: ${allTransactions.length}`,
      `  - Receitas: ${allTransactions.filter(t => t.type === 'income').length}`,
      `  - Despesas: ${allTransactions.filter(t => t.type === 'expense').length}`,
      '',
      '📊 CATEGORIAS:',
    ];
    
    // Agrupar por categoria
    const categories = allTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + (t.type === 'income' ? t.amount : -t.amount);
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(categories).forEach(([cat, value]) => {
      const signal = value >= 0 ? '+' : '';
      reportLines.push(`  - ${cat}: ${signal}R$ ${Math.abs(value).toFixed(2).replace('.', ',')}`);
    });
    
    alert(reportLines.join('\n'));
    
    toast({
      title: "💰 Debug Executado!",
      description: `${allTransactions.length} transações analisadas. Faturamento hoje: R$ ${metrics.todayIncome.toFixed(2)}`,
    });
  };

  const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
    const isIncome = transaction.type === 'income';
    return (
      <div className="flex items-center justify-between p-3 rounded-lg bg-card/50">
        <div className="flex items-center gap-3">
          {isIncome ? (
            <ArrowUpCircle className="h-5 w-5 text-green-500" />
          ) : (
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
          )}
          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-xs text-muted-foreground">
              {transaction.date} - {transaction.category}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className={`font-bold ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
            {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
          </p>
          {typeof transaction.id === 'number' && ( // Only manual transactions can be deleted
             <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTransaction(transaction.id as number)}>
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
             </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>Financeiro | Gestão de Clínica Estética</title>
        <meta name="description" content="Pagamentos, contas a receber e relatórios de faturamento." />
        <link rel="canonical" href="/financeiro" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Financeiro</h1>
            <p className="text-muted-foreground">Visão geral das suas finanças</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={debugFinance}
              className="bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30"
            >
              <Search className="h-4 w-4 mr-2" />
              🔍 Debug Financeiro
            </Button>
            <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
              Nova Transação
            </NeonButton>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <GlassCard>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                <p className="text-2xl font-bold text-green-500">{formatCurrency(metrics.todayIncome)}</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Receita do Mês</p>
                <p className="text-2xl font-bold text-blue-500">{formatCurrency(metrics.monthIncome)}</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Despesas do Mês</p>
                <p className="text-2xl font-bold text-red-500">{formatCurrency(metrics.monthExpense)}</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-purple-500">{formatCurrency(metrics.pendingValue)}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Últimas Transações</h2>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {allTransactions.length > 0 ? (
              allTransactions.map((t, i) => <TransactionRow key={`${t.id}-${i}`} transaction={t} />)
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma transação registrada.</p>
                <p className="text-sm text-muted-foreground mb-4">
                  As vendas do caixa e agendamentos concluídos aparecerão aqui automaticamente.
                </p>
                <Button 
                  variant="outline"
                  onClick={debugFinance}
                  className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30"
                >
                  <Search className="h-4 w-4 mr-2" />
                  🔍 Verificar Dados
                </Button>
              </div>
            )}
          </div>
        </GlassCard>

        <TransactionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={addTransaction}
        />
      </div>
    </>
  );
<<<<<<< HEAD
}
=======
}
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
