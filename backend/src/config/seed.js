require('dotenv').config();
const sequelize = require('./db');
const { Role, User } = require('../models');
const { hashPassword } = require('../utils/authUtils');

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const name of ['ADMIN', 'EMPLOYER', 'CANDIDATE']) {
    await Role.findOrCreate({ where: { name } });
  }

  const adminRole = await Role.findOne({ where: { name: 'ADMIN' } });
  const [admin, created] = await User.findOrCreate({
    where: { email: 'admin@jobportal.com' },
    defaults: {
      name: 'System Admin',
      password_hash: await hashPassword('Admin@12345'),
      role_id: adminRole.id,
    },
  });

  console.log(created ? 'Admin user created: admin@jobportal.com / Admin@12345' : 'Admin user already exists');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
