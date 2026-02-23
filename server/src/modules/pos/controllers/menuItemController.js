const MenuItem = require('../models/menuItem');
const Variant = require('../models/variant');

async function list(req, res, next) {
  try {
    const result = await MenuItem.getAll(req.restaurantId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function get(req, res, next) {
  try {
    const { id } = req.params;
    const result = await MenuItem.getById(req.restaurantId, id);
    if (result.rows.length === 0) return res.status(404).end();
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const result = await MenuItem.create(req.restaurantId, req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const result = await MenuItem.update(req.restaurantId, id, req.body);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    await MenuItem.remove(req.restaurantId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// variant handlers
async function listVariants(req, res, next) {
  try {
    const { menuItemId } = req.params;
    const result = await Variant.getByMenuItem(req.restaurantId, menuItemId);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function createVariant(req, res, next) {
  try {
    const { menuItemId } = req.params;
    const { name, additional_price } = req.body;
    const result = await Variant.create(req.restaurantId, menuItemId, name, additional_price);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateVariant(req, res, next) {
  try {
    const { variantId } = req.params;
    const { name, additional_price } = req.body;
    const result = await Variant.update(req.restaurantId, variantId, name, additional_price);
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function removeVariant(req, res, next) {
  try {
    const { variantId } = req.params;
    await Variant.remove(req.restaurantId, variantId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  remove,
  listVariants,
  createVariant,
  updateVariant,
  removeVariant,
};
