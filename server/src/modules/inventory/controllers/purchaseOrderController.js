const PO = require('../models/purchaseOrder');
const POI = require('../models/purchaseOrderItem');

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
    const result = await PO.update(req.tenant.id, req.params.id, req.body);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
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
