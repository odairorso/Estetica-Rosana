-- Create sales table for cashier system
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('dinheiro', 'cartao', 'pix')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policies for sales table
CREATE POLICY "sales_select_policy" ON sales FOR SELECT USING (true);
CREATE POLICY "sales_insert_policy" ON sales FOR INSERT WITH CHECK (true);
CREATE POLICY "sales_update_policy" ON sales FOR UPDATE USING (true);
CREATE POLICY "sales_delete_policy" ON sales FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_sales_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sales_updated_at_trigger
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_updated_at();