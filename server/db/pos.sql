-- POS module schema

-- categories for menu
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- menu items
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2) NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- variants for items (e.g., sizes)
CREATE TABLE item_variants (
  id SERIAL PRIMARY KEY,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  additional_price NUMERIC(10,2) DEFAULT 0
);

-- dining tables
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'vacant', -- vacant, occupied, billed
  created_at TIMESTAMP DEFAULT NOW()
);

-- orders
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id INTEGER REFERENCES tables(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'open', -- open, completed, cancelled
  total NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- order items
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  variant_id INTEGER REFERENCES item_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS policies for new tables

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_tenant ON categories
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY menu_items_tenant ON menu_items
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE item_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY variants_tenant ON item_variants
  USING (
    menu_item_id IN (
      SELECT id FROM menu_items WHERE restaurant_id = current_setting('app.current_restaurant')::int
    )
  );

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY tables_tenant ON tables
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_tenant ON orders
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_tenant ON order_items
  USING (
    order_id IN (
      SELECT id FROM orders WHERE restaurant_id = current_setting('app.current_restaurant')::int
    )
  );
