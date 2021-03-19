import knex from 'knex';

function create_knex() {
  const config = {
    client: process.env.DBCLIENT,
    connection: {
      host: process.env.PGHOST,
      database: process.env.PGDATABASE,
      user: process.env.PGUSER,
      password: process.env.PGPASSWORD,
    },
    pool: {},
  };

  if (process.env.PGPOOLMAX || process.env.PGPOOLMIN) {
    const pool: {min?: number; max?: number} = {};
    if (process.env.PGPOOLMIN) pool.min = parseInt(process.env.PGPOOLMIN);
    if (process.env.PGPOOLMAX) pool.max = parseInt(process.env.PGPOOLMAX);
    config.pool = pool;
  }

  return knex(config);
}

export default create_knex;
