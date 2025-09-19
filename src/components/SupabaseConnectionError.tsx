<<<<<<< HEAD
import React from 'react';

export const SupabaseConnectionError = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontFamily: 'sans-serif',
      textAlign: 'center'
    }}>
      <div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Erro de Conexão</h1>
        <p style={{ fontSize: '1.2rem' }}>
          Não foi possível conectar ao banco de dados (Supabase).
        </p>
        <p style={{ marginTop: '0.5rem', color: '#aaa' }}>
          Verifique as variáveis de ambiente (.env) e a sua conexão com a internet.
        </p>
      </div>
    </div>
  );
};
=======
import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";

export function SupabaseConnectionError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <GlassCard className="max-w-2xl text-center py-12 px-8">
        <div className="space-y-4">
          <AlertTriangle className="mx-auto h-16 w-16 text-destructive" />
          <h1 className="font-bold text-2xl text-destructive">Erro de Conexão</h1>
          <p className="text-muted-foreground text-lg">
            O aplicativo não conseguiu se conectar ao banco de dados (Supabase).
          </p>
          <div className="text-left bg-muted/50 p-4 rounded-lg text-sm space-y-2">
            <p className="font-semibold">Como resolver:</p>
            <p>
              <strong>1. Em ambiente de produção (Vercel):</strong> Verifique se as variáveis de ambiente{" "}
              <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> foram adicionadas
              corretamente nas configurações do projeto e se um "Redeploy" foi feito após a alteração.
            </p>
            <p>
              <strong>2. Em ambiente local:</strong> Certifique-se de que o arquivo <code>.env.local</code> existe na raiz do projeto e contém as chaves corretas.
            </p>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Se o problema persistir, verifique o status do seu projeto no painel do Supabase.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
>>>>>>> 1be9b827db6afc3e4a1a015d739fa37e6574b522
