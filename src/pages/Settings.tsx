import { Helmet } from "react-helmet-async";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSettings } from "@/hooks/useSettings";
import { useTheme } from "@/components/ThemeProvider";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { settings, updateClinicInfo, isLoading } = useSettings();
  const { theme, setTheme } = useTheme();

  const handleInfoChange = (field: string, value: string) => {
    updateClinicInfo({ [field]: value });
  };

  const handleSave = () => {
    toast({
      title: "Configurações salvas!",
      description: "As informações da clínica foram atualizadas.",
    });
  };

  if (isLoading || !settings) {
    return (
      <>
        <Helmet>
          <title>Configurações | Gestão de Clínica Estética</title>
        </Helmet>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gradient-brand">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as preferências do sistema.</p>
          </div>
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">Informações da Clínica</h2>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </GlassCard>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Configurações | Gestão de Clínica Estética</title>
        <meta name="description" content="Preferências do sistema, perfis de acesso e notificações." />
        <link rel="canonical" href="/configuracoes" />
      </Helmet>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gradient-brand">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as preferências do sistema.</p>
        </div>

        <GlassCard>
          <h2 className="text-xl font-semibold mb-4">Informações da Clínica</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinicName">Nome da Clínica</Label>
                <Input
                  id="clinicName"
                  value={settings.clinicInfo.name}
                  onChange={(e) => handleInfoChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinicPhone">Telefone</Label>
                <Input
                  id="clinicPhone"
                  value={settings.clinicInfo.phone}
                  onChange={(e) => handleInfoChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicEmail">E-mail de Contato</Label>
              <Input
                id="clinicEmail"
                type="email"
                value={settings.clinicInfo.email}
                onChange={(e) => handleInfoChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinicAddress">Endereço</Label>
              <Input
                id="clinicAddress"
                value={settings.clinicInfo.address}
                onChange={(e) => handleInfoChange('address', e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave}>Salvar Informações</Button>
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-xl font-semibold mb-4">Aparência</h2>
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="theme">Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Selecione um tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Escolha como o painel deve ser exibido.
            </p>
          </div>
        </GlassCard>
      </div>
    </>
  );
}