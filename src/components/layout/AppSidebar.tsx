import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users2,
  CalendarClock,
  Package2,
  ShoppingCart,
  Sparkles,
  Boxes,
  CreditCard,
  Settings2,
} from "lucide-react";
import logoUrl from "@/assets/logo-rosana.jpg";

const items = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Clientes", url: "/clientes", icon: Users2 },
  { title: "Agendamentos", url: "/agendamentos", icon: CalendarClock },
  { title: "Pacotes", url: "/pacotes", icon: Package2 },
  { title: "Caixa", url: "/caixa", icon: ShoppingCart },
  { title: "Procedimentos", url: "/servicos", icon: Sparkles },
  { title: "Estoque", url: "/estoque", icon: Boxes },
  { title: "Financeiro", url: "/financeiro", icon: CreditCard },
  { title: "Configurações", url: "/configuracoes", icon: Settings2 },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-brand-gradient text-white font-medium shadow-lg neon-glow" 
      : "hover:bg-brand-start/10 hover:text-brand-start transition-all duration-200";

  return (
    <Sidebar collapsible="icon" className="bg-brand-gradient border-none">
      <div className="px-3 py-4 bg-white/10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <img
            src={logoUrl}
            alt="Logo Rosana Turci Estética e Cosmetologia"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-white/30 shadow-lg"
            loading="lazy"
          />
          {!collapsed && (
            <div>
              <p className="font-semibold leading-none text-white">Rosana Turci</p>
              <p className="text-xs text-white/70">Estética & Cosmetologia</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="bg-transparent">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 font-medium">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavCls({ isActive: isActive(item.url) })} rounded-lg mx-2 my-1`}
                    >
                      <item.icon className={`mr-2 h-4 w-4 ${
                        isActive(item.url) ? "icon-glow" : ""
                      }`} />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export default AppSidebar;
