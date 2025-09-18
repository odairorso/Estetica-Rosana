import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Clock, DollarSign, Edit, Calendar } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceModal } from "@/components/services/ServiceModal";
import { AppointmentModal } from "@/components/services/AppointmentModal";
import { useServices, Service } from "@/hooks/useServices";
import { useAppointments } from "@/hooks/useAppointments";
import { useToast } from "@/hooks/use-toast";

const categories = ["Todos", "Facial", "Corporal"];

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [selectedServiceForAppointment, setSelectedServiceForAppointment] = useState<Service | null>(null);
  
  const { services, addService, updateService, getServiceIcon } = useServices();
  const { addAppointment } = useAppointments();
  const { toast } = useToast();

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || service.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddService = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleSaveService = (serviceData: Service) => {
    if (editingService) {
      updateService(serviceData);
      toast({
        title: "Serviço atualizado!",
        description: "O serviço foi atualizado com sucesso.",
      });
    } else {
      addService(serviceData);
      toast({
        title: "Serviço criado!",
        description: "O novo serviço foi adicionado com sucesso.",
      });
    }
  };

  const handleScheduleService = (service: Service) => {
    setSelectedServiceForAppointment(service);
    setAppointmentModalOpen(true);
  };

  const handleSaveAppointment = async (appointmentData: any) => {
    const result = await addAppointment(appointmentData);
    if (result) {
      toast({
        title: "Agendamento confirmado!",
        description: `${result.serviceName} agendado para ${result.client_name}.`,
      });
    } else {
      toast({ title: "Erro", description: "Não foi possível criar o agendamento.", variant: "destructive" });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Facial": return "bg-primary/20 text-primary";
      case "Corporal": return "bg-secondary/20 text-secondary";
      default: return "bg-accent/20 text-accent";
    }
  };

  return (
    <>
      <Helmet>
        <title>Serviços | Gestão de Clínica Estética</title>
        <meta name="description" content="Catálogo de serviços e tratamentos com preços e duração." />
        <link rel="canonical" href="/servicos" />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient-brand">Serviços</h1>
            <p className="text-muted-foreground">Catálogo de serviços e tratamentos</p>
          </div>
          <div className="flex gap-3">
            <SearchBar 
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
            <NeonButton icon={Plus} onClick={handleAddService}>
              Novo Serviço
            </NeonButton>
          </div>
        </div>

        {/* Filtros por categoria */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Grid de serviços */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => {
            const IconComponent = getServiceIcon(service.icon);
            return (
              <GlassCard key={service.id} className="transition-all hover:scale-[1.02] p-4">
                <div className="space-y-3">
                  {/* Header do serviço */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="rounded-full bg-primary p-2 shadow-lg flex-shrink-0">
                        <IconComponent className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-2">
                          {service.name}
                        </h3>
                        <Badge className={getCategoryColor(service.category)} variant="outline">
                          {service.category}
                        </Badge>
                      </div>
                    </div>
                    {service.popular && (
                      <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30 text-xs flex-shrink-0" variant="outline">
                        Popular
                      </Badge>
                    )}
                  </div>

                  {/* Descrição */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {service.description}
                  </p>

                  {/* Informações de preço e duração */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3" />
                        Preço
                      </div>
                      <div className="text-base font-bold text-green-600 dark:text-green-400">
                        R$ {service.price.toFixed(2).replace('.', ',')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Duração
                      </div>
                      <div className="text-base font-bold text-primary">
                        {service.duration} min
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => handleScheduleService(service)}
                    >
                      <Calendar className="h-3 w-3 mr-1" />
                      Agendar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => handleEditService(service)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Estado vazio */}
        {filteredServices.length === 0 && (
          <GlassCard className="text-center py-12">
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">Nenhum serviço encontrado</h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm ? "Tente ajustar sua busca" : "Cadastre seu primeiro serviço"}
                </p>
              </div>
              {!searchTerm && (
                <NeonButton icon={Plus} onClick={handleAddService}>
                  Cadastrar Primeiro Serviço
                </NeonButton>
              )}
            </div>
          </GlassCard>
        )}

        {/* Modal de serviço */}
        <ServiceModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          service={editingService}
          onSave={handleSaveService}
        />

        {/* Modal de agendamento */}
        <AppointmentModal
          open={appointmentModalOpen}
          onOpenChange={setAppointmentModalOpen}
          service={selectedServiceForAppointment}
          onSave={handleSaveAppointment}
        />
      </div>
    </>
  );
}