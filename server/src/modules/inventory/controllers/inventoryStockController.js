const Stock = require('../models/inventoryStock');

async function list(req, res, next) {
  try {
    const result = await Stock.getAll(req.restaurantId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function upsert(req, res, next) {
  try {
    const { raw_material_id, quantity, threshold } = req.body;
    const result = await Stock.upsert(req.restaurantId, { raw_material_id, quantity, threshold });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function low(req, res, next) {
  try {
    const result = await Stock.getLow(req.restaurantId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, upsert, low };
module.exports = { list, upsert };