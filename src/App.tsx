import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Appointments from "./pages/Appointments"; // ✅ Verificar se esta importação existe
import Packages from "./pages/Packages";
import Services from "./pages/Services";
import Inventory from "./pages/Inventory";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import { HelmetProvider } from "react-helmet-async";
import AppLayout from "./components/layout/AppLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import { supabase } from "./lib/supabase";
import { SupabaseConnectionError } from "./components/SupabaseConnectionError";

const queryClient = new QueryClient();

const App = () => {
  if (!supabase) {
    return <SupabaseConnectionError />;
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clientes" element={<Clients />} />
                  <Route path="/agendamentos" element={<Appointments />} /> {/* ✅ Verificar se esta rota existe */}
                  <Route path="/pacotes" element={<Packages />} />
                  <Route path="/servicos" element={<Services />} />
                  <Route path="/estoque" element={<Inventory />} />
                  <Route path="/financeiro" element={<Finance />} />
                  <Route path="/configuracoes" element={<Settings />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;