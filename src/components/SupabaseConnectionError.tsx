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