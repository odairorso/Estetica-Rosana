import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, ShoppingCart, DollarSign, Calendar, User, Receipt, Trash2, Package, Sparkles, Box } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { CashierModal } from "@/components/cashier/CashierModal";

interface CartItem {
  id: number;
  type: 'service' | 'package' | 'product';
  item_id: number;
  itemName: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: number;
  client_id: number;
  clientName: string;
  items: CartItem[];
  total: number;
  sale_date: string;
  payment_method: string;
  notes: string;
}

export default function Cashier() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [sales, setSales] = useState<Sale[]>([]);

  const handleSaveSale = (saleData: any) => {
    const newSale: Sale = {
      id: Math.max(0, ...sales.map(s => s.id)) + 1,
      client_id: saleData.client_id,
      clientName: saleData.clientName,
      items: saleData.items,
      total: saleData.items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0),
      sale_date: new Date().toISOString().split('T')[0],
      payment_method: saleData.payment_method,
      notes: saleData.notes
    };
    
    setSales([...sales, newSale]);
    
    toast({
      title: "Venda registrada!",
      description: `Venda para ${saleData.clientName} registrada com sucesso.`,
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

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cartao': return "bg-blue-500/20 text-blue-600";
      case 'pix': return "bg-green-500/20 text-green-600";
      case 'dinheiro': return "bg-yellow-500/20 text-yellow-600";
      default: return "bg-gray-500/20 text-gray-600";
    }
  };

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <>
      <Helmet>
        <title>Caixa | Gestão de Clínica Estética</title>
        <meta name="description" content="Sistema profissional de caixa com carrinho de compras" />
        <link rel="canonical" href="/caixa" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Caixa</h1>
            <p className="text-muted-foreground">Sistema de vendas com carrinho</p>
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
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="rounded-full bg-brand-gradient p-2">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-lg">{sale.clientName}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(sale.sale_date), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <Badge className={getPaymentMethodColor(sale.payment_method)}>
                          {getPaymentMethodName(sale.payment_method)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Itens da venda */}
                  <div className="space-y-2">
                    {sale.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getItemIcon(item.type)}
                          <span className="font-medium">{item.itemName}</span>
                          {item.quantity > 1 && (
                            <span className="text-muted-foreground">x{item.quantity}</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {getItemTypeName(item.type)}
                          </Badge>
                        </div>
                        <span className="font-medium">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lado direito - valor total e ações */}
                <div className="flex flex-col items-end gap-3 ml-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      R$ {sale.total.toFixed(2).replace('.', ',')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {sale.items.length} item{sale.items.length !== 1 ? 's' : ''}
                    </p>
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

              {/* Observações */}
              {sale.notes && (
                <div className="mt-3 pt-3 border-t border-border/30">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Observações:</span> {sale.notes}
                  </p>
                </div>
              )}
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
                  Comece registrando sua primeira venda com carrinho
                </p>
              </div>
              <NeonButton icon={Plus} onClick={() => setModalOpen(true)}>
                Nova Venda com Carrinho
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

        {/* Modal de nova venda com carrinho */}
        <CashierModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={handleSaveSale}
        />
      </div>
    </>
  );
}