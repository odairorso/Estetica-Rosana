import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Camera, Search, RefreshCw, Database } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Button } from "@/components/ui/button";
import { useClients, Client } from "@/hooks/useClients";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientModal } from "@/components/clients/ClientModal";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Clients() {
  const { toast } = useToast();
  const { clients, addClient, updateClient, deleteClient } = useClients();
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<number | null>(null);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.cpf.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewClient = () => {
    setEditingClient(null);
    setModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setModalOpen(true);
  };

  const handleSaveClient = (clientData: any) => {
    if (editingClient) {
      updateClient(editingClient.id, clientData);
    } else {
      addClient(clientData);
    }
    setEditingClient(null);
  };

  const handleDeleteClient = (id: number) => {
    setClientToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      const client = clients.find(c => c.id === clientToDelete);
      deleteClient(clientToDelete);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
      toast({
        title: "Cliente excluído",
        description: `${client?.name} foi removido da sua base de clientes.`,
      });
    }
  };

  // Função para restaurar os dados específicos que o usuário tinha
  const restoreOriginalClients = () => {
    console.log("🔄 RESTAURANDO CLIENTES ORIGINAIS...");
    
    const originalClients: Client[] = [
      {
        id: 1,
        name: "Ana Silva",
        email: "ana@email.com",
        phone: "(11) 99999-9999",
        cpf: "123.456.789-00",
        city: "São Paulo",
        state: "SP",
        total_visits: 12,
        active_packages: 2,
        last_visit: "2024-09-15",
        next_appointment: "2024-09-20T14:00:00Z",
        created_at: "2024-01-01T10:00:00Z"
      },
      {
        id: 2,
        name: "Beatriz Santos",
        email: "bia@email.com", 
        phone: "(11) 88888-8888",
        cpf: "987.654.321-00",
        city: "São Paulo",
        state: "SP",
        total_visits: 8,
        active_packages: 1,
        last_visit: "2024-09-10",
        next_appointment: "2024-09-22T16:30:00Z",
        created_at: "2024-01-02T11:00:00Z"
      },
      {
        id: 3,
        name: "Carla Oliveira",
        email: "carla@email.com",
        phone: "(11) 77777-7777",
        cpf: "456.789.123-00",
        city: "São Paulo",
        state: "SP",
        total_visits: 15,
        active_packages: 0,
        last_visit: "2024-09-08",
        created_at: "2024-01-03T12:00:00Z"
      },
      {
        id: 4,
        name: "ODAIR ROBERTO DOS SANTOS DE OLIVEIRA",
        email: "odair_orso@hotmail.com",
        phone: "67999748100",
        cpf: "87845998100",
        city: "Naviraí",
        state: "MS",
        total_visits: 0,
        active_packages: 0,
        created_at: "2024-01-04T14:00:00Z"
      }
    ];
    
    const confirmRestore = confirm(
      `🎯 RESTAURAR SEUS 4 CLIENTES ORIGINAIS?\n\n` +
      `👥 Clientes que serão restaurados:\n` +
      `1. Ana Silva (12 visitas, 2 pacotes)\n` +
      `2. Beatriz Santos (8 visitas, 1 pacote)\n` +
      `3. Carla Oliveira (15 visitas)\n` +
      `4. ODAIR ROBERTO DOS SANTOS DE OLIVEIRA (você)\n\n` +
      `✅ Confirma a restauração?`
    );
    
    if (confirmRestore) {
      // Salvar os dados originais
      localStorage.setItem('clinic-clients-v2', JSON.stringify(originalClients));
      
      toast({
        title: "🎉 Clientes Restaurados!",
        description: "Seus 4 clientes originais foram restaurados com sucesso!",
      });
      
      // Recarregar a página para mostrar os dados
      setTimeout(() => window.location.reload(), 1000);
    }
  };
  const recoverOldData = () => {
    console.log("🔍 BUSCANDO DADOS ANTIGOS DO LOCALSTORAGE...");
    
    // Verificar múltiplas chaves possíveis
    const possibleKeys = [
      'clinic-clients',
      'clinic-clients-v1', 
      'clinic-clients-v2',
      'clients',
      'estetica-clients',
      'rosana-clients',
      'supabase-clients'
    ];
    
    let foundData: Client[] = [];
    let foundKey = '';
    
    possibleKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const data = JSON.parse(stored);
          console.log(`📋 Encontrado em '${key}':`, data);
          if (Array.isArray(data) && data.length > 0) {
            foundData = data;
            foundKey = key;
          }
        }
      } catch (error) {
        console.log(`❌ Erro ao ler '${key}':`, error);
      }
    });
    
    // Verificar também o formato vendas para buscar nomes de clientes
    const salesKeys = ['clinic-sales', 'clinic-sales-v1', 'clinic-sales-v2'];
    let clientsFromSales: string[] = [];
    
    salesKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const sales = JSON.parse(stored);
          if (Array.isArray(sales)) {
            const names = sales.map(sale => sale.client_name).filter(name => name);
            clientsFromSales = [...clientsFromSales, ...names];
          }
        }
      } catch (error) {
        // Ignorar erros
      }
    });
    
    const uniqueClientNames = [...new Set(clientsFromSales)];
    
    if (foundData.length > 0) {
      const reportLines = [
        `🎉 DADOS ENCONTRADOS!`,
        `📍 Localização: localStorage['${foundKey}']`,
        `👥 Quantidade: ${foundData.length} clientes`,
        '',
        '📋 CLIENTES ENCONTRADOS:'
      ];
      
      foundData.forEach((client: any, index) => {
        reportLines.push(`${index + 1}. ${client.name || client.client_name || 'Nome não informado'}`);
      });
      
      if (uniqueClientNames.length > 0) {
        reportLines.push('');
        reportLines.push('💰 CLIENTES ENCONTRADOS NAS VENDAS:');
        uniqueClientNames.forEach((name, index) => {
          reportLines.push(`${index + 1}. ${name}`);
        });
      }
      
      reportLines.push('');
      reportLines.push('✅ Deseja importar estes dados?');
      
      const shouldImport = confirm(reportLines.join('\n'));
      
      if (shouldImport) {
        // Importar dados encontrados
        localStorage.setItem('clinic-clients-v2', JSON.stringify(foundData));
        
        toast({
          title: "🎉 Dados Recuperados!",
          description: `${foundData.length} clientes foram recuperados e importados!`,
        });
        
        // Recarregar a página para mostrar os dados
        window.location.reload();
      }
    } else {
      const reportLines = [
        '🔍 BUSCA CONCLUÍDA',
        '',
        '📊 RESULTADO DA BUSCA:',
        `• Chaves verificadas: ${possibleKeys.length}`,
        `• Dados de clientes encontrados: 0`,
        `• Nomes nas vendas: ${uniqueClientNames.length}`,
        '',
        uniqueClientNames.length > 0 ? '💡 CLIENTES ENCONTRADOS NAS VENDAS:' : '❌ Nenhum dado foi encontrado no localStorage',
      ];
      
      if (uniqueClientNames.length > 0) {
        uniqueClientNames.forEach((name, index) => {
          reportLines.push(`${index + 1}. ${name}`);
        });
        reportLines.push('');
        reportLines.push('💡 Estes clientes existem nas vendas mas não no cadastro.');
        reportLines.push('Você pode criá-los manualmente.');
      } else {
        reportLines.push('• Sugestão: Verifique se os dados foram salvos em outro navegador');
      }
      
      alert(reportLines.join('\n'));
      
      toast({
        title: "🔍 Busca Concluída",
        description: uniqueClientNames.length > 0 
          ? `Encontrados ${uniqueClientNames.length} nomes nas vendas` 
          : "Nenhum dado encontrado no localStorage",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Clientes | Gestão de Clínica Estética</title>
        <meta name="description" content="Cadastro e gestão de clientes da clínica estética." />
        <link rel="canonical" href="/clientes" />
      </Helmet>

      <div className="space-y-6">
        {/* Header com busca e botão novo */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Clientes</h1>
            <p className="text-muted-foreground">Gerencie sua base de clientes</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={restoreOriginalClients}
              className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              🎯 Restaurar Meus 4 Clientes
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={recoverOldData}
              className="bg-green-500/20 text-green-700 hover:bg-green-500/30"
            >
              <Database className="h-4 w-4 mr-2" />
              🔍 Buscar Outros Dados
            </Button>
            <SearchBar 
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <NeonButton icon={Plus} onClick={handleNewClient}>
              Novo Cliente
            </NeonButton>
          </div>
        </div>

        {/* Grid de clientes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          ))}
        </div>

        {/* Estado vazio */}
        {filteredClients.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm 
                    ? "Tente ajustar sua busca ou usar o botão 'Recuperar Dados Antigos'" 
                    : `Total de clientes no sistema: ${clients.length}`
                  }
                </p>
                {!searchTerm && clients.length === 0 && (
                  <p className="text-yellow-600 text-sm mt-2">
                    🔍 Se você tinha clientes antes, clique em "Recuperar Dados Antigos"
                  </p>
                )}
              </div>
              {!searchTerm && (
                <div className="flex gap-3 justify-center">
                  {clients.length === 0 && (
                    <Button 
                      variant="outline"
                      onClick={restoreOriginalClients}
                      className="bg-blue-500/20 text-blue-700 hover:bg-blue-500/30 mr-2"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      🎯 Restaurar Meus 4 Clientes
                    </Button>
                  )}
                  {clients.length === 0 && (
                    <Button 
                      variant="outline"
                      onClick={recoverOldData}
                      className="bg-green-500/20 text-green-700 hover:bg-green-500/30"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      🔍 Buscar Outros
                    </Button>
                  )}
                  <NeonButton icon={Plus} onClick={handleNewClient}>
                    {clients.length === 0 ? "Cadastrar Primeiro Cliente" : "Novo Cliente"}
                  </NeonButton>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Modal de cadastro/edição */}
        <ClientModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          client={editingClient}
          onSave={handleSaveClient}
          mode={editingClient ? 'edit' : 'create'}
        />

        {/* Dialog de confirmação de exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}