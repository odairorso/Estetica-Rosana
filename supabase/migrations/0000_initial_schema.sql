-- Habilitar a extensão para gerar UUIDs
-- create extension if not exists "uuid-ossp" with schema "extensions";

-- Tabela de Clientes
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  cpf text,
  address jsonb,
  avatar text,
  last_visit date,
  total_visits integer default 0,
  active_packages integer default 0,
  next_appointment timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Pacotes
create table packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  client_id uuid references clients(id) on delete set null,
  client_name text,
  total_sessions integer not null,
  used_sessions integer default 0,
  price numeric not null,
  valid_until date,
  last_used date,
  status text default 'active', -- active, expiring, completed, expired
  session_history jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Serviços
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  price numeric not null,
  duration integer not null, -- in minutes
  description text,
  icon text,
  popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Agendamentos
create table appointments (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references services(id) on delete set null,
  service_name text,
  client_id uuid references clients(id) on delete set null,
  client_name text,
  client_phone text,
  date date not null,
  time text not null,
  duration integer,
  price numeric,
  notes text,
  status text default 'agendado', -- agendado, confirmado, concluido, cancelado
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Estoque
create table inventory (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity integer default 0,
  min_stock integer default 0,
  category text,
  supplier text,
  cost_price numeric,
  last_updated date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Transações Financeiras (manuais)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- income, expense
  description text not null,
  amount numeric not null,
  date date not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabela de Configurações (single row)
create table settings (
  id int primary key default 1,
  clinic_info jsonb,
  theme text default 'dark',
  constraint single_row check (id = 1)
);

-- Inserir uma linha padrão de configurações
insert into settings (id, clinic_info, theme)
values (1, '{
  "name": "Rosana Turci Estética",
  "phone": "(11) 98765-4321",
  "email": "contato@rosanaturci.com",
  "address": "Av. Paulista, 1234, São Paulo - SP"
}', 'dark');