const Report = require('../models/report');

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
