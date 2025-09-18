import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Plus, Package, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TestDataSetup() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Verificar conexão com Supabase
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      if (!supabase) {
        setConnectionStatus('error');
        return;
      }

      const { data, error } = await supabase.from('services').select('id').limit(1);
      
      if (error) {
        console.error('❌ Erro de conexão:', error);
        setConnectionStatus('error');
      } else {
        console.log('✅ Conexão com Supabase verificada');
        setConnectionStatus('connected');
      }
    } catch (err) {
      console.error('❌ Erro ao verificar conexão:', err);
      setConnectionStatus('error');
    }
  };

  const createTestServices = async () => {
    setIsLoading(true);
    
    const testServices = [
      {
        name: "Limpeza de Pele Profunda",
        category: "Facial",
        price: 180.00,
        duration: 60,
        description: "Limpeza profunda da pele com extração de cravos e hidratação intensiva. Ideal para todos os tipos de pele.",
        icon: "Sparkles",
        popular: true,
        active: true
      },
      {
        name: "Drenagem Linfática Facial",
        category: "Facial", 
        price: 120.00,
        duration: 45,
        description: "Técnica de massagem que estimula o sistema linfático, reduzindo inchaços e melhorando a circulação.",
        icon: "Heart",
        popular: false,
        active: true
      },
      {
        name: "Botox Estético",
        category: "Facial",
        price: 850.00,
        duration: 30,
        description: "Aplicação de toxina botulínica para suavizar rugas de expressão. Resultado natural e duradouro.",
        icon: "Zap",
        popular: true,
        active: true
      },
      {
        name: "Preenchimento Labial",
        category: "Facial",
        price: 650.00,
        duration: 45,
        description: "Aumento e definição dos lábios com ácido hialurônico. Resultado imediato e natural.",
        icon: "Droplet",
        popular: true,
        active: true
      },
      {
        name: "Limpeza de Pele Corporal",
        category: "Corporal",
        price: 220.00,
        duration: 75,
        description: "Limpeza profunda da pele do corpo, ideal para costas e colo. Remove impurezas e revitaliza.",
        icon: "Sparkles",
        popular: false,
        active: true
      },
      {
        name: "Drenagem Linfática Corporal",
        category: "Corporal",
        price: 180.00,
        duration: 60,
        description: "Massagem terapêutica que elimina toxinas e reduz retenção de líquidos. Excelente para pós-cirurgia.",
        icon: "Heart",
        popular: false,
        active: true
      }
    ];

    try {
      const { data, error } = await supabase
        .from('services')
        .insert(testServices)
        .select();

      if (error) {
        console.error('❌ Erro ao criar serviços:', error);
        toast({
          title: "❌ Erro",
          description: "Erro ao criar serviços de teste: " + error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Serviços de teste criados:', data?.length || 0);
        toast({
          title: "✅ Sucesso!",
          description: `${data?.length || 0} serviços de teste criados com sucesso!`
        });
      }
    } catch (err) {
      console.error('❌ Erro ao criar serviços:', err);
      toast({
        title: "❌ Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const createTestPackages = async () => {
    setIsLoading(true);
    
    const testPackages = [
      {
        name: "Pacote Bronze - 3 Sessões",
        description: "Limpeza de pele profunda + hidratação + drenagem linfática facial. Ideal para manter a pele saudável e radiante.",
        total_sessions: 3,
        price: 450.00,
        valid_until: "2024-12-31",
        status: "active",
        used_sessions: 0,
        remaining_sessions: 3,
        client_id: 0 // Pacote genérico
      },
      {
        name: "Pacote Prata - 5 Sessões",
        description: "Limpeza de pele + botox estético + 2 drenagens + preenchimento labial. Tratamento completo para rejuvenescimento.",
        total_sessions: 5,
        price: 1200.00,
        valid_until: "2024-12-31",
        status: "active",
        used_sessions: 0,
        remaining_sessions: 5,
        client_id: 0 // Pacote genérico
      },
      {
        name: "Pacote Ouro - 8 Sessões",
        description: "Tratamento completo com limpeza, botox, preenchimento e drenagens. O melhor para transformação total.",
        total_sessions: 8,
        price: 2000.00,
        valid_until: "2024-12-31",
        status: "active",
        used_sessions: 0,
        remaining_sessions: 8,
        client_id: 0 // Pacote genérico
      },
      {
        name: "Pacote Corporal - 4 Sessões",
        description: "Limpeza corporal + 3 drenagens linfáticas. Ideal para pós-operatório e retenção de líquidos.",
        total_sessions: 4,
        price: 680.00,
        valid_until: "2024-12-31",
        status: "active",
        used_sessions: 0,
        remaining_sessions: 4,
        client_id: 0 // Pacote genérico
      }
    ];

    try {
      const { data, error } = await supabase
        .from('packages')
        .insert(testPackages)
        .select();

      if (error) {
        console.error('❌ Erro ao criar pacotes:', error);
        toast({
          title: "❌ Erro",
          description: "Erro ao criar pacotes de teste: " + error.message,
          variant: "destructive"
        });
      } else {
        console.log('✅ Pacotes de teste criados:', data?.length || 0);
        toast({
          title: "✅ Sucesso!",
          description: `${data?.length || 0} pacotes de teste criados com sucesso!`
        });
      }
    } catch (err) {
      console.error('❌ Erro ao criar pacotes:', err);
      toast({
        title: "❌ Erro",
        description: "Erro ao conectar com o servidor",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const checkExistingData = async () => {
    setIsLoading(true);
    
    try {
      // Verificar serviços existentes
      const { data: servicesData } = await supabase
        .from('services')
        .select('id')
        .limit(1);
      
      // Verificar pacotes existentes
      const { data: packagesData } = await supabase
        .from('packages')
        .select('id')
        .limit(1);
      
      // Verificar clientes existentes
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id')
        .limit(1);
      
      const report = [
        '📊 RELATÓRIO DO BANCO DE DADOS:',
        '',
        `🛍️ Serviços: ${servicesData?.length || 0} cadastrados`,
        `📦 Pacotes: ${packagesData?.length || 0} cadastrados`,
        `👥 Clientes: ${clientsData?.length || 0} cadastrados`,
        '',
        connectionStatus === 'connected' ? '✅ Conexão ativa com Supabase' : '❌ Sem conexão'
      ].join('\n');
      
      alert(report);
      
      toast({
        title: "📊 Relatório Gerado",
        description: `Dados verificados: ${servicesData?.length || 0} serviços, ${packagesData?.length || 0} pacotes, ${clientsData?.length || 0} clientes`
      });
      
    } catch (err) {
      console.error('❌ Erro ao verificar dados:', err);
      toast({
        title: "❌ Erro",
        description: "Erro ao verificar dados do servidor",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  if (connectionStatus === 'checking') {
    return (
      <GlassCard className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando conexão com servidor...</p>
        </div>
      </GlassCard>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <GlassCard className="p-6">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <div>
            <h3 className="font-semibold text-red-700">❌ Sem Conexão com Servidor</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Não foi possível conectar com o Supabase. Verifique sua conexão com a internet
              e as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-700">✅ Conectado ao Servidor</h2>
          <p className="text-muted-foreground mt-2">
            Sistema conectado ao Supabase com sucesso! Pronto para criar dados de teste.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Procedimentos (Serviços)
            </h3>
            <p className="text-sm text-muted-foreground">
              Crie procedimentos estéticos para vender no caixa
            </p>
            <Button 
              onClick={createTestServices} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Criar 6 Procedimentos de Teste
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              Pacotes Promocionais
            </h3>
            <p className="text-sm text-muted-foreground">
              Crie pacotes com múltiplas sessões para vender
            </p>
            <Button 
              onClick={createTestPackages} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              <Package className="h-4 w-4 mr-2" />
              Criar 4 Pacotes de Teste
            </Button>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button 
            onClick={checkExistingData} 
            disabled={isLoading}
            variant="outline"
            className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            📊 Verificar Dados Existentes no Servidor
          </Button>
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Processando...</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
