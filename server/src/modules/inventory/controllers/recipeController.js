const Recipe = require('../models/recipe');

exports.list = async (req, res) => {
  try {
    const result = await Recipe.getAll(req.tenant.id);
    res.json(result.rows);
  } catch (err) {
    console.error('Error listing recipes', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.create = async (req, res) => {
  try {
    const result = await Recipe.create(req.tenant.id, req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating recipe', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.get = async (req, res) => {
  try {
    const result = await Recipe.getById(req.tenant.id, req.params.id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching recipe', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    const result = await Recipe.update(req.tenant.id, req.params.id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating recipe', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    await Recipe.delete(req.tenant.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting recipe', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};