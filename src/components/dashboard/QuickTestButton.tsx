import { Button } from "@/components/ui/button";
import { Plus, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function QuickTestButton() {
  const { toast } = useToast();

  const createQuickTestData = async () => {
    try {
      // Criar 3 serviços rápidos
      const quickServices = [
        {
          name: "Limpeza de Pele Express",
          category: "Facial",
          price: 150.00,
          duration: 45,
          description: "Limpeza rápida e eficaz para o dia a dia",
          icon: "Sparkles",
          popular: true,
          active: true
        },
        {
          name: "Drenagem Facial",
          category: "Facial",
          price: 120.00,
          duration: 30,
          description: "Massagem desintoxicante",
          icon: "Heart",
          popular: false,
          active: true
        },
        {
          name: "Hidratação Profunda",
          category: "Facial",
          price: 200.00,
          duration: 60,
          description: "Hidratação intensiva para pele seca",
          icon: "Droplet",
          popular: true,
          active: true
        }
      ];

      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .insert(quickServices)
        .select();

      if (servicesError) throw servicesError;

      // Criar 2 pacotes rápidos
      const quickPackages = [
        {
          name: "Pacote Iniciante - 3 Sessões",
          description: "Limpeza + Hidratação + Drenagem",
          total_sessions: 3,
          price: 400.00,
          valid_until: "2024-12-31",
          status: "active",
          used_sessions: 0,
          remaining_sessions: 3,
          client_id: 0 // Pacote genérico
        },
        {
          name: "Pacote Premium - 5 Sessões",
          description: "Tratamento completo facial",
          total_sessions: 5,
          price: 750.00,
          valid_until: "2024-12-31",
          status: "active",
          used_sessions: 0,
          remaining_sessions: 5,
          client_id: 0 // Pacote genérico
        }
      ];

      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .insert(quickPackages)
        .select();

      if (packagesError) throw packagesError;

      toast({
        title: "✅ Dados de Teste Criados!",
        description: `${servicesData?.length || 0} serviços e ${packagesData?.length || 0} pacotes criados com sucesso!`
      });

    } catch (error) {
      console.error('❌ Erro ao criar dados rápidos:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao criar dados de teste",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={createQuickTestData}
      className="bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-300"
    >
      <TestTube className="h-4 w-4 mr-2" />
      🧪 Criar Dados Rápidos
    </Button>
  );
}
