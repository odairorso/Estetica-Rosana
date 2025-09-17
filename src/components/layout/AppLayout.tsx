import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PropsWithChildren } from "react";
import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/clientes": "Clientes",
  "/agendamentos": "Agendamentos",
  "/pacotes": "Pacotes",
  "/servicos": "Serviços",
  "/estoque": "Estoque",
  "/financeiro": "Financeiro",
  "/configuracoes": "Configurações",
};

export function AppLayout({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const title = TITLES[pathname] ?? "Gestão";

  return (
    <SidebarProvider>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="ml-2" />
        <h1 className="text-lg font-semibold">{title}</h1>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
        <AppSidebar />
        <main className="flex-1 bg-[radial-gradient(800px_400px_at_var(--mouse-x,50%)_var(--mouse-y,50%),hsl(var(--brand-end)/0.08),transparent_40%)]">
          <div
            className="container py-6"
            onMouseMove={(e) => {
              const t = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - t.left;
              const y = e.clientY - t.top;
              e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
              e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;
