import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

interface GlassCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ title, children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <Card 
      className={cn(
        "card-glass border-border/30",
        hover && "hover-lift cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-gradient-brand">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : ""}>
        {children}
      </CardContent>
    </Card>
  );
}