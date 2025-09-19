-- Migração para garantir que a coluna session_history existe na tabela packages
-- Esta migração é idempotente (pode ser executada múltiplas vezes sem problemas)

-- Adicionar a coluna session_history se ela não existir
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

-- Garantir que a coluna tenha o valor padrão correto para registros existentes
UPDATE packages 
SET session_history = '[]'::jsonb 
WHERE session_history IS NULL;

-- Adicionar comentário para documentar a coluna
COMMENT ON COLUMN packages.session_history IS 'Histórico de sessões realizadas no formato JSON';