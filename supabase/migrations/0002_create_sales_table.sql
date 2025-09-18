-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC(10, 2) NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (REQUIRED for security)
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Create policies for each operation
CREATE POLICY "sales_select_policy" ON public.sales 
FOR SELECT USING (true);

CREATE POLICY "sales_insert_policy" ON public.sales 
FOR INSERT WITH CHECK (true);

CREATE POLICY "sales_update_policy" ON public.sales 
FOR UPDATE USING (true);

CREATE POLICY "sales_delete_policy" ON public.sales 
FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_updated_at_trigger
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sales_updated_at();

-- Insert sample data
INSERT INTO public.sales (client_id, client_name, items, total, payment_method, notes) VALUES
(1, 'Ana Silva', '[{"type": "service", "item_id": 1, "itemName": "Limpeza de Pele", "price": 150.00, "quantity": 1}]', 150.00, 'cartao', 'Cliente satisfeita com o serviço'),
(2, 'Beatriz Costa', '[{"type": "package", "item_id": 1, "itemName": "Pacote Bronze", "price": 300.00, "quantity": 1}]', 300.00, 'pix', 'Pacote de 3 sessões');