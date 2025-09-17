import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Sparkles, Package, User, Calendar, DollarSign } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useServices } from "@/hooks/useServices";
import { usePackages } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { CashierModal } from "@/components/cashier/CashierModal";

interface SaleItem {
  id: number;
  type: 'service' | 'package';
  item_id: number;
  client_id: number;
  clientName: string;
  itemName: string;
  price: number;
  sale_date: string;
  duration?: number; // Para serviços
  total_sessions?: number; // Para pacotes
  valid_until?: string; // Para pacotes
}

export default function Cashier() {
  const { toast } = useToast();
  const { services } = useServices();
  const { packages } = usePackages();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saleType, setSaleType] = useState<'service' | 'package'>('service');
  const [sales] = useState<SaleItem[]>([]); // Em produção, isso viria de um hook useSales

  // Simulando vendas a partir de serviços e pacotes existentes
  const simulatedSales: SaleItem[] = [
    ...services.map(s => ({
      id: s.id * 1000,
      type: 'service' as const,
      item_id: s.id,
      client_id: 1, // Exemplo
      clientName: "Ana Silva",
      itemName: s.name,
      price: s.price,
      sale_date: new Date().toISOString().split('T')[0],
      duration: s.duration
    })),
    ...packages.map(p => ({
      id: p.id * 10000,
      type: 'package' as const,
      item_id: p.id,
      client_id: p.client_id,
      clientName: p.clientName || "Cliente não encontrado",
      itemName: p.name,
      price: p.price,
      sale_date: p.created_at.split('T')[0],
      total_sessions: p.total_sessions,
      valid_until: p.valid_until
    }))
  ];

  const filteredSales = simulatedSales.filter(sale =>
    sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewSale = (type: 'service' | 'package') => {
    setSaleType(type);
    setModalOpen(true);
  };

  const handleSaveSale = (saleData: any) => {
    console.log("Nova venda registrada:", saleData);
    // Em produção, aqui você chamaria um hook como addSale(saleData)
    toast({
      title: "Venda registrada!",
      description: `Venda de ${saleData.type === 'service' ? 'procedimento' : 'pacote'} "${saleData.itemName}" para ${saleData.clientName} registrada com sucesso.`,
    });
    setModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Caixa | Gestão de Clínica Estética</title>
        <meta name="description" content="Registro de vendas de procedimentos avulsos e pacotes promocionais." />
        <link rel="canonical" href="/caixa" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Caixa</h1>
            <p className="text-muted-foreground">Registro de vendas de procedimentos e pacotes</p>
          </div>
          <div className="flex gap-3">
            <SearchBar 
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <div className="flex gap-2">
              <NeonButton icon={Sparkles} onClick={() => handleNewSale('service')} size="sm">
                Procedimento
              </NeonButton>
              <NeonButton icon={Package} onClick={() => handleNewSale('package')} size="sm">
                Pacote
              </NeonButton>
            </div>
          </div>
        </div>

        {/* Grid de vendas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSales.map((sale) => (
            <GlassCard key={sale.id} className="hover-lift">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-full p-2 ${sale.type === 'service' ? 'bg-primary' : 'bg-brand-gradient'}`}>
                      {sale.type === 'service' ? (
                        <Sparkles className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Package className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{sale.itemName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {sale.clientName}
                      </p>
                    </div>
                  </div>
                  <Badge className={sale.type === 'service' ? "bg-primary/20 text-primary" : "bg-green-500/20 text-green-600"}>
                    {sale.type === 'service' ? 'Procedimento' : 'Pacote'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Venda
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
                    <p className="font-medium text-green-600">R$ {sale.price.toFixed(2).replace('.', ',')}</p>
                  </div>
                </div>

                {sale.type === 'service' && sale.duration && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      Duração: {sale.duration} minutos
                    </p>
                  </div>
                )}

                {sale.type === 'package' && sale.total_sessions && (
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-xs text-muted-foreground">
                      {sale.total_sessions} sessões - Válido até: {sale.valid_until ? format(new Date(sale.valid_until), "dd/MM/yyyy", { locale: ptBR }) : 'N/A'}
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Estado vazio */}
        {filteredSales.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Nenhuma venda registrada</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Tente ajustar sua busca" : "Registre sua primeira venda"}
                </p>
              </div>
              {!searchTerm && (
                <div className="flex justify-center gap-3">
                  <NeonButton icon={Sparkles} onClick={() => handleNewSale('service')}>
                    Vender Procedimento
                  </NeonButton>
                  <NeonButton icon={Package} onClick={() => handleNewSale('package')}>
                    Vender Pacote
                  </NeonButton>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Modal de nova venda */}
        <CashierModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          type={saleType}
          onSave={handleSaveSale}
        />
      </div>
    </>
  );
}