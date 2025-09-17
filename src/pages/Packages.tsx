import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Package } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { usePackages, Package as PackageType } from "@/hooks/usePackages";
import { PackageCard } from "@/components/packages/PackageCard";
import { PackageModal } from "@/components/packages/PackageModal";
import { SessionHistoryModal } from "@/components/packages/SessionHistoryModal";
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

export default function Packages() {
  const { toast } = useToast();
  const { packages, addPackage, updatePackage, deletePackage, useSession } = usePackages();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<number | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPackageHistory, setSelectedPackageHistory] = useState<PackageType | null>(null);

  const filteredPackages = packages.filter(pkg => {
    const clientName = pkg.clientName || '';
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "active") return matchesSearch && pkg.status === "active";
    if (filter === "expiring") return matchesSearch && pkg.status === "expiring";
    if (filter === "completed") return matchesSearch && pkg.status === "completed";
    if (filter === "expired") return matchesSearch && pkg.status === "expired";
    
    return matchesSearch;
  });

  const handleNewPackage = () => {
    setEditingPackage(null);
    setModalOpen(true);
  };

  const handleEditPackage = (pkg: PackageType) => {
    setEditingPackage(pkg);
    setModalOpen(true);
  };

  const handleSavePackage = (packageData: any) => {
    if (editingPackage) {
      updatePackage(editingPackage.id, packageData);
    } else {
      addPackage(packageData);
    }
    setEditingPackage(null);
  };

  const handleDeletePackage = (id: number) => {
    setPackageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (packageToDelete) {
      const pkg = packages.find(p => p.id === packageToDelete);
      deletePackage(packageToDelete);
      setDeleteDialogOpen(false);
      setPackageToDelete(null);
      toast({
        title: "Pacote excluído",
        description: `O pacote "${pkg?.name}" foi removido.`,
      });
    }
  };

  const handleUseSession = (id: number) => {
    const pkg = packages.find(p => p.id === id);
    if (pkg && pkg.remaining_sessions > 0) {
      useSession(id);
      toast({
        title: "Sessão utilizada",
        description: `Uma sessão do pacote "${pkg.name}" foi marcada como utilizada.`,
      });
    }
  };

  const handleViewHistory = (pkg: PackageType) => {
    setSelectedPackageHistory(pkg);
    setHistoryModalOpen(true);
  };

  return (
    <>
      <Helmet>
        <title>Pacotes | Gestão de Clínica Estética</title>
        <meta name="description" content="Criação e controle de pacotes promocionais com sessões." />
        <link rel="canonical" href="/pacotes" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Pacotes</h1>
            <p className="text-muted-foreground">Controle de pacotes promocionais e sessões</p>
          </div>
          <div className="flex gap-3">
            <SearchBar 
              placeholder="Buscar pacotes..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <NeonButton icon={Plus} onClick={handleNewPackage}>
              Novo Pacote
            </NeonButton>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "all", label: "Todos" },
            { key: "active", label: "Ativos" },
            { key: "expiring", label: "Vencendo" },
            { key: "completed", label: "Finalizados" },
            { key: "expired", label: "Expirados" }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                filter === filterOption.key
                  ? "bg-brand-gradient text-white"
                  : "bg-card/50 text-muted-foreground hover:bg-card"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Grid de pacotes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onEdit={handleEditPackage}
              onDelete={handleDeletePackage}
              onUseSession={handleUseSession}
              onViewHistory={handleViewHistory}
            />
          ))}
        </div>

        {/* Estado vazio */}
        {filteredPackages.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Nenhum pacote encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Tente ajustar sua busca" : "Crie seu primeiro pacote promocional"}
                </p>
              </div>
              {!searchTerm && (
                <NeonButton icon={Plus} onClick={handleNewPackage}>
                  Criar Primeiro Pacote
                </NeonButton>
              )}
            </div>
          </GlassCard>
        )}

        {/* Modal de cadastro/edição */}
        <PackageModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          package={editingPackage}
          onSave={handleSavePackage}
          mode={editingPackage ? 'edit' : 'create'}
        />

        {/* Modal de histórico de sessões */}
        <SessionHistoryModal
          open={historyModalOpen}
          onOpenChange={setHistoryModalOpen}
          package={selectedPackageHistory}
        />

        {/* Dialog de confirmação de exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este pacote? Esta ação não pode ser desfeita.
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