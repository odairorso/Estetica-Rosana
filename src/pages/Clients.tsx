import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Camera, AlertTriangle } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { useClients, Client } from "@/hooks/useClients";
import { ClientCard } from "@/components/clients/ClientCard";
import { ClientModal } from "@/components/clients/ClientModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
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

  if (!supabase) {
    return (
      <>
        <Helmet>
          <title>Clientes | Gestão de Clínica Estética</title>
        </Helmet>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gradient-brand">Clientes</h1>
              <p className="text-muted-foreground">Gerencie sua base de clientes</p>
            </div>
          </div>
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
              <h3 className="font-semibold text-xl text-destructive">Erro de Configuração</h3>
              <p className="text-muted-foreground">
                A conexão com o banco de dados (Supabase) não foi configurada.
              </p>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Para corrigir, por favor, crie um arquivo <code>.env.local</code> na raiz do projeto e adicione suas credenciais, como explicado no arquivo <code>README.md</code>.
              </p>
            </div>
          </GlassCard>
        </div>
      </>
    );
  }

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
                <h3 className="font-semibold">Nenhum cliente encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Tente ajustar sua busca" : "Cadastre seu primeiro cliente"}
                </p>
              </div>
              {!searchTerm && (
                <NeonButton icon={Plus} onClick={handleNewClient}>
                  Cadastrar Primeiro Cliente
                </NeonButton>
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