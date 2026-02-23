const PO = require('../models/purchaseOrder');
const POI = require('../models/purchaseOrderItem');
const db = require('../../../config/db');

// purchase order CRUD
exports.list = async (req, res) => {
  try {
    const result = await PO.getAll(req.tenant.id);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing purchase orders', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await PO.create(req.tenant.id, req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating purchase order', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const result = await PO.getById(req.tenant.id, req.params.id);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching purchase order', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    // check for status transition to received
    const prev = await PO.getById(req.tenant.id, req.params.id);
    const result = await PO.update(req.tenant.id, req.params.id, req.body);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const updated = result.rows[0];
    const previous = prev.rows[0];

    if (updated.status === 'received' && previous && previous.status !== 'received') {
      // add quantities to inventory stock
      await db.withTenant(req.tenant.id, async client => {
        const itemsRes = await client.query(
          'SELECT raw_material_id, quantity FROM purchase_order_items WHERE purchase_order_id=$1',
          [req.params.id]
        );
        for (const row of itemsRes.rows) {
          await client.query(
            `INSERT INTO inventory_stock (restaurant_id, raw_material_id, quantity)
             VALUES ($1,$2,$3)
             ON CONFLICT (restaurant_id, raw_material_id) DO UPDATE
             SET quantity = inventory_stock.quantity + EXCLUDED.quantity, updated_at = NOW()`,
            [req.tenant.id, row.raw_material_id, row.quantity]
          );
        }
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating purchase order', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    await PO.delete(req.tenant.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting purchase order', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// items within order
exports.listItems = async (req, res) => {
  try {
    const result = await POI.listByOrder(req.tenant.id, req.params.orderId);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing PO items', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.addItem = async (req, res) => {
  try {
    const data = { ...req.body, purchase_order_id: req.params.orderId };
    const result = await POI.add(req.tenant.id, data);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding PO item', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const result = await POI.update(req.tenant.id, req.params.itemId, req.body);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating PO item', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    await POI.delete(req.tenant.id, req.params.itemId);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting PO item', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
