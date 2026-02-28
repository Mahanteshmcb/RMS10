# Restaurant Management System (RMS)

This repository contains a modular, multi-tenant Restaurant Management System.

The architecture follows a domain-based structure with a Node.js/Express backend and a React frontend.

## Project Structure

- `/server` - Backend sources
- `/client` - Frontend sources

Refer to project planning documents for development phases and roadmap.

## Setup Instructions

### Quick Start (Docker Recommended)

1. **Clone and install:**
   ```bash
   git clone <repo-url>
   cd RMS10
   npm install --prefix server
   npm install --prefix client
   ```
   > 💡 After editing `vite.config.js` or changing client packages, restart the
   > frontend server (`npm run dev`) so the proxy takes effect.

2. **Start PostgreSQL with Docker Compose:**
   ```bash
   docker-compose up -d
   ```
   This will:
   - Start PostgreSQL on port 5434
   - Automatically initialize the database schema
   - Create a volume for data persistence

3. **Seed database with test data:**
   ```bash
   cd server
   npm install # in case new dependencies like qrcode were added
   node src/scripts/seedData.js
   ```
   This creates:
   - 1 demo restaurant (slug generated from name)
   - 4 test users (admin, manager, waiter, chef)
   - 4 menu categories with 9 items
   - 6 dining tables
   - Inventory materials and stock

   You can create additional restaurants via the CLI or `/api/admin/restaurants`.
   Each restaurant has an `id` and `slug` which are exposed on public listings.
   Multiple restaurants will appear on the home page for guests and users.

   **Note:** If you restored from an earlier database, you may need to add the
   `slug` column manually (see schema comments above) and populate values.

4. **Start both servers:**
   
   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm start
   ```
   Backend runs on `http://localhost:3000`

   **Terminal 2 - Frontend:**
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on `http://localhost:5173` (or 5174 if 5173 is busy)

5. **Log in with test credentials:**
   - Username: `admin` | Password: `admin123`
   - Or any of: manager/manager123, waiter/waiter123, chef/chef123

### Manual Setup (Without Docker)

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb -U postgres rms
   ```
3. Initialize schema:
   ```bash
   psql -U postgres -d rms -f server/db/init.sql
   psql -U postgres -d rms -f server/db/pos.sql
   psql -U postgres -d rms -f server/db/inventory.sql
   ```
4. Create `.env` file in `/server`:
   ```
   DATABASE_URL=postgres://postgres:password@localhost:5432/rms
   JWT_SECRET=your-secret-key-here
   PORT=3000
   ```
5. Run seed script:
   ```bash
   cd server
   node src/scripts/seedData.js
   ```
6. Start servers as in steps 4-5 above

## Current Progress Summary


### Completed Phases

**Phase 1: Multi-tenant Foundation** ✅
- PostgreSQL-based multi-tenant architecture with Row-Level Security (RLS)
- JWT authentication framework
- Tenant isolation via `app.current_restaurant` setting
- Module enablement/disablement per restaurant

**Phase 2: POS Core** ✅
- Categories, Menu Items (with variants), Table management
- Order creation and tracking
- Order status workflow (open → completed → paid)
- Real-time order updates via Socket.io

**Phase 3: KDS (Kitchen Display System)** ✅
- Order-to-kitchen pipeline
- Line-item status tracking (pending → ready → completed)
- Real-time notifications to kitchen staff

**Phase 4: Inventory Management** ✅
- Stock tracking with quantity and threshold alerts
- Low-stock notifications via real-time channel
- Material and unit management
- Purchase order workflow

**Phase 5: Reporting & Analytics** ✅
- Sales dashboard with revenue tracking
- Category and payment method analytics
- Order performance metrics
- Data upload capability for external analysis
- Export-to-Excel functionality

**Phase 6: Frontend UI/UX** ✅
- Sidebar navigation with 7 main pages: Home, Tables, Kitchen, Menu, Inventory, Reports, Settings
- Tables management with status and reservation toggles
- Menu browsing with categories and search
- Kitchen display with real-time order updates
- Inventory stock view
- Reports dashboard with charts
- Settings for configuration
- Login page with JWT token management

### Currently Running

- **Backend:** Node.js/Express server on `http://localhost:3000`
  - Health endpoint: `GET /health`
  - Auth endpoints: `POST /api/auth/login`, `POST /api/auth/register`
  - API routes: `/api/pos/`, `/api/inventory/`, `/api/reporting/`
  - Admin routes: `POST /api/admin/restaurants`

- **Frontend:** Vite dev server on `http://localhost:5173`
  - All 7 pages visible in sidebar
  - Tables CRUD with real-time Socket.io updates
  - Menu browsing, Kitchen orders display
  - Reports with charts and export
  - Temporarily disabled auth on table routes for testing

### Known Issues & Next Steps

1. **Database Connectivity**
   - PostgreSQL must be running on the URL specified in `.env`
   - If not available, API endpoints return HTTP 500 with error details
   - All database schema files pre-exist: `db/init.sql`, `db/pos.sql`, `db/inventory.sql`

2. **Authentication Flow**
   - Auth is currently **disabled on table routes** for easier testing
   - JWT login endpoint works but needs test data (restaurant + user in DB)
   - Auth header is added by frontend but middleware is commented out
   - **Action:** Once DB is live, re-enable auth or seed a test user via admin endpoint

3. **Pages in Development State**
   - Menu: Shows categories and items from API (needs data)
   - Kitchen: Real-time KDS display (backend ready)
   - Inventory: Stock view page (backend ready)
   - Settings: Module toggles, user management (UI framework in place)
   - Addons: Placeholder only

4. **Testing Recommendations**
   - Spin up PostgreSQL (Docker or local install)
   - Run `psql -f server/db/init.sql` to initialize schema
   - Use `/api/admin/restaurants` endpoint to create a test restaurant
   - Create a user via `/api/auth/register` or manually in the DB
   - Log in via Login page to receive JWT token
   - Proceed with Tables, Menu, Kitchen, Inventory, Reports testing

### Architecture Highlights

- **Real-time:** Socket.io namespaces for POS (`/kds`, `/waiter`, `/inventory`)
- **Modular:** Separate modules for POS, Inventory, Reporting
- **Event-driven:** Internal event bus for order and inventory events
- **Responsive UI:** Tailwind CSS for all frontend pages
- **Data Export:** XLSX and CSV support for reporting

### File Structure

```
RMS10/
├── server/
│   ├── src/
│   │   ├── app.js (entry point, route definitions)
│   │   ├── config/ (database, logging)
│   │   ├── core/ (auth, middleware, event bus)
│   │   ├── modules/ (pos, inventory, reporting)
│   │   ├── routes/ (auth, superAdmin)
│   │   └── scripts/ (createRestaurant, createUser)
│   └── db/
│       ├── init.sql (restaurants, users, module_config)
│       ├── pos.sql (tables, orders, line_items, categories, menu_items)
│       └── inventory.sql (materials, stock, purchase_orders, recipes)
├── client/
│   └── src/
│       ├── App.jsx (routing)
│       ├── pages/ (Home, Tables, Menu, Kitchen, Settings, Login, etc.)
│       ├── components/ (MainLayout, sidebar nav)
│       └── assets/ (styles)
└── README.md (this file)
```


### Creating a Restaurant (Super Admin)

You can either run the CLI helper or use the new REST endpoint.

**CLI:**

```bash
cd server
node src/scripts/createRestaurant.js "My Resto"
```

**HTTP:**

```http
POST /api/admin/restaurants
Content-Type: application/json

{ "name": "My Resto" }
```

Both methods insert the restaurant and default module flags.

> ⚠️ The `/api/admin` endpoint is currently unprotected; add authentication
> before using in a real system.

### Quick API Test

1. Create a user via the new auth API or manually:
   ```http
   POST /api/auth/register
   Content-Type: application/json

   { "username": "alice", "password": "secret", "role": "owner", "restaurantId": 1 }
   ```
   (you can also use `src/scripts/createUser.js` later)
2. Log in to receive a JWT:
   ```http
   POST /api/auth/login
   Content-Type: application/json

   { "username": "alice", "password": "secret" }
   ```
   Response: `{ "token": "<jwt>" }`.
3. Send the token as `Authorization: Bearer <jwt>` and/or set `x-restaurant-id` header when calling protected APIs.
4. Example: `GET /api/pos/test` should return enabled message if the token and headers are correct.

### Public Browsing & QR Codes

- **List restaurants:** `GET /api/public/restaurants` returns `{id,name,slug}` for all enabled restaurants. Make sure your frontend has Vite proxy configured (`/api` → `http://localhost:3000`).
- **Menu page:** users can visit `/r/:slug` on the frontend or call `GET /api/public/restaurants/:slug` to fetch the menu and categories.
- **Restaurant QR code:** `GET /api/public/qr/restaurant/:slug` returns a PNG with a link to `/r/:slug`.
- **Table QR code:** `GET /api/public/qr/restaurant/:slug/table/:tableId` returns a PNG linking to `/r/:slug?table=<id>`.

Frontend exposes:

- `/public/restaurants` page with links to each restaurant.
- `/r/:slug` public menu page that also displays its own QR code for sharing.

These pages are unauthenticated; customers can browse menus, scan table codes,
and place orders if the ordering UI is enabled.

### WebSockets Support

The server now includes a basic Socket.io setup (`io` instance in `app.js`) so
real-time channels are available later.  During Phase 3 we'll add namespaces,
event listeners, and emitters (e.g. `ORDER_CREATED`).

### Event Bus

An internal event bus (`src/core/events/eventBus.js`) is used to decouple
modules.  The POS `orderController` emits `ORDER_CREATED` with payload
`{ restaurantId, orderId, items }` whenever an order is placed. It also emits
`ORDER_COMPLETED` when an order status becomes `completed`.  Other
modules (inventory, KDS) can subscribe:

```js
const bus = require('./core/events/eventBus');
bus.on('ORDER_CREATED', ({ restaurantId, orderId, items }) => {
  // react accordingly
});
```

### POS API Endpoints

Endpoints under `/api/pos` (all require authentication, tenant header/token,
and `checkModule('pos')` feature flag):

- `GET /categories`        – list categories
- `POST /categories`       – create category
- `PUT /categories/:id`     – update category
- `DELETE /categories/:id`  – remove category

- `GET /menu-items`         – list menu items with category
- `POST /menu-items`        – create menu item
- `GET /menu-items/:id`      – show menu item
- `PUT /menu-items/:id`      – update menu item
- `DELETE /menu-items/:id`   – delete menu item
- `GET /menu-items/:menuItemId/variants` – list variants
- `POST /menu-items/:menuItemId/variants` – add variant
- `PUT /menu-items/variants/:variantId` – update variant
- `DELETE /menu-items/variants/:variantId` – remove variant

- `GET /tables`             – list dining tables
- `POST /tables`            – create table
- `PUT /tables/:id`         – update table (name/status/seats). status can be `vacant`, `occupied`, `billed`, or `reserved`.
- `DELETE /tables/:id`      – delete table

- `GET /orders`             – list orders
- `GET /orders/:id`         – view order with line items
- `POST /orders`            – create order (tableId + items[])
- `PUT /orders/:id/status`  – change order status (open/completed/cancelled)
- `POST /orders/:id/pay`     – mark order paid (completes order and frees table)

### KDS Endpoints

- `GET /kds/orders` – list active orders with pending items (for KDS display)
- `POST /kds/items/:itemId/ready` – mark a line item ready; emits `item_ready` to waiter namespace

### Waiter Endpoints

- `POST /orders/:id/items` – add a menu item to an open order (use role `modify_order`)

## Phase 4: Inventory & Recipe Engine

1. Apply the new schema in `server/db/inventory.sql` to your database.
2. Inventory helpers under `/server/src/modules/inventory` manage:
   - Units, raw materials, **vendors**, **purchase orders** (with items), **recipes**, stock, 
   - Stock endpoints for adjusting quantity/threshold (`/stock`)
   - **Low-stock query** available at `/stock/low` and surfaced in the UI under "Low Stock"
   - Real‑time low‑stock events are also broadcast over a `/inventory` socket.io namespace (event `low_stock`)
   - Purchase orders can be listed / created under `/purchase-orders` with nested `/items`
   - Updating an order's `status` to `received` will automatically add its item quantities to inventory stock
3. `ORDER_COMPLETED` events trigger stock deductions based on recipes.  A
   `LOW_STOCK` event is emitted when quantity < threshold.
4. Future work:
   - Build UI for linking recipes and updating inventory ✅
   - Frontend pages now support create/read/update/delete for units, materials, vendors, recipes, stock, purchase orders
   - Low-stock page and real-time alerts via socket.io
   - Inventory UI is fully functional with validation, inline editing, and real-time feedback
   - Vendor purchase order workflows
   - Low‑stock alert endpoint or email notifications

Status changes trigger events that update table occupancy/billing; paying
an order also fires `ORDER_PAID` to return the table to `vacant`.


## Phase 5: Reporting & Analytics

The reporting module aggregates sales and operational data and provides a
front-end dashboard. Key features:

- `GET /api/reporting/sales?start=&end=` – daily revenue totals.
- `GET /api/reporting/top-items?limit=` – most-sold menu items.
- Dashboard endpoints under `/api/reporting/dashboard` for:
  - `summary` (today's orders/revenue/active tables)
  - `active-orders` (open orders list)
  - `revenue-by-category` and `revenue-by-payment`

### Frontend Dashboards

The client now uses a **sidebar layout** with multiple pages:

- **Home** – overview/public entry; restaurant signup and plan selection.
- **Tables** – manage tables, chairs, occupancy and reservations.
- **Kitchen** – kitchen display for cooks (pending/ready filters).
- **Inventory** – full inventory module including low‑stock alerts.
- **Menu** – public menu listing with simple search.
- **Reports** – analytics dashboard described below.
- **Settings** – restaurant/account configuration.
- **Addons** – optional modules/plugins marketplace.

The `Reports` page (linked in navigation) shows:

- Today’s summary cards
- Active orders table with export buttons
- Dynamic charts (using Chart.js) for:
  - Sales by day (line chart)
  - Revenue by category (pie chart)
  - Revenue by payment method (pie chart)
  - Top menu items (bar chart)

Each table or dataset includes **Export** buttons that generate XLSX or CSV
files using the `xlsx` library and `file-saver`.

- A simple **Upload Data** section lets users select an Excel/CSV file, preview
  its contents, and save it to the server (stored in a `data_uploads` table).
  This provides a foundation for importing external datasets for later analysis.

> 🚀 Full control over data: choose date ranges, refresh results, and download
the raw datasets for offline analysis.

Future enhancements might include filtering, upload/import endpoints, or
custom dashboard widgets.
  // react accordingly
});
```

Clients can connect with:

```js
import { io } from 'socket.io-client';
// general namespace
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('connected', socket.id));

// kitchen namespace
const kds = io('http://localhost:3000/kds');
kds.on('new_order', data => console.log('new order', data));

// waiter namespace
const waiter = io('http://localhost:3000/waiter');
waiter.on('item_ready', data => console.log('item ready', data));
```

