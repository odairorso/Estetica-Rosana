import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { TrendingUp, DollarSign, CreditCard, ArrowUpCircle, ArrowDownCircle, Plus, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { useFinance, Transaction } from "@/hooks/useFinance";
import { TransactionModal } from "@/components/finance/TransactionModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function Finance() {
  const { allTransactions, addTransaction, deleteTransaction, getMetrics } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const metrics = getMetrics();

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
              {format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })} - {transaction.category}
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
          <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
            Nova Transação
          </NeonButton>
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
              <p className="text-center text-muted-foreground py-8">Nenhuma transação registrada.</p>
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
}