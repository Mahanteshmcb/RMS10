const Report = require('../models/report');
const Dashboard = require('../models/dashboard');

exports.sales = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || '1970-01-01';
    const endDate = end || new Date().toISOString();
    const result = await Report.salesByDay(req.tenant.id, startDate, endDate);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching sales report', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.topItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await Report.topMenuItems(req.tenant.id, limit);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching top items report', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.summary = async (req, res) => {
  try {
    const data = await Dashboard.summary(req.tenant.id);
    res.json(data);
  } catch (err) {
    console.error('Error fetching dashboard summary', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.activeOrders = async (req, res) => {
  try {
    const result = await Dashboard.activeOrders(req.tenant.id);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching active orders', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.revenueByCategory = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || '1970-01-01';
    const endDate = end || new Date().toISOString();
    const result = await Report.revenueByCategory(req.tenant.id, startDate, endDate);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching revenue by category', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.paymentMethods = async (req, res) => {
  try {
    const { start, end } = req.query;
    const startDate = start || '1970-01-01';
    const endDate = end || new Date().toISOString();
    const result = await Report.paymentMethods(req.tenant.id, startDate, endDate);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching payment methods', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.upload = async (req, res) => {
  try {
    // expecting { name, payload } in body
    const { name, payload } = req.body;
    if (!name || !payload) {
      return res.status(400).json({ error: 'name and payload required' });
    }
    const result = await Report.saveUpload(req.tenant.id, name, payload);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving upload', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUploads = async (req, res) => {
  try {
    const result = await Report.getUploads(req.tenant.id);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching uploads', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
