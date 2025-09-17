import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Package, Calendar, DollarSign, User } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { usePackages } from "@/hooks/usePackages";
import { useClients } from "@/hooks/useClients";
import { useToast } from "@/hooks/use-toast";
import { SalesModal } from "@/components/sales/SalesModal";

interface Sale {
  id: number;
  package_id: number;
  client_id: number;
  clientName: string;
  packageName: string;
  price: number;
  sale_date: string;
  valid_until: string;
  total_sessions: number;
}

export default function Sales() {
  const { toast } = useToast();
  const { packages } = usePackages();
  const { clients } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sales] = useState<Sale[]>([]); // Em produção, isso viria de um hook useSales

  // Simulando vendas a partir dos pacotes existentes
  const simulatedSales: Sale[] = packages.map(pkg => ({
    id: pkg.id,
    package_id: pkg.id,
    client_id: pkg.client_id,
    clientName: pkg.clientName || "Cliente não encontrado",
    packageName: pkg.name,
    price: pkg.price,
    sale_date: pkg.created_at.split('T')[0],
    valid_until: pkg.valid_until,
    total_sessions: pkg.total_sessions
  }));

  const filteredSales = simulatedSales.filter(sale =>
    sale.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.packageName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewSale = () => {
    setModalOpen(true);
  };

  const handleSaveSale = (saleData: any) => {
    console.log("Nova venda registrada:", saleData);
    // Em produção, aqui você chamaria um hook como addSale(saleData)
    toast({
      title: "Venda registrada!",
      description: `Venda do pacote "${saleData.packageName}" para ${saleData.clientName} registrada com sucesso.`,
    });
    setModalOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Vendas | Gestão de Clínica Estética</title>
        <meta name="description" content="Registro de vendas de pacotes promocionais." />
        <link rel="canonical" href="/vendas" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Vendas</h1>
            <p className="text-muted-foreground">Registro de vendas de pacotes promocionais</p>
          </div>
          <div className="flex gap-3">
            <SearchBar 
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <NeonButton icon={Plus} onClick={handleNewSale}>
              Nova Venda
            </NeonButton>
          </div>
        </div>

        {/* Grid de vendas */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSales.map((sale) => (
            <GlassCard key={sale.id} className="hover-lift">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-brand-gradient p-2">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{sale.packageName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {sale.clientName}
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500/20 text-green-600">
                    R$ {sale.price.toFixed(2).replace('.', ',')}
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
                      Sessões
                    </div>
                    <p className="font-medium">{sale.total_sessions}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground">
                    Válido até: {format(new Date(sale.valid_until), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Estado vazio */}
        {filteredSales.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Nenhuma venda registrada</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Tente ajustar sua busca" : "Registre sua primeira venda de pacote"}
                </p>
              </div>
              {!searchTerm && (
                <NeonButton icon={Plus} onClick={handleNewSale}>
                  Registrar Primeira Venda
                </NeonButton>
              )}
            </div>
          </GlassCard>
        )}

        {/* Modal de nova venda */}
        <SalesModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSave={handleSaveSale}
        />
      </div>
    </>
  );
}