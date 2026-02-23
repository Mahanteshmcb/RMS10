# Restaurant Management System (RMS)

This repository contains a modular, multi-tenant Restaurant Management System.

The architecture follows a domain-based structure with a Node.js/Express backend and a React frontend.

## Project Structure

- `/server` - Backend sources
- `/client` - Frontend sources

Refer to project planning documents for development phases and roadmap.

## Setup Instructions

1. Copy `.env.example` to `.env` and update values (database URL, JWT secret).
2. Run `npm install` in both `/server` and `/client` directories.
3. Initialize the PostgreSQL database and apply schema:
   ```bash
   psql -f server/db/init.sql
   ```
4. Start backend: `cd server && npm run dev` (requires nodemon).
5. Start frontend: `cd client && npm run dev` (Vite server).

## Phase 1: Multi-tenant Foundation

1. Run `psql -f server/db/init.sql` after creating your database to seed tables.

   *init.sql* now enables row-level security (RLS) on tenant tables and defines
   policies based on the `app.current_restaurant` configuration variable.

2. Backend helpers in `src/config` and `src/core` include:
   - `db.js` (PG pool) now exports `query()` and `withTenant(restaurantId, cb)`.
     Use `withTenant` when you want the database to enforce the restaurant
     constraint automatically via RLS:
     ```js
     await db.withTenant(req.restaurantId, async client => {
       const { rows } = await client.query('SELECT * FROM users');
       // RLS will ensure only rows for this restaurant are visible
     });
     ```
   - `auth/jwt` for JWT sign/verify and middleware
   - `middleware/tenantHandler.js` and `featureFlagCheck.js`
3. Create restaurants via Super Admin script (to be added) which will also insert default module flags.
4. Protect routes with `authMiddleware` then `tenantHandler`, e.g.:  
   `app.use('/api/inventory', authMiddleware, tenantHandler, checkModule('inventory'), inventoryRouter);
`

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

### WebSockets Support

The server now includes a basic Socket.io setup (`io` instance in `app.js`) so
real-time channels are available later.  During Phase 3 we'll add namespaces,
event listeners, and emitters (e.g. `ORDER_CREATED`).

### Event Bus

An internal event bus (`src/core/events/eventBus.js`) is used to decouple
modules.  The POS `orderController` emits `ORDER_CREATED` with payload
`{ restaurantId, orderId, items }` whenever an order is placed.  Other
modules (inventory, KDS) can subscribe:

```js
const bus = require('./core/events/eventBus');
bus.on('ORDER_CREATED', ({ restaurantId, orderId, items }) => {
  // react accordingly
});
```

Clients can connect with:

```js
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
socket.on('connect', () => console.log('connected', socket.id));
```

