import Koa = require('koa');
import bodyParser = require('koa-bodyparser');
import morgan = require('koa-morgan');
import {RouterContext} from '@koa/router';
import {Next} from 'koa';
import Database from './db/getDatabase';

if (Database === undefined) {
  throw 'Database is missing';
}

const app = new Koa();

app.use(morgan('dev'));
app.use(bodyParser());

app.use(async (ctx: RouterContext, next: Next) => {
  console.log('Body parsed', ctx.request.body);
  const query = await Database?.stateVpn(1615397401, '64497:1');
  console.log(query);
  // const query = knex<BMPDump>('dump')
  //   .select('*')
  //   .where('timestamp', '<', 1615397401);
  // const res = await query;
  // console.log(res, query.toString());
  await next();
});

app.listen(3000);
