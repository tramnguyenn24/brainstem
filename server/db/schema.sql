-- Basic schema to support current modules (simplified)

create table if not exists channels (
  id serial primary key,
  name text not null,
  type text,
  status text default 'active'
);

create table if not exists staff (
  id serial primary key,
  name text not null,
  role text,
  status text default 'active',
  department text
);

create table if not exists campaigns (
  id serial primary key,
  name text not null,
  status text default 'running',
  channel_id int references channels(id) on delete set null,
  owner_staff_id int references staff(id) on delete set null,
  budget numeric,
  spend numeric,
  roi numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists leads (
  id serial primary key,
  full_name text,
  email text,
  phone text,
  status text,
  interest_level text,
  campaign_id int references campaigns(id) on delete set null,
  channel_id int references channels(id) on delete set null,
  assigned_staff_id int references staff(id) on delete set null,
  form_id int references forms(id) on delete set null,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists students (
  id serial primary key,
  full_name text,
  email text,
  phone text,
  status text,
  enrollment_status text,
  campaign_id int references campaigns(id) on delete set null,
  channel_id int references channels(id) on delete set null,
  assigned_staff_id int references staff(id) on delete set null,
  new_student boolean default false,
  source_lead_id int references leads(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists forms (
  id serial primary key,
  name text not null,
  status text,
  fields jsonb,
  settings jsonb,
  embed_code text,
  campaign_id int references campaigns(id) on delete set null,
  created_by_staff_id int references staff(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);


