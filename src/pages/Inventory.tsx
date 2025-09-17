import { Helmet } from "react-helmet-async";
import { Package, AlertTriangle, Plus } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";

const mockProducts = [
  { name: "Ácido Hialurônico", quantity: 5, minStock: 10, status: "low" },
  { name: "Máscara Hidratante", quantity: 15, minStock: 5, status: "ok" },
  { name: "Óleo Essencial", quantity: 2, minStock: 8, status: "critical" }
];

export default function Inventory() {
  return (
    <>
      <Helmet>
        <title>Estoque | Gestão de Clínica Estética</title>
        <meta name="description" content="Cadastro de produtos, entradas e saídas e alertas de validade." />
        <link rel="canonical" href="/estoque" />
      </Helmet>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient-brand">Estoque</h1>
          <NeonButton icon={Plus}>Novo Produto</NeonButton>
        </div>
        
        <div className="grid gap-4">
          {mockProducts.map((product, index) => (
            <GlassCard key={index}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-brand-start" />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">Qtd: {product.quantity}</p>
                  </div>
                </div>
                <Badge className={
                  product.status === "critical" ? "bg-red-500/20 text-red-600" :
                  product.status === "low" ? "bg-yellow-500/20 text-yellow-600" :
                  "bg-green-500/20 text-green-600"
                }>
                  {product.status === "critical" ? "Crítico" : 
                   product.status === "low" ? "Baixo" : "OK"}
                </Badge>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </>
  );
}
