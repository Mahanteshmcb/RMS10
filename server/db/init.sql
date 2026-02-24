-- Initial schema for RMS multi-tenant setup

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE module_config (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  module TEXT NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  UNIQUE(restaurant_id, module)
);

-- enable row level security on tables that store per-restaurant data

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_tenant_isolation ON users
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE module_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY modules_tenant_isolation ON module_config
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

-- Future tables (e.g. menu_items, orders) should also activate RLS

-- helpers for setting tenant (optional):
-- SELECT set_config('app.current_restaurant','<id>', false);

-- generic data uploads (JSON blobs) for reporting or external imports
CREATE TABLE data_uploads (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE data_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY data_uploads_tenant ON data_uploads
  USING (restaurant_id = current_setting('app.current_restaurant')::int);
