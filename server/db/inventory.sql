-- Inventory & Recipe schema

-- units (kg, liter, piece, etc.)
CREATE TABLE units (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  abbreviation TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- raw materials (ingredients)
CREATE TABLE raw_materials (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_id INTEGER REFERENCES units(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- vendors
CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- purchase orders
CREATE TABLE purchase_orders (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  vendor_id INTEGER REFERENCES vendors(id),
  order_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending', -- pending, received
  created_at TIMESTAMP DEFAULT NOW()
);

-- purchase order items
CREATE TABLE purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  raw_material_id INTEGER NOT NULL REFERENCES raw_materials(id),
  quantity NUMERIC(10,2) NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL
);

-- inventory stock
CREATE TABLE inventory_stock (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  raw_material_id INTEGER NOT NULL REFERENCES raw_materials(id),
  quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
  threshold NUMERIC(10,2) DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- recipes: menu item to raw material link
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  raw_material_id INTEGER NOT NULL REFERENCES raw_materials(id),
  amount NUMERIC(10,2) NOT NULL,
  unit_id INTEGER REFERENCES units(id)
);

-- RLS policies (similar pattern as above)

ALTER TABLE units ENABLE ROW LEVEL SECURITY;
CREATE POLICY units_tenant ON units
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
CREATE POLICY materials_tenant ON raw_materials
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY vendors_tenant ON vendors
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY po_tenant ON purchase_orders
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY poi_tenant ON purchase_order_items
  USING (purchase_order_id IN (SELECT id FROM purchase_orders WHERE restaurant_id = current_setting('app.current_restaurant')::int));

ALTER TABLE inventory_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY stock_tenant ON inventory_stock
  USING (restaurant_id = current_setting('app.current_restaurant')::int);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
CREATE POLICY recipes_tenant ON recipes
  USING (restaurant_id = current_setting('app.current_restaurant')::int);
