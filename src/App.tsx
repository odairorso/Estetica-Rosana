import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Appointments from "./pages/Appointments";
import Packages from "./pages/Packages";
import Services from "./pages/Services"; // CORRIGIDO - era Procedures
import Inventory from "./pages/Inventory";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Cashier from "./pages/Cashier";
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
                  <Route path="/agendamentos" element={<Appointments />} />
                  <Route path="/pacotes" element={<Packages />} />
                  <Route path="/caixa" element={<Cashier />} />
                  <Route path="/servicos" element={<Services />} /> {/* CORRIGIDO */}
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