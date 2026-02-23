const Unit = require('../models/unit');

async function list(req, res, next) {
  try {
    const result = await Unit.getAll(req.restaurantId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { name, abbreviation } = req.body;
    const result = await Unit.create(req.restaurantId, { name, abbreviation });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { name, abbreviation } = req.body;
    const result = await Unit.update(req.restaurantId, id, { name, abbreviation });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await Unit.remove(req.restaurantId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove };
