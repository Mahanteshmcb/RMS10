const Category = require('../models/category');

async function list(req, res, next) {
  try {
    const result = await Category.getAll(req.restaurantId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const result = await Category.create(req.restaurantId, name);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
