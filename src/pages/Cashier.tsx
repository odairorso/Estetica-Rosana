import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, ShoppingCart, DollarSign, Calendar, User, Receipt, Trash2 } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  const handleDeleteSale = (id: number) => {
    setSales(sales.filter(sale => sale.id !== id));
    toast({
      title: "Venda removida",
      description: "A venda foi removida com sucesso.",
    });
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'service': return "💆‍♀️";
      case 'package': return "📦";
      case 'product': return "🧴";
      default: return "💰";
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cartao': return "bg-blue-500/20 text-blue-600";
      case 'pix': return "bg-green-500/20 text-green-600";
      case 'dinheiro': return "bg-yellow-500/20 text-yellow-600";
      default: return "bg-gray-500/20 text-gray-600";
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.price, 0);

  return (
    <>
      <Helmet>
        <title>Caixa | Gestão de Clínica Estética</title>
        <meta name="description" content="Sistema profissional de caixa para clínica estética" />
        <link rel="canonical" href="/caixa" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Caixa</h1>
            <p className="text-muted-foreground">Controle profissional de vendas</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total de Vendas</p>
              <p className="text-xl font-bold text-green-600">
                R$ {totalRevenue.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
              Nova Venda
            </NeonButton>
          </div>
        </div>

        {/* Vendas registradas */}
        <div className="space-y-4">
          {sales.map((sale) => (
            <GlassCard key={sale.id} className="p-4 hover-lift">
              <div className="flex items-start justify-between">
                {/* Informações principais */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-2xl mt-1">{getItemIcon(sale.type)}</div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground text-lg">{sale.itemName}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {getItemTypeName(sale.type)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {sale.clientName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(sale.sale_date), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      {sale.quantity && (
                        <div className="flex items-center gap-1">
                          <span>Qtd: {sale.quantity}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lado direito - valor e ações */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      R$ {sale.price.toFixed(2).replace('.', ',')}
                    </p>
                    <Badge className={getPaymentMethodColor(sale.payment_method)}>
                      {getPaymentMethodName(sale.payment_method)}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteSale(sale.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Nenhuma venda registrada</h3>
                <p className="text-muted-foreground text-sm">
                  Comece registrando sua primeira venda
                </p>
              </div>
              <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
                Registrar Primeira Venda
              </NeonButton>
            </div>
          </GlassCard>
        )}

        {/* Resumo do dia */}
        {sales.length > 0 && (
          <GlassCard className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Total de Vendas</p>
                <p className="text-2xl font-bold">{sales.length}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Faturamento do Dia</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {totalRevenue.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold">
                  R$ {(totalRevenue / sales.length).toFixed(2).replace('.', ',')}
                </p>
              </div>
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