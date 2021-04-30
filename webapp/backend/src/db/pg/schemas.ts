import {DatabasePoolType, sql} from 'slonik';

interface schema {
  column_name: string;
  data_type: string;
  is_nullable: string;
  udt_name: string;
}

interface schemas {
  event: Record<string, schema>;
  dump: Record<string, schema>;
}

function get_query(col: string) {
  return sql`
    SELECT column_name, data_type, is_nullable, udt_name
    FROM information_schema.columns
    WHERE table_name=${col}`;
}

function rowsToMap(rows: schema[]) {
  const map = {} as {
    [key: string]: schema;
  };
  rows.forEach(x => {
    map[x.column_name] = x;
  });
  return map;
}

async function get_schemas(pool: DatabasePoolType, output: schemas) {
  const eventQuery = get_query('event');
  const dumpQuery = get_query('dump');

  const eventResp = await pool.query(eventQuery);
  const dumpResp = await pool.query(dumpQuery);

  const eventRows = (eventResp.rows as unknown) as schema[];
  const dumpRows = (dumpResp.rows as unknown) as schema[];

  const eventMap = rowsToMap(eventRows);
  const dumpMap = rowsToMap(dumpRows);

  output.event = eventMap;
  output.dump = dumpMap;
}

export default get_schemas;
export {schemas};
