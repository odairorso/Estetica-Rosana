-- Migração para atualizar o schema da tabela packages
-- Adicionar colunas que estão faltando

-- Adicionar coluna client_name se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'packages' 
        AND column_name = 'client_name'
    ) THEN
        ALTER TABLE packages ADD COLUMN client_name text;
    END IF;
END $$;

-- Adicionar coluna session_history se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'packages' 
        AND column_name = 'session_history'
    ) THEN
        ALTER TABLE packages ADD COLUMN session_history jsonb DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Garantir que a coluna session_history tenha o valor padrão correto para registros existentes
UPDATE packages 
SET session_history = '[]'::jsonb 
WHERE session_history IS NULL;

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN packages.client_name IS 'Nome do cliente (desnormalizado para facilitar consultas)';
COMMENT ON COLUMN packages.session_history IS 'Histórico de sessões realizadas no formato JSON';

-- Atualizar client_name baseado no client_id se possível
UPDATE packages 
SET client_name = clients.name 
FROM clients 
WHERE packages.client_id = clients.id 
AND packages.client_name IS NULL;