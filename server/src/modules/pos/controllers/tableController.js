const Table = require('../models/table');

async function list(req, res, next) {
  try {
    const result = await Table.getAll(req.restaurantId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  const { name, seats } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const result = await Table.create(req.restaurantId, name, seats);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  const { id } = req.params;
  const { name, status, seats } = req.body;
  try {
    const result = await Table.update(req.restaurantId, id, { name, status, seats });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  const { id } = req.params;
  try {
    await Table.remove(req.restaurantId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };