import { Helmet } from "react-helmet-async";
import { TrendingUp, DollarSign, CreditCard, AlertCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export default function Finance() {
  return (
    <>
      <Helmet>
        <title>Financeiro | Gestão de Clínica Estética</title>
        <meta name="description" content="Pagamentos, contas a receber e relatórios de faturamento." />
        <link rel="canonical" href="/financeiro" />
      </Helmet>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gradient-brand">Financeiro</h1>
        
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <GlassCard>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Hoje</p>
                <p className="text-2xl font-bold text-green-600">R$ 2.450</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Faturamento Mês</p>
                <p className="text-2xl font-bold text-blue-600">R$ 18.750</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <CreditCard className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-2xl font-bold text-purple-600">R$ 3.200</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pendências</p>
                <p className="text-2xl font-bold text-orange-600">5</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </>
  );
}
