import { Helmet } from "react-helmet-async";
import { useState, useMemo } from "react";
import { TrendingUp, DollarSign, CreditCard, ArrowUpCircle, ArrowDownCircle, Plus, Trash2, Search, Filter, User, Calendar as CalendarIcon } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { useFinance, Transaction } from "@/hooks/useFinance";
import { TransactionModal } from "@/components/finance/TransactionModal";
import { format, parseISO, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function Finance() {
  const { allTransactions, addTransaction, deleteTransaction, getMetrics } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  
  const metrics = getMetrics();

  // Filtrar transações
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((transaction) => {
      // Filtro por cliente (busca na descrição)
      const matchesClient = clientSearch === "" || 
        transaction.description.toLowerCase().includes(clientSearch.toLowerCase());
      
      // Filtro por tipo
      const matchesType = typeFilter === "all" || transaction.type === typeFilter;
      
      // Filtro por categoria
      const matchesCategory = categoryFilter === "all" || transaction.category === categoryFilter;
      
      // Filtro por período
      let matchesPeriod = true;
      if (periodFilter !== "all") {
        const transactionDate = parseISO(transaction.date);
        const now = new Date();
        
        switch (periodFilter) {
          case "today":
            matchesPeriod = format(transactionDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
            break;
          case "month":
            matchesPeriod = transactionDate >= startOfMonth(now) && transactionDate <= endOfMonth(now);
            break;
          case "year":
            matchesPeriod = transactionDate >= startOfYear(now) && transactionDate <= endOfYear(now);
            break;
        }
      }
      
      return matchesClient && matchesType && matchesCategory && matchesPeriod;
    });
  }, [allTransactions, clientSearch, typeFilter, periodFilter, categoryFilter]);

  // Obter categorias únicas
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(allTransactions.map(t => t.category))];
    return categories.sort();
  }, [allTransactions]);

  // Calcular métricas filtradas
  const filteredMetrics = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const TransactionRow = ({ transaction }: { transaction: Transaction }) => {
    const isIncome = transaction.type === 'income';
    const isClientTransaction = transaction.description.includes('(') && transaction.description.includes(')');
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {isIncome ? (
                <ArrowUpCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                     <CalendarIcon className="h-3 w-3" />
                     <span>{format(parseISO(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                   </div>
                  <Badge variant="outline" className="text-xs">
                    {transaction.category}
                  </Badge>
                  {isClientTransaction && (
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="text-xs">Cliente</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className={`font-bold text-lg ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
                  {isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {isIncome ? 'Receita' : 'Despesa'}
                </p>
              </div>
              {typeof transaction.id === 'number' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-gray-400 hover:text-red-600" 
                  onClick={() => deleteTransaction(transaction.id as number)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Financeiro | Gestão de Clínica Estética</title>
        <meta name="description" content="Controle financeiro com busca por cliente e histórico detalhado de transações." />
        <link rel="canonical" href="/financeiro" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Financeiro</h1>
            <p className="text-muted-foreground">Controle financeiro com busca por cliente e histórico</p>
          </div>
          <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
            Nova Transação
          </NeonButton>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Busca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca por Cliente */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cliente</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por cliente..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro por Tipo */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tipo</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    <SelectItem value="income">Receitas</SelectItem>
                    <SelectItem value="expense">Despesas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Período */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Período</label>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os períodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os períodos</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="year">Este ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro por Categoria */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Categoria</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {uniqueCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Métricas Gerais */}
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

        {/* Métricas Filtradas */}
        {(clientSearch || typeFilter !== "all" || periodFilter !== "all" || categoryFilter !== "all") && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Busca</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{filteredMetrics.count}</p>
                  <p className="text-sm text-gray-600">Transações</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(filteredMetrics.income)}</p>
                  <p className="text-sm text-gray-600">Receitas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(filteredMetrics.expense)}</p>
                  <p className="text-sm text-gray-600">Despesas</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${filteredMetrics.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(filteredMetrics.balance)}
                  </p>
                  <p className="text-sm text-gray-600">Saldo</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>
              Histórico de Transações
              {filteredTransactions.length !== allTransactions.length && (
                <Badge variant="secondary" className="ml-2">
                  {filteredTransactions.length} de {allTransactions.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((t, i) => (
                  <TransactionRow key={`${t.id}-${i}`} transaction={t} />
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <DollarSign className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {clientSearch || typeFilter !== "all" || periodFilter !== "all" || categoryFilter !== "all"
                      ? "Nenhuma transação encontrada"
                      : "Nenhuma transação registrada"
                    }
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {clientSearch || typeFilter !== "all" || periodFilter !== "all" || categoryFilter !== "all"
                      ? "Tente ajustar os filtros para encontrar outras transações"
                      : "Comece adicionando uma nova transação"
                    }
                  </p>
                  {(!clientSearch && typeFilter === "all" && periodFilter === "all" && categoryFilter === "all") && (
                    <Button onClick={() => setModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Transação
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <TransactionModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={addTransaction}
        />
      </div>
    </>
  );
}