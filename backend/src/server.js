require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models'); // register associations
const { startScheduler } = require('./scraper/scheduler');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    // In production, prefer running migrations (schema.sql) explicitly instead of sync().
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync(); // dev convenience only
    }

    app.listen(PORT, () => {
      console.log(`Job Portal API running on port ${PORT}`);
      console.log(`Swagger docs: http://localhost:${PORT}/api/docs`);
    });

    startScheduler();
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
