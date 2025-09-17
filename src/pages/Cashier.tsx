import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, ShoppingCart, DollarSign, Calendar, User, Box, Package, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { CashierModal } from "@/components/cashier/CashierModal";

interface SaleItem {
  id: number;
  type: 'service' | 'package' | 'product';
  item_id: number;
  client_id: number;
  clientName: string;
  itemName: string;
  price: number;
  sale_date: string;
  quantity?: number;
  payment_method: string;
}

export default function Cashier() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [sales, setSales] = useState<SaleItem[]>([]);

  const handleSaveSale = (saleData: any) => {
    const newSale: SaleItem = {
      id: Math.max(0, ...sales.map(s => s.id)) + 1,
      ...saleData,
      sale_date: new Date().toISOString().split('T')[0]
    };
    
    setSales([...sales, newSale]);
    
    toast({
      title: "Venda registrada!",
      description: `Venda de ${saleData.itemName} para ${saleData.clientName} registrada com sucesso.`,
    });
    setModalOpen(false);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'service': return <Sparkles className="h-4 w-4" />;
      case 'package': return <Package className="h-4 w-4" />;
      case 'product': return <Box className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getItemTypeName = (type: string) => {
    switch (type) {
      case 'service': return 'Procedimento';
      case 'package': return 'Pacote';
      case 'product': return 'Produto';
      default: return 'Item';
    }
  };

  const getPaymentMethodName = (method: string) => {
    switch (method) {
      case 'cartao': return 'Cartão';
      case 'pix': return 'PIX';
      case 'dinheiro': return 'Dinheiro';
      default: return method;
    }
  };

  return (
    <>
      <Helmet>
        <title>Caixa | Gestão de Clínica Estética</title>
        <meta name="description" content="Registro de vendas de procedimentos, pacotes e produtos." />
        <link rel="canonical" href="/caixa" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Caixa</h1>
            <p className="text-muted-foreground">Registro de vendas realizadas</p>
          </div>
          <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
            Nova Venda
          </NeonButton>
        </div>

        {/* Vendas registradas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sales.map((sale) => (
            <GlassCard key={sale.id} className="hover-lift p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-brand-gradient p-2">
                      {getItemIcon(sale.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{sale.itemName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {sale.clientName}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-600">
                    {getItemTypeName(sale.type)}
                  </Badge>
                </div>

                {/* Informações da venda */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Data
                    </div>
                    <p className="font-medium">
                      {format(new Date(sale.sale_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3 w-3" />
                      Valor
                    </div>
                    <p className="font-medium text-green-600">
                      R$ {sale.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>

                {/* Informações adicionais */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {sale.quantity && (
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Quantidade:</span>
                      <p className="font-medium">{sale.quantity}</p>
                    </div>
                  )}
                  
                  <div className="space-y-1">
                    <span className="text-muted-foreground">Pagamento:</span>
                    <p className="font-medium">{getPaymentMethodName(sale.payment_method)}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Estado vazio */}
        {sales.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Nenhuma venda registrada</h3>
                <p className="text-muted-foreground text-sm">
                  Registre sua primeira venda para começar
                </p>
              </div>
              <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
                Registrar Primeira Venda
              </NeonButton>
            </div>
          </GlassCard>
        )}

        {/* Modal de nova venda */}
        <CashierModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={handleSaveSale}
        />
      </div>
    </>
  );
}