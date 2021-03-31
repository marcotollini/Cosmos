import {createPool} from 'slonik';

interface slonikConfig {
  maximumPoolSize?: number;
}

function create_slonik() {
  const connectionUri = process.env.PGURI;
  if (connectionUri === undefined) throw 'PGURI not found in env';
  const configuration: slonikConfig = {};

  if (process.env.PGPOOLMAX) {
    configuration.maximumPoolSize = parseInt(process.env.PGPOOLMAX);
  }

  const pool = createPool(connectionUri, configuration);

  return pool;
}

export default create_slonik;
