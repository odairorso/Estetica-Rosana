import { Button } from "./button";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NeonButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function NeonButton({ 
  children, 
  onClick, 
  icon: Icon, 
  variant = "primary", 
  size = "md",
  className 
}: NeonButtonProps) {
  const baseClasses = "font-semibold transition-all duration-300 hover:scale-105";
  
  const variants = {
    primary: "bg-brand-gradient text-white neon-glow hover:shadow-lg",
    secondary: "bg-card/80 text-brand-start border border-brand-start/30 hover:bg-brand-start/10",
    outline: "border-2 border-brand-start text-brand-start hover:bg-brand-start hover:text-white"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <Button 
      onClick={onClick}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
    >
      {Icon && <Icon className="mr-2 h-4 w-4 icon-glow" />}
      {children}
    </Button>
  );
}