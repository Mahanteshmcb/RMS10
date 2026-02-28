const Dashboard = require('./src/modules/reporting/models/dashboard');
(async () => {
  try {
    const res = await Dashboard.summary(1);
    console.log('summary result:', res);
  } catch (err) {
    console.error('dashboard error:', err);
    console.error(err.stack);
  } finally {
    process.exit(0);
  }
})();
