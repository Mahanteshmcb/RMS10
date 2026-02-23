# Restaurant Management System (RMS)

This repository contains a modular, multi-tenant Restaurant Management System.

The architecture follows a domain-based structure with a Node.js/Express backend and a React frontend.

## Project Structure

- `/server` - Backend sources
- `/client` - Frontend sources

Refer to project planning documents for development phases and roadmap.

## Phase 1: Multi-tenant Foundation

1. Run `psql -f server/db/init.sql` after creating your database to seed tables.
2. Backend helpers in `src/config` and `src/core` include:
   - `db.js` (PG pool)
   - `auth/jwt` for JWT sign/verify and middleware
   - `middleware/tenantHandler.js` and `featureFlagCheck.js`
3. Create restaurants via Super Admin script (to be added) which will also insert default module flags.
4. Protect routes with `authMiddleware` then `tenantHandler`, e.g.:  
   `app.use('/api/inventory', authMiddleware, tenantHandler, checkModule('inventory'), inventoryRouter);
`

### Creating a Restaurant (Super Admin)

Run the helper script after the database is up:

```bash
cd server
node src/scripts/createRestaurant.js "My Resto"
```

It will insert a row in `restaurants` and default modules (pos, inventory, etc.).

### Quick API Test

1. Create a user manually in the `users` table (hash passwords with bcrypt or similar).
2. Issue a JWT containing `{userId, restaurantId, role}` and attach it as `Bearer` token.
3. Request `GET /api/pos/test` with header `x-restaurant-id` set or encoded in the token to verify middleware.

