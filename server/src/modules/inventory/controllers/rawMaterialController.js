const RawMaterial = require('../models/rawMaterial');

async function list(req, res, next) {
  try {
    const result = await RawMaterial.getAll(req.restaurantId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, unit_id } = req.body;
    const result = await RawMaterial.create(req.restaurantId, { name, unit_id });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, unit_id } = req.body;
    const result = await RawMaterial.update(req.restaurantId, id, { name, unit_id });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await RawMaterial.remove(req.restaurantId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
